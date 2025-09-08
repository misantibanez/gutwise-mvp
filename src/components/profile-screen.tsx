import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Separator } from "./ui/separator";
import { Switch } from "./ui/switch";
import { Badge } from "./ui/badge";
import { 
  User, 
  Settings, 
  Bell, 
  Shield, 
  HelpCircle, 
  LogOut, 
  ChevronRight,
  Heart,
  Calendar,
  CheckCircle,
  ExternalLink,
  Activity
} from "lucide-react";

interface ProfileScreenProps {
  onNavigate: (screen: string) => void;
  onBack: () => void;
  onSignOut?: () => void;
  user?: any;
}

export function ProfileScreen({ onNavigate, onBack, onSignOut, user }: ProfileScreenProps) {
  const [floConnected, setFloConnected] = useState(false);
  const [notifications, setNotifications] = useState(true);

  const menuItems = [
    {
      icon: <User className="w-5 h-5" />,
      title: "Personal Information",
      subtitle: "Update your profile details",
      action: () => {}
    },
    {
      icon: <Activity className="w-5 h-5" />,
      title: "Health Conditions",
      subtitle: "Manage your digestive conditions",
      action: () => onNavigate('health-conditions')
    },
    {
      icon: <Bell className="w-5 h-5" />,
      title: "Notifications",
      subtitle: "Meal reminders and check-ins",
      action: () => {},
      toggle: true,
      toggleValue: notifications,
      onToggle: setNotifications
    },
    {
      icon: <Shield className="w-5 h-5" />,
      title: "Privacy & Data",
      subtitle: "Manage your data preferences",
      action: () => {}
    },
    {
      icon: <HelpCircle className="w-5 h-5" />,
      title: "Help & Support",
      subtitle: "Get help and contact support",
      action: () => {}
    }
  ];

  const handleFloConnect = () => {
    if (!floConnected) {
      // Simulate connection process
      setFloConnected(true);
    } else {
      setFloConnected(false);
    }
  };

  const handleSignOut = async () => {
    try {
      // Import Supabase client and sign out
      const { supabase } = await import('../utils/supabase/client');
      await supabase.auth.signOut();
      
      console.log('User signed out successfully');
      
      if (onSignOut) {
        onSignOut();
      }
    } catch (error) {
      console.error('Sign out error:', error);
      // Fallback to just navigate to welcome
      if (onSignOut) {
        onSignOut();
      }
    }
  };

  const displayName = user?.name || user?.email?.split('@')[0] || 'Demo User';
  const displayEmail = user?.email || 'demo@gutwise.com';

  return (
    <div className="space-y-6" data-frame="[screen:Profile]">
      {/* Header */}
      <div className="flex items-center justify-between py-4">
        <Button 
          variant="ghost" 
          onClick={onBack}
          className="text-gray-300 hover:text-white hover:bg-gray-800"
        >
          ← Back
        </Button>
        <h2 className="text-white">Profile</h2>
        <div></div>
      </div>

      {/* User Info */}
      <Card className="bg-gray-800 border-gray-700 p-6">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center">
            <User className="w-8 h-8 text-white" />
          </div>
          <div className="flex-1">
            <>
              <h3 className="text-white text-lg">{displayName}</h3>
              <p className="text-gray-400">{displayEmail}</p>
              <Badge variant="outline" className="mt-2 border-green-400 text-green-300">
                Premium Member
              </Badge>
            </>
          </div>
        </div>
      </Card>

      {/* Flo Integration */}
      <Card className="bg-gray-800 border-gray-700 p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-pink-400 to-purple-500 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <div>
                <h4 className="text-white">Flo Integration</h4>
                <p className="text-sm text-gray-400">Connect your cycle data for better insights</p>
              </div>
            </div>
            {floConnected && (
              <Badge className="bg-green-600 text-white border-0">
                <CheckCircle className="w-3 h-3 mr-1" />
                Connected
              </Badge>
            )}
          </div>
          
          {!floConnected ? (
            <div className="space-y-3">
              <p className="text-sm text-gray-300 leading-relaxed">
                Connect with Flo to understand how your menstrual cycle affects your digestive health. 
                We'll help you identify patterns between cycle phases and food sensitivities.
              </p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="text-xs border-blue-400 text-blue-300">
                  Cycle tracking
                </Badge>
                <Badge variant="outline" className="text-xs border-purple-400 text-purple-300">
                  Hormone insights
                </Badge>
                <Badge variant="outline" className="text-xs border-green-400 text-green-300">
                  Pattern analysis
                </Badge>
              </div>
              <Button
                onClick={handleFloConnect}
                className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Connect with Flo
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="bg-gray-700 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-300">Cycle Day</span>
                  <span className="text-white">14</span>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-300">Current Phase</span>
                  <Badge className="bg-purple-600 text-white border-0">Ovulation</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-300">Sync Status</span>
                  <span className="text-green-400 text-sm">Last synced 2h ago</span>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-700"
                >
                  View Insights
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setFloConnected(false)}
                  className="border-red-600 text-red-300 hover:bg-red-600/10"
                >
                  Disconnect
                </Button>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Menu Items */}
      <div className="space-y-1">
        {menuItems.map((item, index) => (
          <Card key={index} className="bg-gray-800 border-gray-700">
            {item.toggle && item.onToggle ? (
              <div className="p-4 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="text-gray-400">
                    {item.icon}
                  </div>
                  <div className="text-left">
                    <div className="text-white">{item.title}</div>
                    <div className="text-sm text-gray-400">{item.subtitle}</div>
                  </div>
                </div>
                <Switch
                  checked={item.toggleValue}
                  onCheckedChange={item.onToggle}
                />
              </div>
            ) : (
              <button
                onClick={item.action}
                className="w-full p-4 flex items-center justify-between hover:bg-gray-700 transition-colors rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <div className="text-gray-400">
                    {item.icon}
                  </div>
                  <div className="text-left">
                    <div className="text-white">{item.title}</div>
                    <div className="text-sm text-gray-400">{item.subtitle}</div>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </button>
            )}
          </Card>
        ))}
      </div>

      {/* Sign Out */}
      <Card className="bg-gray-800 border-gray-700">
        <button
          onClick={handleSignOut}
          className="w-full p-4 flex items-center space-x-3 hover:bg-gray-700 transition-colors rounded-lg"
        >
          <LogOut className="w-5 h-5 text-red-400" />
          <span className="text-red-400">Sign Out</span>
        </button>
      </Card>

      {/* App Version */}
      <div className="text-center py-4">
        <p className="text-xs text-gray-500">
          GutWise v1.2.0
        </p>
      </div>
    </div>
  );
}