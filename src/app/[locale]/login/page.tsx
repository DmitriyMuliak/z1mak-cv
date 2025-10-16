'use client';

import { LoginForm } from '@/components/login-form';

export default function LoginPage() {
  return (
    // <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
    //   <div className="flex w-full max-w-sm flex-col gap-6">

    //   </div>
    // </div>
    <div className="flex flex-col items-center justify-center gap-6 p-6 md:p-8">
      <div className="frosted-card p-6 flex w-full max-w-sm flex-col gap-6">
        <LoginForm />
      </div>
    </div>
  );
}
// lab(2.51107% .242703 -.886115)
