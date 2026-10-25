'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, LogIn, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { login } from '@/services/auth.service';
import { toast } from 'sonner';

const schema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

type FormValues = z.infer<typeof schema>;

export function LoginForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: FormValues) => {
    try {
      await login(values);
      router.push('/dashboard');
    } catch {
      toast.error('Invalid email or password. Please try again.');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {/* Email */}
      <div>
        <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-700">
          Email Address
        </label>
        <input
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          {...register('email')}
          className={`w-full rounded-2xl border bg-white px-4 py-3 text-sm text-slate-900 placeholder-slate-400 outline-none transition-all focus:border-[#FF6B00] shadow-sm ${
            errors.email ? 'border-red-500' : 'border-slate-200'
          }`}
        />
        {errors.email && (
          <p className="mt-1.5 text-xs text-red-500 font-medium">{errors.email.message}</p>
        )}
      </div>

      {/* Password */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Password
          </label>
          <Link
            href="/forgot-password"
            className="text-xs font-semibold text-[#FF6B00] transition-colors hover:text-orange-600"
          >
            Forgot password?
          </Link>
        </div>
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            placeholder="••••••••"
            {...register('password')}
            className={`w-full rounded-2xl border bg-white px-4 py-3 pr-11 text-sm text-slate-900 placeholder-slate-400 outline-none transition-all focus:border-[#FF6B00] shadow-sm ${
              errors.password ? 'border-red-500' : 'border-slate-200'
            }`}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 transition-colors hover:text-slate-700"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4 text-[#FF6B00]" />}
          </button>
        </div>
        {errors.password && (
          <p className="mt-1.5 text-xs text-red-500 font-medium">{errors.password.message}</p>
        )}
      </div>

      {/* Remember me */}
      <label className="flex cursor-pointer items-center gap-2.5">
        <input
          type="checkbox"
          className="h-4 w-4 rounded-lg border-slate-300 bg-white text-[#FF6B00] accent-[#FF6B00]"
        />
        <span className="text-xs font-medium text-slate-600">Remember me for 30 days</span>
      </label>

      {/* Submit */}
      <button
        type="submit"
        className="btn-3d-orange w-full py-3.5 text-sm font-bold text-white rounded-2xl flex items-center justify-center gap-2 shadow-md disabled:opacity-50"
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <LogIn className="h-4 w-4" />
        )}
        {isSubmitting ? 'Authenticating…' : 'Sign In to Account'}
      </button>

      <p className="text-center text-xs text-slate-500 mt-4 font-medium">
        Don&apos;t have an account?{' '}
        <Link href="/register" className="font-bold text-[#FF6B00] transition-colors hover:text-orange-600 ml-1">
          Create account
        </Link>
      </p>
    </form>
  );
}
