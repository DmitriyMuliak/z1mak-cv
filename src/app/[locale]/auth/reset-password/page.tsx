import { ResetPasswordForm } from './ResetPasswordForm';

export default function LoginPage() {
  return (
    <div className="flex flex-col items-center justify-center gap-6 sm:p-6 md:p-8">
      <div className="frosted-card p-2 sm:p-6 flex w-full max-w-sm flex-col gap-6">
        <ResetPasswordForm />
      </div>
    </div>
  );
}
