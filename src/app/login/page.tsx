import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { LoginForm } from "@/components/login-form";

export default async function LoginPage() {
  const user = await getSessionUser();
  if (user) redirect("/dashboard");

  return (
    <main className="relative flex min-h-screen flex-1 items-center justify-center bg-[#f8f9fa] px-4 py-12">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-docs-blue-soft/70 to-transparent" />
      <div className="relative z-10 w-full flex justify-center">
        <LoginForm />
      </div>
    </main>
  );
}
