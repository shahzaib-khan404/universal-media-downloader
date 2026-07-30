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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {/* Full name */}
      <div>
        <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted">
          Full Name
        </label>
        <input
          type="text"
          autoComplete="name"
          placeholder="Jane Smith"
          {...register('name')}
          className={`w-full rounded-xl border bg-surface2 px-4 py-3 text-sm text-white placeholder-muted/40 outline-none transition-colors focus:border-accent ${
            errors.name ? 'border-red-500' : 'border-border'
          }`}
        />
        {errors.name && (
          <p className="mt-1.5 text-xs text-red-400">{errors.name.message}</p>
        )}
      </div>

      {/* Email */}
      <div>
        <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted">
          Email Address
        </label>
        <input
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          {...register('email')}
          className={`w-full rounded-xl border bg-surface2 px-4 py-3 text-sm text-white placeholder-muted/40 outline-none transition-colors focus:border-accent ${
            errors.email ? 'border-red-500' : 'border-border'
          }`}
        />
        {errors.email && (
          <p className="mt-1.5 text-xs text-red-400">{errors.email.message}</p>
        )}
      </div>

      {/* Password */}
      <div>
        <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted">
          Password
        </label>
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
            placeholder="Min. 8 characters"
            {...register('password')}
            className={`w-full rounded-xl border bg-surface2 px-4 py-3 pr-11 text-sm text-white placeholder-muted/40 outline-none transition-colors focus:border-accent ${
              errors.password ? 'border-red-500' : 'border-border'
            }`}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted transition-colors hover:text-white"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {errors.password && (
          <p className="mt-1.5 text-xs text-red-400">{errors.password.message}</p>
        )}
      </div>

      {/* Confirm password */}
      <div>
        <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted">
          Confirm Password
        </label>
        <input
          type={showPassword ? 'text' : 'password'}
          autoComplete="new-password"
          placeholder="Re-enter password"
          {...register('confirmPassword')}
          className={`w-full rounded-xl border bg-surface2 px-4 py-3 text-sm text-white placeholder-muted/40 outline-none transition-colors focus:border-accent ${
            errors.confirmPassword ? 'border-red-500' : 'border-border'
          }`}
        />
        {errors.confirmPassword && (
          <p className="mt-1.5 text-xs text-red-400">{errors.confirmPassword.message}</p>
        )}
      </div>

      {/* Terms */}
      <label className="flex cursor-pointer items-start gap-2.5">
        <input
          type="checkbox"
          required
          className="mt-0.5 h-4 w-4 rounded border-border bg-surface2 accent-accent"
        />
        <span className="text-xs leading-5 text-muted">
          I agree to the{' '}
          <Link href="/terms" className="text-accent hover:underline">
            Terms of Service
          </Link>{' '}
          and{' '}
          <Link href="/privacy" className="text-accent hover:underline">
            Privacy Policy
          </Link>
        </span>
      </label>

      {/* Submit */}
      <Button type="submit" className="w-full gap-2" disabled={isSubmitting}>
        {isSubmitting ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <UserPlus className="h-4 w-4" />
        )}
        {isSubmitting ? 'Creating account…' : 'Create Free Account'}
      </Button>

      <p className="text-center text-xs text-muted">
        Already have an account?{' '}
        <Link href="/login" className="font-medium text-accent transition-colors hover:text-accent/80">
          Sign in
        </Link>
      </p>
    </form>
  );
}
