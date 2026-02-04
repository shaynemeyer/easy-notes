'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { z } from 'zod';
import { authClient } from '@/lib/auth-client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password must be at most 128 characters'),
});

interface AuthFormProps {
  mode: 'login' | 'register';
}

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    form?: string;
  }>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setIsLoading(true);

    try {
      const schema = mode === 'login' ? loginSchema : registerSchema;
      const validated = schema.parse({ email, password });

      if (mode === 'login') {
        const { data, error } = await authClient.signIn.email({
          email: validated.email,
          password: validated.password,
          callbackURL: callbackUrl,
        });

        if (error) {
          setErrors({
            form:
              error.message === 'Invalid email or password'
                ? 'Invalid email or password'
                : 'An error occurred. Please try again.',
          });
          setIsLoading(false);
          return;
        }

        router.push(callbackUrl);
      } else {
        const { data, error } = await authClient.signUp.email({
          email: validated.email,
          password: validated.password,
          name: validated.email,
          callbackURL: callbackUrl,
        });

        if (error) {
          setErrors({
            form:
              error.message === 'User already exists'
                ? 'An account with this email already exists'
                : 'An error occurred. Please try again.',
          });
          setIsLoading(false);
          return;
        }

        router.push(callbackUrl);
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: { email?: string; password?: string } = {};
        error.issues.forEach((err) => {
          const path = err.path[0] as 'email' | 'password';
          fieldErrors[path] = err.message;
        });
        setErrors(fieldErrors);
      } else {
        setErrors({ form: 'An unexpected error occurred' });
      }
      setIsLoading(false);
    }
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (errors.email) {
      setErrors((prev) => ({ ...prev, email: undefined }));
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    if (errors.password) {
      setErrors((prev) => ({ ...prev, password: undefined }));
    }
  };

  const handleModeSwitch = () => {
    setEmail('');
    setPassword('');
    setErrors({});
    const newMode = mode === 'login' ? 'register' : 'login';
    const currentCallbackUrl = searchParams.get('callbackUrl');

    const url = currentCallbackUrl
      ? `/authenticate?mode=${newMode}&callbackUrl=${currentCallbackUrl}`
      : `/authenticate?mode=${newMode}`;

    router.push(url);
  };

  return (
    <div className='min-h-screen flex items-center justify-center p-4 bg-zinc-50 dark:bg-zinc-950'>
      <div className='max-w-md w-full bg-white dark:bg-zinc-900 p-8 rounded-lg shadow-lg'>
        <h1 className='text-2xl font-bold text-center mb-6 text-zinc-900 dark:text-zinc-100'>
          {mode === 'login' ? 'Sign in to your account' : 'Create an account'}
        </h1>

        {errors.form && (
          <div className='mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg'>
            <p className='text-sm text-red-600 dark:text-red-400'>{errors.form}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className='space-y-4'>
          <Input
            label='Email'
            name='email'
            type='email'
            value={email}
            onChange={handleEmailChange}
            error={errors.email}
            placeholder='you@example.com'
            disabled={isLoading}
          />

          <Input
            label='Password'
            name='password'
            type='password'
            value={password}
            onChange={handlePasswordChange}
            error={errors.password}
            placeholder='••••••••'
            disabled={isLoading}
          />

          <Button type='submit' loading={isLoading}>
            {mode === 'login' ? 'Sign in' : 'Create account'}
          </Button>
        </form>

        <div className='mt-6 text-center'>
          <button
            type='button'
            onClick={handleModeSwitch}
            disabled={isLoading}
            className='text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 disabled:opacity-50 disabled:cursor-not-allowed'
          >
            {mode === 'login'
              ? "Don't have an account? Create one"
              : 'Already have an account? Sign in'}
          </button>
        </div>
      </div>
    </div>
  );
}
