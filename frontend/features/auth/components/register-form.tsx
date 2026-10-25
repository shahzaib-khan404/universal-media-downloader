'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, UserPlus, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { register as registerUser } from '@/services/auth.service';
import { toast } from 'sonner';

const schema = z
  .object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Enter a valid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type FormValues = z.infer<typeof schema>;

export function RegisterForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: FormValues) => {
    try {
      await registerUser(values);
      toast.success('Account created! Welcome aboard.');
      router.push('/dashboard');
    } catch {
      toast.error('Registration failed. This email may already be in use.');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Full name */}
      <div>
        <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-300">
          Full Name
        </label>
        <input
          type="text"
          autoComplete="name"
          placeholder="Jane Smith"
          {...register('name')}
          className={`w-full rounded-2xl border bg-white/5 px-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none transition-all focus:border-[#FF6B00] focus:bg-white/10 ${
            errors.name ? 'border-red-500' : 'border-white/10'
          }`}
        />
        {errors.name && (
          <p className="mt-1 text-xs text-red-400">{errors.name.message}</p>
        )}
      </div>

      {/* Email */}
      <div>
        <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-300">
          Email Address
        </label>
        <input
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          {...register('email')}
          className={`w-full rounded-2xl border bg-white/5 px-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none transition-all focus:border-[#FF6B00] focus:bg-white/10 ${
            errors.email ? 'border-red-500' : 'border-white/10'
          }`}
        />
        {errors.email && (
          <p className="mt-1 text-xs text-red-400">{errors.email.message}</p>
        )}
      </div>

      {/* Password */}
      <div>
        <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-300">
          Password
        </label>
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
            placeholder="Min. 8 characters"
            {...register('password')}
            className={`w-full rounded-2xl border bg-white/5 px-4 py-2.5 pr-11 text-sm text-white placeholder-slate-500 outline-none transition-all focus:border-[#FF6B00] focus:bg-white/10 ${
              errors.password ? 'border-red-500' : 'border-white/10'
            }`}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 transition-colors hover:text-white"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4 text-[#FF8533]" />}
          </button>
        </div>
        {errors.password && (
          <p className="mt-1 text-xs text-red-400">{errors.password.message}</p>
        )}
      </div>

      {/* Confirm password */}
      <div>
        <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-300">
          Confirm Password
        </label>
        <input
          type={showPassword ? 'text' : 'password'}
          autoComplete="new-password"
          placeholder="Re-enter password"
          {...register('confirmPassword')}
          className={`w-full rounded-2xl border bg-white/5 px-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none transition-all focus:border-[#FF6B00] focus:bg-white/10 ${
            errors.confirmPassword ? 'border-red-500' : 'border-white/10'
          }`}
        />
        {errors.confirmPassword && (
          <p className="mt-1 text-xs text-red-400">{errors.confirmPassword.message}</p>
        )}
      </div>

      {/* Terms */}
      <label className="flex cursor-pointer items-start gap-2.5 pt-1">
        <input
          type="checkbox"
          required
          className="mt-0.5 h-4 w-4 rounded-lg border-white/20 bg-white/5 text-[#FF6B00] accent-[#FF6B00]"
        />
        <span className="text-xs leading-5 text-slate-400">
          I agree to the{' '}
          <Link href="/terms" className="text-[#FF8533] hover:underline font-medium">
            Terms of Service
          </Link>{' '}
          and{' '}
          <Link href="/privacy" className="text-[#FF8533] hover:underline font-medium">
            Privacy Policy
          </Link>
        </span>
      </label>

      {/* Submit */}
      <button
        type="submit"
        className="btn-3d-orange w-full py-3.5 text-sm font-bold text-white rounded-2xl flex items-center justify-center gap-2 shadow-[0_8px_20px_rgba(255,107,0,0.4)] disabled:opacity-50 mt-2"
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <UserPlus className="h-4 w-4" />
        )}
        {isSubmitting ? 'Creating account…' : 'Create Free Account'}
      </button>

      <p className="text-center text-xs text-slate-400 pt-2">
        Already have an account?{' '}
        <Link href="/login" className="font-bold text-[#FF8533] transition-colors hover:text-white ml-1">
          Sign in
        </Link>
      </p>
    </form>
  );
}
