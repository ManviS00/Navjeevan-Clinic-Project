import { useState } from 'react';
import { useAuth } from '@/lib/auth';
import { toISODate } from '@/lib/date';
import { Heart } from 'lucide-react';

// Minimum registration age is 9 years.
const MIN_SIGNUP_AGE_DOB = toISODate(new Date(new Date().getFullYear() - 9, new Date().getMonth(), new Date().getDate()));

export default function CompleteProfile() {
  const { setDateOfBirth, signOut } = useAuth();
  const [dob, setDob] = useState(MIN_SIGNUP_AGE_DOB);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!dob) { setError('Please enter your date of birth'); return; }
    if (dob > MIN_SIGNUP_AGE_DOB) { setError('You must be at least 9 years old to use this app.'); return; }
    setError(null);
    setLoading(true);
    const { error } = await setDateOfBirth(dob);
    setLoading(false);
    if (error) setError(error);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 via-white to-brand-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl shadow-brand-100/50 border border-brand-100 p-8 sm:p-10">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-10 h-10 rounded-xl bg-white border border-brand-100 overflow-hidden flex items-center justify-center">
            <img src="/navjeevan-logo.jpeg" alt="Navjeevan Clinic logo" className="w-full h-full object-contain" />
          </div>
          <span className="text-2xl font-bold text-gray-900">Navjeevan Clinic</span>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-1">One more thing</h2>
        <p className="text-gray-500 mb-6">
          We need your date of birth to personalize your predictions and show the right features for you.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Date of birth</label>
            <input
              type="date"
              required
              max={MIN_SIGNUP_AGE_DOB}
              value={dob}
              onChange={(e) => setDob(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-brand-400 focus:ring-2 focus:ring-brand-100 outline-none transition"
            />
          </div>
          {error && <div className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</div>}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-semibold transition disabled:opacity-50"
          >
            {loading ? 'Saving…' : 'Continue'}
          </button>
        </form>
        <button onClick={signOut} className="w-full text-center text-sm text-gray-400 hover:text-gray-600 mt-4">
          Sign out instead
        </button>
      </div>
    </div>
  );
}
