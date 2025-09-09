import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card } from "./ui/card";
import { Separator } from "./ui/separator";
import { Heart, Mail, Lock, Eye, EyeOff } from "lucide-react";

interface AuthScreenProps {
  onNavigate: (screen: string) => void;
  onAuthSuccess: (user: any) => void;
  onBack: () => void;
  onSignIn?: () => void;
}

export function AuthScreen({ onNavigate, onAuthSuccess, onBack, onSignIn }: AuthScreenProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // For Azure App Service, redirect to Azure authentication
    if (onSignIn) {
      onSignIn();
    } else {
      // Fallback mock authentication for development
      setTimeout(() => {
        const mockUser = {
          name: name.trim() || email.split('@')[0] || 'Demo User',
          email: email || 'demo@gutwise.com'
        };
        
        console.log('Mock auth successful:', mockUser);
        onAuthSuccess(mockUser);
        setIsLoading(false);
      }, 1000);
    }
  };

  const handleAzureSignIn = () => {
    setIsLoading(true);
    
    if (onSignIn) {
      // Use Azure App Service authentication
      onSignIn();
    } else {
      // Fallback mock Azure auth for development
      setTimeout(() => {
        const mockUser = {
          name: 'Demo User (Azure)',
          email: 'demo@company.com'
        };
        
        console.log('Mock Azure auth successful:', mockUser);
        onAuthSuccess(mockUser);
        setIsLoading(false);
      }, 1000);
    }
  };

  const handleOAuthSignIn = (provider: string) => {
    setIsLoading(true);
    
    // Simple mock OAuth for development/demo
    setTimeout(() => {
      const mockUser = {
        name: `Demo User (${provider})`,
        email: `demo@${provider}.com`
      };
      
      console.log(`Mock ${provider} auth successful:`, mockUser);
      onAuthSuccess(mockUser);
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center space-y-8 px-4" data-frame="[screen:Auth]">
      {/* Logo/Brand Section */}
      <div className="text-center space-y-4">
        <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Heart className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-white text-2xl">
          Welcome to GutWise
        </h1>
        <p className="text-gray-400 max-w-sm mx-auto">
          Sign in with your organization account to continue your digestive wellness journey
        </p>
      </div>

      {/* Auth Options */}
      <Card className="w-full max-w-sm bg-gray-800 border-gray-700 p-6">
        <div className="space-y-4">
          {/* Primary Azure Sign In */}
          <Button
            type="button"
            onClick={handleAzureSignIn}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-3"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>Signing in...</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M11.4 24H0V12.6h11.4V24zM24 24H12.6V12.6H24V24zM11.4 11.4H0V0h11.4v11.4zM24 11.4H12.6V0H24v11.4z"/>
                </svg>
                <span>Sign in with Microsoft</span>
              </div>
            )}
          </Button>

          <div className="relative">
            <Separator className="bg-gray-600" />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="bg-gray-800 px-2 text-sm text-gray-400">or for demo</span>
            </div>
          </div>
          
          <div className="space-y-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOAuthSignIn('google')}
              className="w-full bg-transparent border-gray-600 text-gray-300 hover:bg-gray-700"
              disabled={isLoading}
            >
              Continue with Google
            </Button>
            
            {/* Skip Demo Button */}
            <Button
              type="button"
              variant="ghost"
              onClick={() => onAuthSuccess({
                name: 'Demo User',
                email: 'demo@gutwise.com'
              })}
              className="w-full text-gray-400 hover:text-white hover:bg-gray-700"
              disabled={isLoading}
            >
              Skip - Try Demo
            </Button>
          </div>
        </div>
      </Card>

      {/* Back Button */}
      <Button
        variant="ghost"
        onClick={onBack}
        className="text-gray-400 hover:text-white"
        disabled={isLoading}
      >
        ← Back to Welcome
      </Button>

      {/* Terms */}
      <p className="text-xs text-gray-500 text-center max-w-sm leading-relaxed">
        By continuing, you agree to our{" "}
        <span className="text-blue-400">Terms of Service</span> and{" "}
        <span className="text-blue-400">Privacy Policy</span>
      </p>
    </div>
  );
}