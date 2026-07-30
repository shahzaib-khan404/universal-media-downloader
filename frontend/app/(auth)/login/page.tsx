import { LoginForm } from '@/features/auth/components/login-form';

export const metadata = { title: 'Sign In — Universal Media Downloader' };

export default function LoginPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Welcome back</h1>
        <p className="mt-2 text-sm text-muted">
          Sign in to access your downloads, history, and settings.
        </p>
      </div>
      <LoginForm />
    </div>
  );
}
