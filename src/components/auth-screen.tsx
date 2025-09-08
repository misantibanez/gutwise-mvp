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
}

export function AuthScreen({ onNavigate, onAuthSuccess, onBack }: AuthScreenProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simple mock authentication - no API calls
    setTimeout(() => {
      const mockUser = {
        name: name.trim() || email.split('@')[0] || 'Demo User',
        email: email || 'demo@gutwise.com'
      };
      
      console.log('Mock auth successful:', mockUser);
      onAuthSuccess(mockUser);
      setIsLoading(false);
    }, 1000);
  };

  const handleOAuthSignIn = (provider: string) => {
    setIsLoading(true);
    
    // Simple mock OAuth
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
          {isLogin ? "Welcome Back" : "Join GutWise"}
        </h1>
        <p className="text-gray-400 max-w-sm mx-auto">
          {isLogin 
            ? "Sign in to continue your digestive wellness journey" 
            : "Start your personalized digestive health journey"
          }
        </p>
      </div>

      {/* Auth Form */}
      <Card className="w-full max-w-sm bg-gray-800 border-gray-700 p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div className="space-y-2">
              <label className="text-sm text-gray-300">Full Name</label>
              <Input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
              />
            </div>
          )}
          
          <div className="space-y-2">
            <label className="text-sm text-gray-300">Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 pl-10"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm text-gray-300">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <Input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 pl-10 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {isLogin && (
            <div className="text-right">
              <button
                type="button"
                className="text-sm text-blue-400 hover:text-blue-300"
              >
                Forgot password?
              </button>
            </div>
          )}

          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white py-2"
            disabled={isLoading}
          >
            {isLoading ? "Loading..." : (isLogin ? "Sign In" : "Create Account")}
          </Button>
        </form>

        <div className="mt-6">
          <div className="relative">
            <Separator className="bg-gray-600" />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="bg-gray-800 px-2 text-sm text-gray-400">or</span>
            </div>
          </div>
          
          <div className="mt-4 space-y-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOAuthSignIn('google')}
              className="w-full bg-transparent border-gray-600 text-gray-300 hover:bg-gray-700"
              disabled={isLoading}
            >
              Continue with Google
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOAuthSignIn('apple')}
              className="w-full bg-transparent border-gray-600 text-gray-300 hover:bg-gray-700"
              disabled={isLoading}
            >
              Continue with Apple
            </Button>
            
            {/* Skip Demo Button */}
            <Button
              type="button"
              variant="ghost"
              onClick={() => onAuthSuccess()}
              className="w-full text-gray-400 hover:text-white hover:bg-gray-700"
              disabled={isLoading}
            >
              Skip - Try Demo
            </Button>
          </div>
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-400">
            {isLogin ? "Don't have an account?" : "Already have an account?"}
            {" "}
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-blue-400 hover:text-blue-300"
            >
              {isLogin ? "Sign up" : "Sign in"}
            </button>
          </p>
        </div>
      </Card>

      {/* Terms */}
      <p className="text-xs text-gray-500 text-center max-w-sm leading-relaxed">
        By continuing, you agree to our{" "}
        <span className="text-blue-400">Terms of Service</span> and{" "}
        <span className="text-blue-400">Privacy Policy</span>
      </p>
    </div>
  );
}