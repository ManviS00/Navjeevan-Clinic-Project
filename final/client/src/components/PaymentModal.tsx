import { useState } from 'react';
import { X, CheckCircle, Shield, Loader2, AlertCircle, MapPin, CreditCard } from 'lucide-react';
import { backendRequest } from '../lib/backendApi';

interface PaymentModalProps {
  appointmentId: string;
  patientName: string;
  service: string;
  preferredDate: string;
  onClose: () => void | Promise<void>;
  onPaymentComplete: (method: string, txnId: string) => void;
  allowOnlinePayment: boolean;
  allowPayAtClinic: boolean;
}

type PaymentState = 'idle' | 'loading' | 'success' | 'error';

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  prefill?: { name?: string; email?: string; contact?: string };
  theme?: { color?: string };
  modal?: { ondismiss?: () => void };
  handler: (response: { razorpay_payment_id: string; razorpay_order_id: string; razorpay_signature: string }) => void;
}

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayOptions) => { open: () => void };
  }
}

function loadRazorpayScript() {
  return new Promise<boolean>((resolve) => {
    if (window.Razorpay) return resolve(true);
    const existing = document.querySelector('script[data-razorpay-checkout]');
    if (existing) {
      existing.addEventListener('load', () => resolve(true), { once: true });
      existing.addEventListener('error', () => resolve(false), { once: true });
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.dataset.razorpayCheckout = 'true';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

function formatDate(value: string) {
  return new Date(`${value}T00:00:00`).toLocaleDateString('en-IN', {
    weekday: 'short', day: 'numeric', month: 'long', year: 'numeric',
  });
}

export default function PaymentModal({ appointmentId, patientName, service, preferredDate, onClose, onPaymentComplete, allowOnlinePayment, allowPayAtClinic }: PaymentModalProps) {
  const [state, setState] = useState<PaymentState>('idle');
  const [error, setError] = useState('');
  const [order, setOrder] = useState<any>(null);
  const [payAtClinic, setPayAtClinic] = useState(false);
  const [closing, setClosing] = useState(false);

  async function startPayment() {
    if (!allowOnlinePayment) return;
    setError('');
    setState('loading');
    let paymentOrder = order;
    try {
      const result = await backendRequest<any>(`/payments/${appointmentId}/order`, { method: 'POST', body: JSON.stringify({}) });
      paymentOrder = result.data;
      setOrder(paymentOrder);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unable to create secure payment order.');
      setState('error');
      return;
    }
    const ready = await loadRazorpayScript();
    if (!ready || !window.Razorpay) {
      setError('Secure payment checkout could not be loaded. Check your internet connection and try again.');
      setState('error');
      return;
    }
    if (!paymentOrder?.keyId || !paymentOrder?.orderId) {
      setError('Payment order is not ready yet. Please try again.');
      setState('error');
      return;
    }

    const options: RazorpayOptions = {
      key: paymentOrder.keyId,
      amount: paymentOrder.amount,
      currency: paymentOrder.currency,
      name: 'Navjeevan Clinic',
      description: `${paymentOrder.serviceName || service} consultation`,
      order_id: paymentOrder.orderId,
      prefill: paymentOrder.patient,
      theme: { color: '#c51e3a' },
      modal: { ondismiss: () => setState('idle') },
      handler: async (response) => {
        try {
          const result = await backendRequest<any>(`/payments/${appointmentId}/verify`, {
            method: 'POST',
            body: JSON.stringify(response),
          });
          if (result.data?.status !== 'paid') throw new Error('Payment is not captured yet. Please check your appointment status before retrying.');
          setState('success');
          onPaymentComplete('razorpay', response.razorpay_payment_id);
        } catch (e) {
          setError(e instanceof Error ? e.message : 'Payment verification failed.');
          setState('error');
        }
      },
    };
    new window.Razorpay(options).open();
  }

  async function choosePayAtClinic() {
    if (!allowPayAtClinic) return;
    setError('');
    setPayAtClinic(true);
    setState('loading');
    try {
      await backendRequest(`/payments/${appointmentId}/pay-at-clinic`, { method: 'POST', body: JSON.stringify({}) });
      setState('success');
      onPaymentComplete('pay_at_clinic', '');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unable to save the appointment.');
      setState('error');
      setPayAtClinic(false);
    }
  }

  async function handleClose() {
    if (closing || state === 'loading') return;
    setClosing(true);
    try { await onClose(); } finally { setClosing(false); }
  }

  const amount = order?.amount ? Number(order.amount) / 100 : null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={state !== 'loading' && !closing ? handleClose : undefined} />
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div>
            <h2 className="font-serif text-xl font-bold text-gray-800">{state === 'success' ? 'Booking Confirmed' : 'Secure Payment'}</h2>
            <p className="text-xs text-gray-400 mt-1">Navjeevan Clinic · Razorpay Secure Checkout</p>
          </div>
          {state !== 'loading' && <button onClick={handleClose} disabled={closing} className="p-2 rounded-full hover:bg-gray-100 disabled:opacity-50"><X size={18} /></button>}
        </div>

        <div className="p-6">
          {state === 'success' ? (
            <div className="text-center py-5">
              <CheckCircle size={52} className="text-green-500 mx-auto mb-4" />
              <h3 className="font-semibold text-xl text-gray-800">{payAtClinic ? 'Appointment Reserved' : 'Payment Successful'}</h3>
              <p className="text-sm text-gray-500 mt-2">{payAtClinic ? 'Please pay the consultation fee at the clinic.' : 'Your payment was verified by the clinic server.'}</p>
              <button onClick={handleClose} className="mt-6 w-full py-3 bg-rose-700 text-white rounded-xl font-semibold">Continue</button>
            </div>
          ) : (
            <>
              <div className="bg-rose-50 rounded-2xl p-4 mb-5 border border-rose-100 space-y-2 text-sm">
                <div className="flex justify-between gap-3"><span className="text-gray-500">Patient</span><strong>{patientName}</strong></div>
                <div className="flex justify-between gap-3"><span className="text-gray-500">Service</span><strong>{order?.serviceName || service}</strong></div>
                <div className="flex justify-between gap-3"><span className="text-gray-500">Date</span><strong>{formatDate(preferredDate)}</strong></div>
                {amount !== null && <div className="border-t border-rose-200 pt-2 flex justify-between text-base"><span className="font-semibold">Total</span><strong className="text-rose-700">₹{amount.toLocaleString('en-IN')}</strong></div>}
              </div>

              {error && <div className="p-3 mb-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 flex gap-2"><AlertCircle size={17} className="mt-0.5 shrink-0" />{error}</div>}

              {state === 'loading' ? (
                <div className="py-8 text-center"><Loader2 size={34} className="animate-spin text-rose-600 mx-auto" /><p className="text-sm text-gray-500 mt-3">Processing securely…</p></div>
              ) : (
                <div className="space-y-3">
                  {allowOnlinePayment && (
                    <button onClick={startPayment} className="w-full flex items-center justify-center gap-3 py-3.5 bg-rose-700 text-white rounded-xl font-semibold disabled:opacity-50"><CreditCard size={18} />Pay securely with Razorpay</button>
                  )}
                  {allowPayAtClinic && (
                    <button onClick={choosePayAtClinic} className="w-full flex items-center justify-center gap-3 py-3 border-2 border-gray-200 text-gray-700 rounded-xl font-semibold hover:border-rose-300"><MapPin size={18} />Pay at clinic</button>
                  )}
                  {allowOnlinePayment && allowPayAtClinic && <p className="text-xs text-gray-500 text-center">Choose one payment method. Your appointment is confirmed only after the selected payment step succeeds.</p>}
                  <div className="flex items-center justify-center gap-2 pt-2 text-[11px] text-gray-400"><Shield size={14} />Payment details are handled by Razorpay; card data never reaches this server.</div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
