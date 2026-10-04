import Review from "../models/Review.js";
import Appointment from "../models/Appointment.js";

export const createReview = async (req, res) => {
  try {
    const { appointmentId, rating, comment } = req.body;
    if (!comment?.trim()) return res.status(400).json({ success:false, message:"Review comment is required." });
    if (!Number.isInteger(Number(rating)) || Number(rating) < 1 || Number(rating) > 5) return res.status(400).json({ success:false, message:"Rating must be between 1 and 5." });
    if (!appointmentId) return res.status(400).json({ success:false, message:"Please select an appointment to review." });

    const appointment = await Appointment.findOne({ _id: appointmentId, patient: req.user.id });
    if (!appointment) return res.status(404).json({ success:false, message:"Appointment not found." });
    if (appointment.status !== "completed") return res.status(400).json({ success:false, message:"Only completed appointments can be reviewed." });

    const existingReview = await Review.findOne({ patient: req.user.id, appointment: appointment._id });
    if (existingReview) return res.status(409).json({ success:false, message:"You have already reviewed this appointment." });

    const review = await Review.create({ patient:req.user.id, appointment:appointment._id, rating:Number(rating), comment:comment.trim(), status:"approved" });
    const populated = await review.populate("patient", "fullName email phone");
    res.status(201).json({ success:true, data:populated });
  } catch (e) { res.status(400).json({ success:false, message:e.message }); }
};


export const getMyReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ patient: req.user.id, appointment: { $ne: null } })
      .populate("appointment", "appointmentDate timeSlot service")
      .sort({ createdAt: -1 });
    res.json({ success: true, data: reviews });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

export const getReviews = async (req,res) => {
  try {
    const reviews = await Review.find(req.user?.role === "admin" ? {} : { status:"approved" })
      .populate("patient","fullName email phone").populate("appointment","appointmentDate timeSlot")
      .sort({createdAt:-1});
    res.json({success:true,data:reviews});
  } catch(e){ res.status(500).json({success:false,message:e.message}); }
};

export const updateReviewStatus = async (req,res) => {
  try {
    const { status } = req.body;
    if (!["pending","approved","rejected"].includes(status)) return res.status(400).json({success:false,message:"Invalid review status."});
    const review = await Review.findByIdAndUpdate(req.params.id,{status},{new:true}).populate("patient","fullName email");
    if (!review) return res.status(404).json({success:false,message:"Review not found."});
    res.json({success:true,data:review});
  } catch(e){ res.status(400).json({success:false,message:e.message}); }
};


export const getPublicReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ status: "approved" })
      .populate("patient", "fullName")
      .sort({ createdAt: -1 })
      .limit(50);
    return res.json({ success: true, data: reviews });
  } catch (e) {
    return res.status(500).json({ success: false, message: e.message });
  }
};
