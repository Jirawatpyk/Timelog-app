'use client';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Loader2, Eye, EyeOff, CalendarClock } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useTransition, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, type LoginInput } from '@/schemas/auth.schema';
import { login } from '@/actions/auth';

export function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<'div'>) {
  const [isPending, startTransition] = useTransition();
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const router = useRouter();

  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  // Load remembered email on mount
  useEffect(() => {
    const rememberedEmail = localStorage.getItem('timelog_remembered_email');
    if (rememberedEmail) {
      form.setValue('email', rememberedEmail);
      setRememberMe(true);
    }
  }, [form]);

  const onSubmit = (data: LoginInput) => {
    startTransition(async () => {
      const result = await login(data);
      if (result.success) {
        // Save or remove remembered email
        if (rememberMe) {
          localStorage.setItem('timelog_remembered_email', data.email);
        } else {
          localStorage.removeItem('timelog_remembered_email');
        }
        router.push('/entry');
        router.refresh();
      } else {
        form.setError('root', { message: result.error });
      }
    });
  };

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      {/* Logo */}
      <div className="flex items-center justify-center gap-2">
        <CalendarClock className="h-8 w-8 text-primary" />
        <span className="text-2xl font-bold">Timelog</span>
      </div>

      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Welcome back</CardTitle>
          <CardDescription>
            Enter your company email below to login
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {form.formState.errors.root && (
              <div className="text-sm text-red-500 bg-red-50 dark:bg-red-950 p-3 rounded-md">
                {form.formState.errors.root.message}
              </div>
            )}

            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@company.com"
                disabled={isPending}
                {...form.register('email')}
              />
              {form.formState.errors.email && (
                <span className="text-sm text-red-500">
                  {form.formState.errors.email.message}
                </span>
              )}
            </div>

            <div className="grid gap-2">
              <div className="flex items-center">
                <Label htmlFor="password">Password</Label>
                <Link
                  href="/forgot-password"
                  className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                >
                  Forgot your password?
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  disabled={isPending}
                  className="pr-10"
                  {...form.register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {form.formState.errors.password && (
                <span className="text-sm text-red-500">
                  {form.formState.errors.password.message}
                </span>
              )}
            </div>

            {/* Remember me */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="remember"
                checked={rememberMe}
                onCheckedChange={(checked) => setRememberMe(checked === true)}
                disabled={isPending}
              />
              <Label
                htmlFor="remember"
                className="text-sm font-normal cursor-pointer"
              >
                Remember me
              </Label>
            </div>

            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Logging in...
                </>
              ) : (
                'Login'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
