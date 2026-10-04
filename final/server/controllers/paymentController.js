import crypto from "crypto";
import Appointment from "../models/Appointment.js";
import Payment from "../models/Payment.js";
import { sendNotification, appointmentNotification } from "../utils/notificationService.js";

const RAZORPAY_BASE = "https://api.razorpay.com/v1";

function config() {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) throw new Error("Razorpay is not configured. Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to server/.env.");
  return { keyId, keySecret };
}

function authHeader(keyId, keySecret) {
  return `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString("base64")}`;
}

async function razorpayRequest(path, options = {}) {
  const { keyId, keySecret } = config();
  const response = await fetch(`${RAZORPAY_BASE}${path}`, {
    ...options,
    headers: {
      Authorization: authHeader(keyId, keySecret),
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });
  const text = await response.text();
  let data = {};
  try { data = text ? JSON.parse(text) : {}; } catch { data = { error: { description: text } }; }
  if (!response.ok) throw new Error(data?.error?.description || `Razorpay request failed (${response.status}).`);
  return data;
}

function safeEqualHex(a, b) {
  if (!a || !b || a.length !== b.length) return false;
  try {
    return crypto.timingSafeEqual(Buffer.from(a, "hex"), Buffer.from(b, "hex"));
  } catch {
    return false;
  }
}

function verifyCheckoutSignature(orderId, paymentId, signature, secret) {
  const expected = crypto.createHmac("sha256", secret).update(`${orderId}|${paymentId}`).digest("hex");
  return safeEqualHex(expected, signature);
}

function amountForService(appointment) {
  const fee = Number(appointment?.service?.consultationFee ?? 0);
  if (!Number.isFinite(fee) || fee <= 0) throw new Error("The selected service does not have a valid consultation fee.");
  return Math.round(fee * 100);
}

export const createOrder = async (req, res) => {
  try {
    const appointment = await Appointment.findOne({ _id: req.params.appointmentId, patient: req.user.id })
      .populate("service", "name consultationFee consultationType")
      .populate("patient", "fullName email phone");
    if (!appointment) return res.status(404).json({ success: false, message: "Appointment not found." });
    if (appointment.status === "cancelled" || appointment.status === "completed") {
      return res.status(400).json({ success: false, message: "This appointment cannot be paid." });
    }
    if (appointment.paymentStatus === "paid") {
      return res.status(409).json({ success: false, message: "This appointment is already paid." });
    }
    if (!appointment.service?.consultationType?.[appointment.appointmentType]) {
      return res.status(400).json({ success: false, message: "The selected consultation type is not available for this service." });
    }

    const amount = amountForService(appointment);
    const receipt = `NVC-${appointment.appointmentNumber}-${Date.now()}`.slice(0, 40);
    const order = await razorpayRequest("/orders", {
      method: "POST",
      body: JSON.stringify({
        amount,
        currency: "INR",
        receipt,
        notes: {
          appointment_id: String(appointment._id),
          appointment_number: appointment.appointmentNumber,
          patient_id: String(req.user.id),
        },
        payment_capture: 1,
      }),
    });

    await Payment.create({
      appointment: appointment._id,
      patient: req.user.id,
      orderId: order.id,
      amount,
      currency: order.currency || "INR",
      status: "created",
      lastEvent: "order.created",
    });

    appointment.razorpayOrderId = order.id;
    appointment.paymentAmount = amount / 100;
    appointment.paymentStatus = "unpaid";
    await appointment.save();

    res.status(201).json({
      success: true,
      data: {
        keyId: config().keyId,
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        appointmentId: String(appointment._id),
        patient: {
          name: appointment.patient?.fullName || "",
          email: appointment.patient?.email || "",
          contact: appointment.patient?.phone ? `+91${String(appointment.patient.phone).replace(/^\+?91/, "")}` : "",
        },
        serviceName: appointment.service?.name || "Consultation",
      },
    });
  } catch (e) {
    res.status(400).json({ success: false, message: e.message });
  }
};

export const verifyPayment = async (req, res) => {
  try {
    const { razorpay_payment_id: paymentId, razorpay_signature: signature } = req.body;
    if (!paymentId || !signature) return res.status(400).json({ success: false, message: "Payment verification data is incomplete." });

    const appointment = await Appointment.findOne({ _id: req.params.appointmentId, patient: req.user.id }).populate("service", "name consultationFee consultationType");
    if (!appointment) return res.status(404).json({ success: false, message: "Appointment not found." });
    if (appointment.status === "cancelled" || appointment.status === "completed") return res.status(400).json({ success: false, message: "This appointment is no longer payable." });
    if (!appointment.service?.consultationType?.[appointment.appointmentType]) return res.status(400).json({ success: false, message: "The selected consultation type is not available for this service." });
    if (!appointment.razorpayOrderId) return res.status(400).json({ success: false, message: "No Razorpay order is linked to this appointment." });

    const { keySecret } = config();
    if (!verifyCheckoutSignature(appointment.razorpayOrderId, paymentId, signature, keySecret)) {
      return res.status(400).json({ success: false, message: "Payment signature verification failed." });
    }

    const paymentDetails = await razorpayRequest(`/payments/${encodeURIComponent(paymentId)}`);
    if (paymentDetails.order_id !== appointment.razorpayOrderId) {
      return res.status(400).json({ success: false, message: "Payment does not belong to this appointment." });
    }
    const expectedAmount = amountForService(appointment);
    if (Number(paymentDetails.amount) !== expectedAmount || paymentDetails.currency !== "INR") {
      return res.status(400).json({ success: false, message: "Payment amount or currency does not match the appointment." });
    }
    if (!["captured", "authorized"].includes(paymentDetails.status)) {
      return res.status(400).json({ success: false, message: `Payment is ${paymentDetails.status}.` });
    }

    const captured = paymentDetails.status === "captured";
    await Payment.findOneAndUpdate(
      { orderId: appointment.razorpayOrderId },
      {
        paymentId,
        signature,
        amount: expectedAmount,
        status: captured ? "captured" : "authorized",
        method: paymentDetails.method || "",
        lastEvent: "checkout.verified",
      },
      { upsert: true, new: true }
    );

    if (captured) {
      appointment.paymentStatus = "paid";
      appointment.paymentAmount = expectedAmount / 100;
      appointment.paymentMethod = paymentDetails.method || "";
      appointment.transactionId = paymentId;
      if (appointment.status === "pending") appointment.status = "confirmed";
      await appointment.save();
      const populated = await appointment.populate([
        { path: "patient", select: "fullName phone email notificationPreference" },
        { path: "doctor", select: "fullName specialization" },
        { path: "service", select: "name consultationFee duration" },
      ]);
      const notification = appointmentNotification({ user: populated.patient, appointment: populated, type: "payment" });
      void sendNotification({ user: populated.patient, preference: populated.patient?.notificationPreference, emailSubject: notification.subject, emailHtml: notification.html, smsBody: notification.sms });
    }

    res.json({
      success: true,
      message: captured ? "Payment verified and appointment confirmed." : "Payment authorized. Confirmation will follow capture.",
      data: { paymentId, status: captured ? "paid" : "authorized", appointmentStatus: appointment.status },
    });
  } catch (e) {
    res.status(400).json({ success: false, message: e.message });
  }
};

export const payAtClinic = async (req, res) => {
  try {
    const appointment = await Appointment.findOne({ _id: req.params.appointmentId, patient: req.user.id })
      .populate("service", "name consultationFee consultationType")
      .populate("doctor", "fullName specialization")
      .populate("patient", "fullName phone email notificationPreference");
    if (!appointment) return res.status(404).json({ success: false, message: "Appointment not found." });
    if (appointment.status === "cancelled" || appointment.status === "completed") return res.status(400).json({ success: false, message: "This appointment cannot be updated." });
    if (appointment.appointmentType !== "clinic" || !appointment.service?.consultationType?.clinic) {
      return res.status(400).json({ success: false, message: "Pay at clinic is available only for clinic-visit appointments." });
    }

    appointment.paymentStatus = "unpaid";
    appointment.paymentMethod = "pay_at_clinic";
    appointment.transactionId = "";
    appointment.status = "confirmed";
    await appointment.save();

    const notification = appointmentNotification({ user: appointment.patient, appointment, type: "confirmed" });
    void sendNotification({
      user: appointment.patient,
      preference: appointment.patient?.notificationPreference,
      emailSubject: notification.subject,
      emailHtml: notification.html,
      smsBody: notification.sms,
    });

    res.json({ success: true, message: "Appointment confirmed. Consultation fee is payable at the clinic.", data: appointment });
  } catch (e) { res.status(400).json({ success: false, message: e.message }); }
};

export const getPaymentStatus = async (req, res) => {
  try {
    const appointment = await Appointment.findOne({ _id: req.params.appointmentId, patient: req.user.id }).select("paymentStatus paymentAmount paymentMethod transactionId razorpayOrderId status");
    if (!appointment) return res.status(404).json({ success: false, message: "Appointment not found." });
    res.json({ success: true, data: appointment });
  } catch (e) { res.status(400).json({ success: false, message: e.message }); }
};

export const paymentWebhook = async (req, res) => {
  try {
    const signature = req.headers["x-razorpay-signature"];
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (!webhookSecret) return res.status(503).json({ success: false, message: "Webhook secret is not configured." });
    const rawBody = Buffer.isBuffer(req.body) ? req.body : Buffer.from(JSON.stringify(req.body || {}));
    const expected = crypto.createHmac("sha256", webhookSecret).update(rawBody).digest("hex");
    if (!safeEqualHex(expected, signature)) return res.status(400).json({ success: false, message: "Invalid webhook signature." });

    const payload = JSON.parse(rawBody.toString("utf8"));
    const event = payload.event || "";
    const entity = payload?.payload?.payment?.entity || payload?.payload?.order?.entity || null;
    const orderId = entity?.order_id || (event.startsWith("order.") ? entity?.id : null);
    if (!orderId) return res.status(200).json({ success: true });

    const payment = await Payment.findOne({ orderId });
    if (!payment) return res.status(200).json({ success: true });

    const paymentEntity = payload?.payload?.payment?.entity;
    const status = paymentEntity?.status === "captured" || event === "order.paid" ? "captured" : paymentEntity?.status === "failed" ? "failed" : payment.status;
    payment.status = status;
    payment.paymentId = paymentEntity?.id || payment.paymentId;
    payment.method = paymentEntity?.method || payment.method;
    payment.failureReason = paymentEntity?.error_description || payment.failureReason;
    payment.lastEvent = event;
    await payment.save();

    if (status === "captured") {
      const appointment = await Appointment.findByIdAndUpdate(payment.appointment, {
        paymentStatus: "paid",
        paymentAmount: payment.amount / 100,
        paymentMethod: payment.method || "",
        transactionId: payment.paymentId || "",
        status: "confirmed",
      }, { new: true }).populate([
        { path: "patient", select: "fullName phone email notificationPreference" },
        { path: "doctor", select: "fullName specialization" },
        { path: "service", select: "name consultationFee duration" },
      ]);
      if (appointment?.patient) {
        const notification = appointmentNotification({ user: appointment.patient, appointment, type: "payment" });
        void sendNotification({ user: appointment.patient, preference: appointment.patient.notificationPreference, emailSubject: notification.subject, emailHtml: notification.html, smsBody: notification.sms });
      }
    } else if (status === "failed") {
      await Appointment.findByIdAndUpdate(payment.appointment, { paymentStatus: "failed" });
    }

    res.status(200).json({ success: true });
  } catch (e) {
    console.error("Razorpay webhook error:", e.message);
    res.status(400).json({ success: false, message: e.message });
  }
};
