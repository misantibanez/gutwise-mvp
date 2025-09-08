import { useState } from "react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Mail, CheckCircle, ArrowLeft } from "lucide-react";
import { supabase } from "../utils/supabase/client";

interface EmailVerificationScreenProps {
  onNavigate: (screen: string) => void;
  userEmail?: string;
}

export function EmailVerificationScreen({ onNavigate, userEmail }: EmailVerificationScreenProps) {
  const [isResending, setIsResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleResendEmail = async () => {
    if (!userEmail) return;
    
    setIsResending(true);
    setError("");
    setResendSuccess(false);

    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: userEmail
      });

      if (error) {
        setError(error.message);
      } else {
        setResendSuccess(true);
        setTimeout(() => setResendSuccess(false), 5000); // Hide success message after 5 seconds
      }
    } catch (err: any) {
      console.error('Resend email error:', err);
      setError(err.message || 'Failed to resend verification email');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center space-y-8 px-4" data-frame="[screen:EmailVerification]">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Mail className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-white text-2xl">Check Your Email</h1>
        <p className="text-gray-400 max-w-sm mx-auto">
          We've sent a verification link to your email address. Please check your inbox and click the link to verify your account.
        </p>
      </div>

      {/* Main Card */}
      <Card className="w-full max-w-sm bg-gray-800 border-gray-700 p-6 space-y-6">
        {/* Email Address Display */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center space-x-2">
            <Mail className="w-4 h-4 text-blue-400" />
            <span className="text-sm text-gray-300">{userEmail}</span>
          </div>
        </div>

        {/* Instructions */}
        <div className="space-y-4">
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <CheckCircle className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
              <div className="space-y-2">
                <p className="text-blue-400 text-sm font-medium">Next Steps:</p>
                <ol className="text-gray-300 text-sm space-y-1 list-decimal list-inside">
                  <li>Check your email inbox</li>
                  <li>Look for an email from GutWise</li>
                  <li>Click the verification link</li>
                  <li>Return here to sign in</li>
                </ol>
              </div>
            </div>
          </div>

          {/* Don't see the email? */}
          <div className="text-center space-y-3">
            <p className="text-sm text-gray-400">
              Don't see the email? Check your spam folder or
            </p>
            
            <Button
              onClick={handleResendEmail}
              disabled={isResending}
              variant="outline"
              className="w-full bg-transparent border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              {isResending ? "Sending..." : "Resend Verification Email"}
            </Button>
            
            {resendSuccess && (
              <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                <p className="text-green-400 text-sm">✓ Verification email sent successfully!</p>
              </div>
            )}
            
            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}
          </div>
        </div>

        {/* Sign In Button */}
        <div className="pt-4 border-t border-gray-700">
          <Button
            onClick={() => onNavigate('auth')}
            className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white"
          >
            Continue to Sign In
          </Button>
        </div>
      </Card>

      {/* Back to Welcome */}
      <Button
        onClick={() => onNavigate('welcome')}
        variant="ghost"
        className="text-gray-400 hover:text-gray-300"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Welcome
      </Button>

      {/* Help Text */}
      <p className="text-xs text-gray-500 text-center max-w-sm leading-relaxed">
        Having trouble? The verification link will expire in 24 hours. You can request a new one anytime.
      </p>
    </div>
  );
}