import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { getCurrentUser } from '@/lib/session';
import { AuthForm } from '@/components/auth-form';

export const metadata: Metadata = {
  title: 'Sign in - Easy Notes',
  description: 'Sign in to your account or create a new one',
};

interface AuthenticatePageProps {
  searchParams: Promise<{ mode?: string; callbackUrl?: string }>;
}

export default async function AuthenticatePage({ searchParams }: AuthenticatePageProps) {
  const user = await getCurrentUser();
  const params = await searchParams;

  if (user) {
    const callbackUrl = params.callbackUrl || '/dashboard';

    // Validate callback URL to prevent open redirects
    if (callbackUrl && (!callbackUrl.startsWith('/') || callbackUrl.startsWith('//'))) {
      redirect('/dashboard');
    }

    redirect(decodeURIComponent(callbackUrl));
  }

  const mode = params.mode === 'register' ? 'register' : 'login';

  return <AuthForm mode={mode} />;
}
