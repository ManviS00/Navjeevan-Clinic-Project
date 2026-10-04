import { useState, useEffect, useRef } from 'react';
import { X, Eye, EyeOff, AlertCircle, CheckCircle, Mail, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { backendLogin, setBackendToken, sendBackendOTP, verifyBackendOTP, registerBackendPatient } from '../lib/backendApi';

interface AuthModalProps {
  mode: 'login' | 'signup';
  onClose: () => void;
  onSwitchMode: (mode: 'login' | 'signup') => void;
  onSuccess: (role?: 'patient' | 'doctor' | 'admin') => void;
}
type Step = 'form' | 'otp' | 'success';

export default function AuthModal({ mode, onClose, onSwitchMode, onSuccess }: AuthModalProps) {
  const { setSession } = useAuth();
  const [step, setStep] = useState<Step>('form');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
  const pendingEmail = useRef('');
  const pendingPassword = useRef('');
  const [form, setForm] = useState({ fullName: '', phone: '', email: '', password: '', dateOfBirth: '', city: '', state: '', pincode: '', notificationPreference: 'email' as const });

  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | undefined;
    if (step === 'otp') {
      setCountdown(60); setCanResend(false);
      timer = setInterval(() => setCountdown((c) => {
        if (c <= 1) { if (timer) clearInterval(timer); setCanResend(true); return 0; }
        return c - 1;
      }), 1000);
    }
    return () => { if (timer) clearInterval(timer); };
  }, [step]);

  function handleOtpChange(idx: number, val: string) {
    if (!/^\d*$/.test(val)) return;
    const next = [...otp]; next[idx] = val.slice(-1); setOtp(next);
    if (val && idx < 5) otpRefs.current[idx + 1]?.focus();
  }
  function handleOtpKey(idx: number, e: React.KeyboardEvent) {
    if (e.key === 'Backspace' && !otp[idx] && idx > 0) otpRefs.current[idx - 1]?.focus();
  }
  function handleOtpPaste(e: React.ClipboardEvent) {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 6) { setOtp(pasted.split('')); otpRefs.current[5]?.focus(); }
  }
  function setField(k: keyof typeof form, v: string) { setForm((f) => ({ ...f, [k]: v })); setError(''); }

  function validateForm() {
    if (mode === 'signup') {
      if (!form.fullName.trim()) return 'Full name is required.';
      if (!/^[A-Za-z]+(?:\s[A-Za-z]+)*$/.test(form.fullName.trim())) return 'Full name should contain only letters and spaces.';
      if (!/^\d{10}$/.test(form.phone)) return 'Enter a valid 10-digit phone number.';
      if (!form.email || !/\S+@\S+\.\S+/.test(form.email)) return 'Enter a valid email address.';
      if (form.password.length < 6) return 'Password must be at least 6 characters.';
      if (!form.dateOfBirth) return 'Date of birth is required.';
      const dob = new Date(`${form.dateOfBirth}T00:00:00`);
      if (Number.isNaN(dob.getTime())) return 'Enter a valid date of birth.';
      const today = new Date();
      let age = today.getFullYear() - dob.getFullYear();
      const md = today.getMonth() - dob.getMonth();
      if (md < 0 || (md === 0 && today.getDate() < dob.getDate())) age--;
      if (age < 10 || age > 70) return 'Registration is allowed only between 10 and 70 years of age.';
      if (!/^\d{6}$/.test(form.pincode)) return 'Enter a valid 6-digit pincode.';
      if (!form.city.trim() || !form.state.trim()) return 'City and state are required.';
    } else {
      if (!form.email.trim()) return 'Enter your registered email or phone number.';
      if (!form.password) return 'Enter your password.';
    }
    return '';
  }

  async function handleFormSubmit(e: React.FormEvent) {
    e.preventDefault();
    const err = validateForm();
    if (err) { setError(err); return; }
    setLoading(true); setError('');
    try {
      if (mode === 'signup') {
        pendingEmail.current = form.email.trim().toLowerCase();
        pendingPassword.current = form.password;
        await sendBackendOTP(pendingEmail.current, form.phone);
        setStep('otp');
        return;
      }

      const result = await backendLogin(form.email.trim(), form.password);
      setBackendToken(result.token);
      await setSession(result.user, result.token);
      localStorage.setItem('lumina_user', JSON.stringify({
        id: result.user.id, email: result.user.email || '', date_of_birth: result.user.date_of_birth ?? null, age: null
      }));
      setStep('success');
      setTimeout(() => {
        onClose();
        onSuccess(result.user.role);
      }, 500);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally { setLoading(false); }
  }

  async function handleOtpVerify() {
    const entered = otp.join('');
    if (entered.length !== 6) { setError('Please enter the complete 6-digit OTP.'); return; }
    setLoading(true); setError('');
    try {
      await verifyBackendOTP(pendingEmail.current, form.phone, entered);
      const result = await registerBackendPatient({
        fullName: form.fullName.trim(), email: pendingEmail.current, phone: form.phone, password: pendingPassword.current,
        dateOfBirth: form.dateOfBirth,
        address: { city: form.city.trim(), state: form.state.trim(), country: 'India', pincode: form.pincode },
        notificationPreference: 'email'
      });
      setBackendToken(result.token);
      await setSession(result.user, result.token);
      localStorage.setItem('lumina_user', JSON.stringify({
        id: result.user.id, email: result.user.email || '', date_of_birth: null, age: null
      }));
      setStep('success');
      setTimeout(() => { onClose(); onSuccess('patient'); }, 700);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Verification failed. Please try again.');
    } finally { setLoading(false); }
  }

  async function handleResend() {
    setOtp(['', '', '', '', '', '']); setError(''); setLoading(true);
    try {
      await sendBackendOTP(pendingEmail.current, form.phone);
      setStep('form'); setTimeout(() => setStep('otp'), 0);
    } catch { setError('Could not resend OTP. Please try again.'); }
    finally { setLoading(false); }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md animate-fade-in modal-scroll overflow-hidden">

        {/* Top accent bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-rose-500 to-pink-500" />

        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors z-10"
        >
          <X size={18} className="text-gray-500" />
        </button>

        <div className="p-8">
          {/* ── STEP: form ── */}
          {step === 'form' && (
            <>
              <div className="text-center mb-6">
                <div className="w-14 h-14 rounded-full bg-rose-50 border border-rose-100 flex items-center justify-center mx-auto mb-3">
                  {mode === 'login'
                    ? <Lock size={24} className="text-rose-600" />
                    : <Mail size={24} className="text-rose-600" />}
                </div>
                <h2 className="font-serif text-2xl font-semibold text-gray-900">
                  {mode === 'login' ? 'Welcome Back' : 'Create Account'}
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  {mode === 'login'
                    ? 'Log in to Navjeevan Clinic'
                    : 'Register with Navjeevan Clinic · OTP verification required'}
                </p>
              </div>

              <form onSubmit={handleFormSubmit} className="space-y-4">
                {mode === 'signup' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                      <input
                        type="text"
                        value={form.fullName}
                        onChange={(e) => setField('fullName', e.target.value)}
                        placeholder="Priya Sharma"
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-300 focus:border-rose-300 transition"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                        <input
                          type="tel"
                          value={form.phone}
                          onChange={(e) => setField('phone', e.target.value.replace(/\D/g, ''))}
                          placeholder="98XXXXXXXX"
                          maxLength={10}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-300 focus:border-rose-300 transition"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth *</label>
                        <input
                          type="date"
                          value={form.dateOfBirth}
                          max={new Date(new Date().getFullYear() - 10, new Date().getMonth(), new Date().getDate()).toISOString().slice(0, 10)}
                          onChange={(e) => setField('dateOfBirth', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-300 focus:border-rose-300 transition"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Pincode *</label>
                      <input type="tel" value={form.pincode} onChange={(e) => setField('pincode', e.target.value.replace(/\D/g, '').slice(0,6))} placeholder="110053" maxLength={6} className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-300 focus:border-rose-300 transition" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
                        <input type="text" value={form.city} onChange={(e) => setField('city', e.target.value)} placeholder="Delhi" className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-300 focus:border-rose-300 transition" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">State *</label>
                        <input type="text" value={form.state} onChange={(e) => setField('state', e.target.value)} placeholder="Delhi" className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-300 focus:border-rose-300 transition" />
                      </div>
                    </div>
                  </>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <span className="flex items-center gap-1.5"><Mail size={13} className="text-gray-400" /> {mode === 'login' ? 'Email or Phone *' : 'Email Address *'}</span>
                  </label>
                  <input
                    type={mode === 'login' ? 'text' : 'email'}
                    value={form.email}
                    onChange={(e) => setField('email', e.target.value)}
                    placeholder={mode === 'login' ? 'Email or 10-digit phone' : 'you@example.com'}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-300 focus:border-rose-300 transition"
                  />
                </div>


                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <span className="flex items-center gap-1.5"><Lock size={13} className="text-gray-400" /> Password *</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={form.password}
                      onChange={(e) => setField('password', e.target.value)}
                      placeholder={mode === 'signup' ? 'Min. 6 characters' : 'Your password'}
                      className="w-full px-4 py-3 pr-11 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-300 focus:border-rose-300 transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-700">
                    <AlertCircle size={15} className="mt-0.5 flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-gradient-to-r from-rose-600 to-pink-600 text-white rounded-xl font-semibold text-sm hover:from-rose-700 hover:to-pink-700 disabled:opacity-60 transition-all shadow-sm hover:shadow-rose-200 hover:shadow-md"
                >
                  {loading
                    ? 'Please wait…'
                    : mode === 'login'
                    ? 'Log In →'
                    : 'Sign Up — Send OTP →'}
                </button>
              </form>

              <p className="text-center text-sm text-gray-500 mt-5">
                {mode === 'login' ? (
                  <>New to Navjeevan Clinic?{' '}
                    <button onClick={() => onSwitchMode('signup')} className="text-rose-700 font-semibold hover:underline">Create account</button>
                  </>
                ) : (
                  <>Already registered?{' '}
                    <button onClick={() => onSwitchMode('login')} className="text-rose-700 font-semibold hover:underline">Log In</button>
                  </>
                )}
              </p>
            </>
          )}

          {/* ── STEP: OTP ── */}
          {step === 'otp' && (
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center mx-auto mb-4">
                <Mail size={28} className="text-blue-500" />
              </div>
              <h2 className="font-serif text-2xl font-semibold text-gray-900 mb-1">Verify Your Account</h2>
              <p className="text-sm text-gray-500 mb-1">We sent your 6-digit OTP via</p>
              <p className="text-sm font-semibold text-gray-800 mb-6">email</p>

              <div className="flex gap-2 justify-center mb-5" onPaste={handleOtpPaste}>
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    ref={(el) => { otpRefs.current[i] = el; }}
                    type="text"
                    maxLength={1}
                    inputMode="numeric"
                    value={digit}
                    onChange={(e) => handleOtpChange(i, e.target.value)}
                    onKeyDown={(e) => handleOtpKey(i, e)}
                    className={`w-11 h-13 text-center text-xl font-bold border-2 rounded-xl focus:outline-none transition-all ${
                      digit
                        ? 'border-rose-400 bg-rose-50 text-rose-700'
                        : 'border-gray-200 focus:border-rose-400'
                    }`}
                    style={{ height: '52px' }}
                  />
                ))}
              </div>

              {error && (
                <div className="flex items-center justify-center gap-2 mb-4 p-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600">
                  <AlertCircle size={14} /> {error}
                </div>
              )}

              <button
                onClick={handleOtpVerify}
                disabled={loading || otp.join('').length !== 6}
                className="w-full py-3 bg-gradient-to-r from-rose-600 to-pink-600 text-white rounded-xl font-semibold text-sm hover:from-rose-700 hover:to-pink-700 disabled:opacity-50 transition-all shadow-sm mb-3"
              >
                {loading ? 'Verifying…' : 'Verify OTP →'}
              </button>

              <div className="text-sm text-gray-500 mb-2">
                {canResend ? (
                  <button
                    onClick={handleResend}
                    disabled={loading}
                    className="text-rose-700 font-semibold hover:underline disabled:opacity-50"
                  >
                    Resend OTP
                  </button>
                ) : (
                  <span>Resend OTP in <strong className="text-gray-700">{countdown}s</strong></span>
                )}
              </div>

              <button
                onClick={() => { setStep('form'); setOtp(['','','','','','']); setError(''); }}
                className="text-sm text-gray-400 hover:text-gray-600 transition-colors mt-1"
              >
                ← Change email
              </button>
            </div>
          )}

          {/* ── STEP: Success ── */}
          {step === 'success' && (
            <div className="text-center py-6">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={32} className="text-green-600" />
              </div>
              <h2 className="font-serif text-2xl font-semibold text-gray-900 mb-2">
                {mode === 'signup' ? 'Account Created!' : "You're logged in!"}
              </h2>
              <p className="text-sm text-gray-500">
                {mode === 'signup'
                  ? 'Welcome to Navjeevan Clinic! Taking you to the home page…'
                  : 'Welcome back! Taking you to the home page…'}
              </p>
              <div className="mt-4 flex justify-center">
                <div className="w-8 h-8 border-2 border-rose-300 border-t-rose-600 rounded-full animate-spin" />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
