import { Head, useForm, usePage } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { FormEventHandler, useEffect, useState } from 'react';

import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/layouts/auth-layout';
import login from '@/routes/login';
import password from '@/routes/password';

type LoginForm = {
    email: string;
    password: string;
    remember: boolean;
};

interface LoginProps {
    status?: string;
    error?: string;
    canResetPassword: boolean;
}

interface PageProps extends Record<string, unknown> {
    status?: string;
    error?: string;
    canResetPassword: boolean;
    flash?: {
        type?: string;
        message?: string;
    };
}

export default function Login({ status, error, canResetPassword }: LoginProps) {
    const { flash } = usePage<PageProps>().props;
    const { data, setData, post, processing, errors, reset } = useForm<
        Required<LoginForm>
    >({
        email: '',
        password: '',
        remember: false,
    });
    const [showFlash, setShowFlash] = useState(!!flash?.message);

    useEffect(() => {
        if (flash?.message) {
            setShowFlash(true);
            // Auto-hide after 5 seconds
            const timer = setTimeout(() => {
                setShowFlash(false);
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [flash]);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(login.store.url(), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <AuthLayout
            title="Log in to your account"
            description="Enter your email and password below to log in"
        >
            <Head title="Log in" />

            <form className="flex flex-col gap-6" onSubmit={submit}>
                <div className="grid gap-6">
                    <div className="grid gap-2">
                        <Label htmlFor="email">Email address</Label>
                        <Input
                            id="email"
                            type="email"
                            required
                            autoFocus
                            tabIndex={1}
                            autoComplete="email"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            placeholder="email@example.com"
                        />
                        <InputError message={errors.email} />
                    </div>

                    <div className="grid gap-2">
                        <div className="flex items-center">
                            <Label htmlFor="password">Password</Label>
                            {canResetPassword && (
                                <TextLink
                                    href={password.request.url()}
                                    className="ml-auto text-sm"
                                    tabIndex={5}
                                >
                                    Forgot password?
                                </TextLink>
                            )}
                        </div>
                        <Input
                            id="password"
                            type="password"
                            required
                            tabIndex={2}
                            autoComplete="current-password"
                            value={data.password}
                            onChange={(e) =>
                                setData('password', e.target.value)
                            }
                            placeholder="Password"
                        />
                        <InputError message={errors.password} />
                    </div>

                    <div className="flex items-center space-x-3">
                        <Checkbox
                            id="remember"
                            name="remember"
                            checked={data.remember}
                            onClick={() => setData('remember', !data.remember)}
                            tabIndex={3}
                        />
                        <Label htmlFor="remember">Remember me</Label>
                    </div>

                    <Button
                        type="submit"
                        className="mt-4 w-full"
                        tabIndex={4}
                        disabled={processing}
                    >
                        {processing && (
                            <LoaderCircle className="h-4 w-4 animate-spin" />
                        )}
                        Log in
                    </Button>
                </div>

                {/* Registration is disabled for dashboard-only access */}
            </form>

            {showFlash && flash?.message && (
                <div
                    className={`mt-4 rounded-md border p-3 text-center text-sm font-medium ${
                        flash.type === 'error'
                            ? 'border-red-200 bg-red-50 text-red-600'
                            : 'border-green-200 bg-green-50 text-green-600'
                    }`}
                >
                    {flash.message}
                </div>
            )}

            {status && (
                <div className="mb-4 text-center text-sm font-medium text-green-600">
                    {status}
                </div>
            )}

            {error && (
                <div className="mb-4 rounded-md border border-red-200 bg-red-50 p-3 text-center text-sm font-medium text-red-600">
                    {error}
                </div>
            )}
        </AuthLayout>
    );
}
