import { RegisterForm } from '@/features/auth/components/register-form';

export const metadata = { title: 'Create Account — Universal Media Downloader' };

export default function RegisterPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Create your account</h1>
        <p className="mt-2 text-sm text-muted">
          Free forever. No credit card required.
        </p>
      </div>
      <RegisterForm />
    </div>
  );
}
