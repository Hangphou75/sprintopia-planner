import { SignUpForm } from "@/components/auth/SignUpForm";

export const Register = () => {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md space-y-8 px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Inscription</h1>
          <p className="mt-2 text-sm text-gray-600">
            Créez votre compte
          </p>
        </div>
        <SignUpForm />
      </div>
    </div>
  );
};