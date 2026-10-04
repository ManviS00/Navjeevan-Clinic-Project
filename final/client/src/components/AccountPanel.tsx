import { useState } from 'react';
import { X, Mail, Phone, Cake, MapPin, ShieldCheck } from 'lucide-react';
import { useAuth as useSiteAuth } from '../context/AuthContext';
import { backendRequest } from '@/lib/backendApi';

export default function AccountPanel({ onClose }: { onClose: () => void }) {
  const { user: siteUser, profile } = useSiteAuth();
  const [resetSent, setResetSent] = useState(false);

  return (
    <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 h-16 border-b border-brand-100 sticky top-0 bg-white">
          <h2 className="text-lg font-semibold text-gray-900">My Profile</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-brand-50 text-gray-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-full bg-brand-100 flex items-center justify-center text-brand-600 font-semibold text-xl">
              {(siteUser?.email ?? profile?.full_name ?? '?')[0].toUpperCase()}
            </div>
            <div>
              <p className="font-semibold text-gray-900">{profile?.full_name ?? siteUser?.email ?? 'Patient'}</p>
              <p className="text-sm text-brand-600">You're doing great 🌸</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-brand-50/60">
              <Mail className="w-4 h-4 text-brand-600 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-xs text-gray-400">Email</p>
                <p className="text-sm font-medium text-gray-800 truncate">{siteUser?.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-xl bg-brand-50/60">
              <Phone className="w-4 h-4 text-brand-600 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-xs text-gray-400">Phone number</p>
                <p className="text-sm font-medium text-gray-800">{profile?.phone ?? 'Not added yet'}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-xl bg-brand-50/60">
              <Cake className="w-4 h-4 text-brand-600 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-xs text-gray-400">Date of birth</p>
                <p className="text-sm font-medium text-gray-800">{siteUser?.date_of_birth ?? '—'}</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-xl bg-brand-50/60">
              <MapPin className="w-4 h-4 text-brand-600 flex-shrink-0 mt-0.5" />
              <div className="min-w-0 flex-1">
                <p className="text-xs text-gray-400">Address</p>
                <p className="text-sm font-medium text-gray-800">
                  {[profile?.address?.city, profile?.address?.state, profile?.address?.pincode]
                    .filter(Boolean)
                    .join(', ') || 'Not added yet'}
                </p>
              </div>
            </div>
          </div>

          {resetSent ? (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-green-50 text-green-700 text-sm">
              <ShieldCheck className="w-4 h-4 flex-shrink-0" />
              If an account exists for {siteUser?.email}, a password reset link has been sent.
            </div>
          ) : (
            <button
              onClick={async () => {
                if (siteUser?.email) await backendRequest('/auth/request-password-reset', { method: 'POST', body: JSON.stringify({ email: siteUser.email }) });
                setResetSent(true);
              }}
              className="w-full py-2.5 rounded-xl border border-brand-300 text-brand-600 font-medium text-sm hover:bg-brand-50 transition"
            >
              Reset Password
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
