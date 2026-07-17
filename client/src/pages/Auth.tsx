import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '../context/AuthContext';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { FiMail, FiLock, FiUser, FiZap, FiCheckCircle, FiEye, FiEyeOff, FiImage, FiAlertCircle } from 'react-icons/fi';

const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters')
});

const signupSchema = z.object({
  username: z.string()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username cannot exceed 30 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Only alphanumeric characters and underscores are allowed')
    .trim(),
  email: z.string().min(1, 'Email is required').email('Invalid email address').trim().toLowerCase(),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  avatar: z.string().url('Avatar must be a valid URL').or(z.literal('')).optional()
});

type LoginFormValues = z.infer<typeof loginSchema>;
type SignupFormValues = z.infer<typeof signupSchema>;

export const Auth: React.FC = () => {
  const { login, signup } = useAuth();
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' }
  });

  const signupForm = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: { username: '', email: '', password: '', avatar: '' }
  });

  const onLoginSubmit = async (data: LoginFormValues) => {
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      const success = await login(data.email, data.password);
      if (success) {
        setSuccessMsg('Logged in successfully!');
      } else {
        setErrorMsg('Invalid email or password.');
      }
    } catch (e: any) {
      setErrorMsg(e.response?.data?.message || 'Login failed. Please try again.');
    }
  };

  const onSignupSubmit = async (data: SignupFormValues) => {
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      const success = await signup(data.username, data.email, data.password, data.avatar || undefined);
      if (success) {
        setSuccessMsg('Account registered successfully! Logging you in...');
      } else {
        setErrorMsg('Username or email is already registered.');
      }
    } catch (e: any) {
      setErrorMsg(e.response?.data?.message || 'Registration failed. Please try again.');
    }
  };

  const inputClass = "w-full bg-zinc-950 border border-zinc-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg pl-9 pr-4 py-2 text-xs text-zinc-200 outline-none transition-all";

  return (
    <Card variant="glass" className="border border-zinc-800 shadow-sm p-6 relative overflow-hidden bg-zinc-900 w-full max-w-md mx-auto">
      {/* Brand logo & tagline */}
      <div className="text-center space-y-2 mb-6">
        <div className="mx-auto w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center shadow-sm mb-3">
          <FiZap className="w-5 h-5 text-white" />
        </div>
        <h2 className="text-lg font-semibold tracking-tight text-zinc-100">Welcome to Become A Pro</h2>
        <p className="text-xs text-zinc-500">Track study habits, build streaks, and conquer goals.</p>
      </div>

      {/* Tab Selectors */}
      <div className="flex border border-zinc-800 mb-5 p-0.5 bg-zinc-950 rounded-lg">
        <button
          onClick={() => {
            setActiveTab('login');
            setErrorMsg(null);
            setSuccessMsg(null);
            setShowPassword(false);
          }}
          className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all ${
            activeTab === 'login'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          Sign In
        </button>
        <button
          onClick={() => {
            setActiveTab('signup');
            setErrorMsg(null);
            setSuccessMsg(null);
            setShowPassword(false);
          }}
          className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all ${
            activeTab === 'signup'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          Register
        </button>
      </div>

      {/* Feedback Messages */}
      {errorMsg && (
        <div className="mb-4 p-2.5 rounded-lg bg-red-500/10 border border-red-500/25 text-red-400 text-xs flex items-center space-x-2">
          <FiAlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="mb-4 p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs flex items-center space-x-2">
          <FiCheckCircle className="shrink-0 text-emerald-400" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Login Form */}
      {activeTab === 'login' && (
        <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
          <div>
            <label className="block text-[10px] font-semibold text-zinc-500 mb-1">EMAIL ADDRESS</label>
            <div className="relative">
              <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 w-4 h-4" />
              <input
                type="email"
                placeholder="you@domain.com"
                disabled={loginForm.formState.isSubmitting}
                className={inputClass}
                {...loginForm.register('email')}
              />
            </div>
            {loginForm.formState.errors.email && (
              <p className="text-red-500 text-[10px] mt-1">{loginForm.formState.errors.email.message}</p>
            )}
          </div>

          <div>
            <label className="block text-[10px] font-semibold text-zinc-500 mb-1">PASSWORD</label>
            <div className="relative">
              <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 w-4 h-4" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                disabled={loginForm.formState.isSubmitting}
                className={inputClass.replace('pr-4', 'pr-10')}
                {...loginForm.register('password')}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                disabled={loginForm.formState.isSubmitting}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-350 focus:outline-none"
              >
                {showPassword ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
              </button>
            </div>
            {loginForm.formState.errors.password && (
              <p className="text-red-500 text-[10px] mt-1">{loginForm.formState.errors.password.message}</p>
            )}
          </div>

          <Button type="submit" isLoading={loginForm.formState.isSubmitting} className="w-full py-2.5 mt-2">
            Sign In
          </Button>
        </form>
      )}

      {/* Signup Form */}
      {activeTab === 'signup' && (
        <form onSubmit={signupForm.handleSubmit(onSignupSubmit)} className="space-y-4">
          <div>
            <label className="block text-[10px] font-semibold text-zinc-500 mb-1">USERNAME</label>
            <div className="relative">
              <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 w-4 h-4" />
              <input
                type="text"
                placeholder="alex_mercer"
                disabled={signupForm.formState.isSubmitting}
                className={inputClass}
                {...signupForm.register('username')}
              />
            </div>
            {signupForm.formState.errors.username && (
              <p className="text-red-500 text-[10px] mt-1">{signupForm.formState.errors.username.message}</p>
            )}
          </div>

          <div>
            <label className="block text-[10px] font-semibold text-zinc-500 mb-1">EMAIL ADDRESS</label>
            <div className="relative">
              <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 w-4 h-4" />
              <input
                type="email"
                placeholder="you@domain.com"
                disabled={signupForm.formState.isSubmitting}
                className={inputClass}
                {...signupForm.register('email')}
              />
            </div>
            {signupForm.formState.errors.email && (
              <p className="text-red-500 text-[10px] mt-1">{signupForm.formState.errors.email.message}</p>
            )}
          </div>

          <div>
            <label className="block text-[10px] font-semibold text-zinc-500 mb-1">PASSWORD</label>
            <div className="relative">
              <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 w-4 h-4" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="•••••••• (Min. 6 chars)"
                disabled={signupForm.formState.isSubmitting}
                className={inputClass.replace('pr-4', 'pr-10')}
                {...signupForm.register('password')}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                disabled={signupForm.formState.isSubmitting}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-350 focus:outline-none"
              >
                {showPassword ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
              </button>
            </div>
            {signupForm.formState.errors.password && (
              <p className="text-red-500 text-[10px] mt-1">{signupForm.formState.errors.password.message}</p>
            )}
          </div>

          <div>
            <label className="block text-[10px] font-semibold text-zinc-500 mb-1">AVATAR URL (OPTIONAL)</label>
            <div className="relative">
              <FiImage className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 w-4 h-4" />
              <input
                type="text"
                placeholder="https://example.com/avatar.jpg"
                disabled={signupForm.formState.isSubmitting}
                className={inputClass}
                {...signupForm.register('avatar')}
              />
            </div>
            {signupForm.formState.errors.avatar && (
              <p className="text-red-500 text-[10px] mt-1">{signupForm.formState.errors.avatar.message}</p>
            )}
          </div>

          <div className="flex items-start space-x-2 pt-1">
            <FiCheckCircle className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
            <p className="text-[9px] text-zinc-500 leading-normal">
              By registering, you set up a secure profile on our servers with HttpOnly rotated authentication keys.
            </p>
          </div>

          <Button type="submit" isLoading={signupForm.formState.isSubmitting} className="w-full py-2.5 mt-2">
            Register Account
          </Button>
        </form>
      )}
    </Card>
  );
};
export default Auth;
