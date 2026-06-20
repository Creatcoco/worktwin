import AuthForm from "@/components/AuthForm";

export default function LoginPage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] px-6 py-12 flex items-center justify-center hero-grid">
      <AuthForm mode="login" />
    </div>
  );
}
