import Link from "next/link";
import { Mail, ArrowLeft } from "lucide-react";

export default function VerifyEmailPage() {
  return (
    <div className="text-center space-y-6">
      <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto">
        <Mail className="h-8 w-8 text-primary" />
      </div>

      <div className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight">Verify your email</h1>
        <p className="text-muted-foreground text-sm max-w-sm mx-auto">
          We've sent a verification link to your email address. Please check your inbox and click the
          link to activate your account.
        </p>
      </div>

      <div className="rounded-xl border border-border bg-muted/40 p-4 text-sm text-muted-foreground space-y-1">
        <p className="font-medium text-foreground">Didn't receive the email?</p>
        <p>Check your spam or junk folder. It may take a minute or two to arrive.</p>
      </div>

      <Link
        href="/login"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to login
      </Link>
    </div>
  );
}
