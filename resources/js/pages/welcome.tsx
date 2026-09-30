import { Head, Link, usePage } from '@inertiajs/react';

export default function Welcome() {
    const { auth } = usePage().props as any;

    return (
        <>
            <Head title="Welcome" />
            <div className="flex min-h-screen flex-col items-center justify-center bg-[#FDFDFC] p-6 text-[#1b1b18] lg:p-8 dark:bg-[#0a0a0a]">
                <header className="mb-6 w-full max-w-[335px] text-sm lg:max-w-4xl">
                    <nav className="flex items-center justify-end gap-4">
                        {auth?.user ? (
                            <Link
                                href={auth.user.role === 'owner' ? '/owner/dashboard' : '/pos'}
                                className="inline-block rounded-sm border border-[#19140a35] px-5 py-1.5 text-sm leading-normal text-[#1b1b18] hover:border-[#1915014a] dark:text-[#EDEDEC]"
                            >
                                Dashboard
                            </Link>
                        ) : (
                            <>
                                <Link
                                    href="/login"
                                    className="inline-block rounded-sm border border-transparent px-5 py-1.5 text-sm leading-normal text-[#1b1b18] hover:border-[#19140a35] dark:text-[#EDEDEC]"
                                >
                                    Log in
                                </Link>
                                <Link
                                    href="/register"
                                    className="inline-block rounded-sm border border-[#19140a35] px-5 py-1.5 text-sm leading-normal text-[#1b1b18] hover:border-[#1915014a] dark:text-[#EDEDEC]"
                                >
                                    Register
                                </Link>
                            </>
                        )}
                    </nav>
                </header>

                <main className="text-center space-y-4">
                    <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">
                        Welcome to <span className="text-amber-500">POS Membership</span>
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400 max-w-md mx-auto">
                        A simple and efficient POS system for managing your business transactions and customer memberships.
                    </p>
                </main>
            </div>
        </>
    );
}