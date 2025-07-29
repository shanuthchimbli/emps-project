import { useState } from 'react';
import API from '../services/api';

function ForgetPassword() {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [step, setStep] = useState(1);
  const [message, setMessage] = useState('');

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    try {
      await API.post('/auth/requestPasswordReset', { email });
      setMessage('OTP has been sent to email. Please check your inbox.');
      setStep(2);
    } catch (err) {
      setMessage('Check your email for the OTP.');
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    try {
      await API.post('/auth/verifyAndResetPassword', { email, otp, newPassword });
      alert('Password reset successful! Redirecting to login...');
      window.location.href = '/login';
      setStep(3);
    } catch (err) {
      setMessage('Error resetting password. Please check your OTP and try again.');
      alert('Try again later. Busy server.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-blue-50">
      <div className="max-w-md w-full bg-white p-8 rounded-xl shadow">
        <h2 className="text-2xl font-bold mb-4 text-center">Reset Password</h2>

        {message && <p className="text-center text-sm text-blue-600 mb-4">{message}</p>}

        {step === 1 && (
          <form onSubmit={handleRequestOtp} className="space-y-4">
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg text-sm"
              required
            />
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 rounded-lg"
            >
              Request OTP
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <input
              type="text"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg text-sm"
              required
            />
            <input
              type="password"
              placeholder="Enter new password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg text-sm"
              required
            />
            <button
              type="submit"
              className="w-full bg-green-600 text-white py-2 rounded-lg"
            >
              Reset Password
            </button>
          </form>
        )}

        {step === 3 && (
          <div className="text-center">
            <a
              href="/login"
              className="text-blue-600 font-medium underline"
            >
              Go back to Login
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

export default ForgetPassword;
