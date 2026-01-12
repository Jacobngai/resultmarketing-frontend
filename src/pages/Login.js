import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Phone, ArrowRight, ArrowLeft, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const navigate = useNavigate();
  const { signInWithOtp, verifyOtp } = useAuth();
  const [step, setStep] = useState('phone'); // 'phone' | 'otp' | 'success'
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(0);
  const otpRefs = useRef([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm();

  const [otp, setOtp] = useState(['', '', '', '', '', '']);

  // Countdown timer for resend OTP
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // Format phone number for display
  const formatPhoneDisplay = (phone) => {
    if (!phone) return '';
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length <= 3) return cleaned;
    if (cleaned.length <= 6) return `${cleaned.slice(0, 3)}-${cleaned.slice(3)}`;
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)} ${cleaned.slice(6, 10)}`;
  };

  // Handle phone number submission
  const handlePhoneSubmit = async (data) => {
    setIsLoading(true);
    setError('');

    const fullPhone = `+60${data.phone.replace(/\D/g, '')}`;
    setPhoneNumber(fullPhone);

    try {
      const { error: signInError } = await signInWithOtp(fullPhone);

      if (signInError) {
        setError(signInError.message || 'Failed to send OTP. Please try again.');
        setIsLoading(false);
        return;
      }

      setStep('otp');
      setCountdown(60);
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    }

    setIsLoading(false);
  };

  // Handle OTP input change
  const handleOtpChange = (index, value) => {
    if (value.length > 1) {
      // Handle paste
      const pastedValue = value.slice(0, 6).split('');
      const newOtp = [...otp];
      pastedValue.forEach((char, i) => {
        if (index + i < 6 && /^\d$/.test(char)) {
          newOtp[index + i] = char;
        }
      });
      setOtp(newOtp);
      const nextIndex = Math.min(index + pastedValue.length, 5);
      otpRefs.current[nextIndex]?.focus();
    } else if (/^\d$/.test(value) || value === '') {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      // Auto-focus next input
      if (value && index < 5) {
        otpRefs.current[index + 1]?.focus();
      }
    }
  };

  // Handle OTP backspace
  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  // Handle OTP verification
  const handleOtpSubmit = async () => {
    const otpCode = otp.join('');
    if (otpCode.length !== 6) {
      setError('Please enter the complete 6-digit code');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const { error: verifyError } = await verifyOtp(phoneNumber, otpCode);

      if (verifyError) {
        setError(verifyError.message || 'Invalid OTP. Please try again.');
        setIsLoading(false);
        return;
      }

      setStep('success');
      setTimeout(() => {
        navigate('/', { replace: true });
      }, 1500);
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    }

    setIsLoading(false);
  };

  // Resend OTP
  const handleResendOtp = async () => {
    if (countdown > 0) return;

    setIsLoading(true);
    setError('');

    try {
      const { error: signInError } = await signInWithOtp(phoneNumber);

      if (signInError) {
        setError(signInError.message || 'Failed to resend OTP.');
        setIsLoading(false);
        return;
      }

      setOtp(['', '', '', '', '', '']);
      setCountdown(60);
    } catch (err) {
      setError('An unexpected error occurred.');
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-hero flex flex-col">
      {/* Header */}
      <div className="pt-12 pb-8 px-6 text-center text-white">
        <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
          <span className="text-3xl font-bold text-primary-600">RM</span>
        </div>
        <h1 className="text-2xl font-bold">ResultMarketing</h1>
        <p className="text-primary-200 mt-1">AI-Powered CRM for Sales Pros</p>
      </div>

      {/* Content Card */}
      <div className="flex-1 bg-white rounded-t-3xl px-6 pt-8 pb-safe">
        {step === 'phone' && (
          <div className="animate-fade-in">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome!</h2>
            <p className="text-gray-600 mb-8">
              Enter your Malaysian phone number to get started
            </p>

            <form onSubmit={handleSubmit(handlePhoneSubmit)}>
              <div className="mb-6">
                <label className="label">Phone Number</label>
                <div className="flex">
                  <div className="flex items-center px-4 bg-gray-100 border border-r-0 border-gray-200 rounded-l-lg">
                    <span className="text-gray-600 font-medium">+60</span>
                  </div>
                  <input
                    type="tel"
                    placeholder="12-345 6789"
                    className={`input rounded-l-none flex-1 ${
                      errors.phone ? 'input-error' : ''
                    }`}
                    {...register('phone', {
                      required: 'Phone number is required',
                      pattern: {
                        value: /^[0-9]{9,10}$/,
                        message: 'Please enter a valid Malaysian phone number',
                      },
                    })}
                    autoComplete="tel"
                    inputMode="numeric"
                  />
                </div>
                {errors.phone && (
                  <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle size={14} />
                    {errors.phone.message}
                  </p>
                )}
              </div>

              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                  <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={18} />
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary w-full py-4 text-lg"
              >
                {isLoading ? (
                  <Loader2 className="animate-spin" size={24} />
                ) : (
                  <>
                    Continue
                    <ArrowRight className="ml-2" size={20} />
                  </>
                )}
              </button>
            </form>

            <p className="text-center text-gray-500 text-sm mt-6">
              By continuing, you agree to our{' '}
              <a href="#" className="text-primary-600 hover:underline">
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="#" className="text-primary-600 hover:underline">
                Privacy Policy
              </a>
            </p>
          </div>
        )}

        {step === 'otp' && (
          <div className="animate-fade-in">
            <button
              onClick={() => {
                setStep('phone');
                setOtp(['', '', '', '', '', '']);
                setError('');
              }}
              className="flex items-center text-gray-600 mb-6 hover:text-gray-900"
            >
              <ArrowLeft size={20} className="mr-1" />
              Back
            </button>

            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Verify your number
            </h2>
            <p className="text-gray-600 mb-8">
              We sent a 6-digit code to{' '}
              <span className="font-semibold text-gray-900">{phoneNumber}</span>
            </p>

            {/* OTP Input */}
            <div className="flex justify-center gap-2 mb-6">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => (otpRefs.current[index] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(index, e)}
                  className={`w-12 h-14 text-center text-2xl font-semibold border-2 rounded-lg transition-colors ${
                    digit
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 bg-white'
                  } focus:border-primary-500 focus:ring-2 focus:ring-primary-500 focus:ring-opacity-20`}
                />
              ))}
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={18} />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <button
              onClick={handleOtpSubmit}
              disabled={isLoading || otp.join('').length !== 6}
              className="btn-primary w-full py-4 text-lg mb-4"
            >
              {isLoading ? (
                <Loader2 className="animate-spin" size={24} />
              ) : (
                'Verify'
              )}
            </button>

            <div className="text-center">
              {countdown > 0 ? (
                <p className="text-gray-500">
                  Resend code in{' '}
                  <span className="font-semibold text-primary-600">
                    {countdown}s
                  </span>
                </p>
              ) : (
                <button
                  onClick={handleResendOtp}
                  disabled={isLoading}
                  className="text-primary-600 font-medium hover:underline"
                >
                  Resend code
                </button>
              )}
            </div>
          </div>
        )}

        {step === 'success' && (
          <div className="animate-fade-in text-center py-12">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="text-green-600" size={40} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Welcome to ResultMarketing!
            </h2>
            <p className="text-gray-600">
              Setting up your account...
            </p>
            <div className="mt-6">
              <Loader2 className="animate-spin text-primary-600 mx-auto" size={32} />
            </div>
          </div>
        )}

        {/* Features preview */}
        {step === 'phone' && (
          <div className="mt-10 pt-8 border-t border-gray-100">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
              What you'll get
            </h3>
            <div className="space-y-4">
              {[
                { icon: '📱', text: 'Scan namecards with AI' },
                { icon: '📊', text: 'Import contacts from spreadsheets' },
                { icon: '🤖', text: 'AI-powered contact insights' },
                { icon: '🔔', text: 'Smart follow-up reminders' },
              ].map((feature, index) => (
                <div key={index} className="flex items-center gap-3">
                  <span className="text-2xl">{feature.icon}</span>
                  <span className="text-gray-700">{feature.text}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;
