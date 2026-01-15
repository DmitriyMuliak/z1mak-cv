import { SignUpForm } from './SignUpForm';

export default function SignUpPage() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center w-full pb-4 md:p-8">
      <div className="frosted-card p-2 sm:p-6 flex w-full max-w-sm flex-col">
        <SignUpForm />
      </div>
    </div>
  );
}
