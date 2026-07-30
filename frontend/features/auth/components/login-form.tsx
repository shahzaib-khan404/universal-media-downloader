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
        <div className="mb-1.5 flex items-center justify-between">
          <label className="text-xs font-medium uppercase tracking-wider text-muted">
            Password
          </label>
          <Link
            href="/forgot-password"
            className="text-xs text-accent transition-colors hover:text-accent/80"
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

      {/* Remember me */}
      <label className="flex cursor-pointer items-center gap-2.5">
        <input
          type="checkbox"
          className="h-4 w-4 rounded border-border bg-surface2 accent-accent"
        />
        <span className="text-xs text-muted">Remember me for 30 days</span>
      </label>

      {/* Submit */}
      <Button type="submit" className="w-full gap-2" disabled={isSubmitting}>
        {isSubmitting ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <LogIn className="h-4 w-4" />
        )}
        {isSubmitting ? 'Signing in…' : 'Sign In'}
      </Button>

      <p className="text-center text-xs text-muted">
        Don&apos;t have an account?{' '}
        <Link href="/register" className="font-medium text-accent transition-colors hover:text-accent/80">
          Create one
        </Link>
      </p>
    </form>
  );
}
