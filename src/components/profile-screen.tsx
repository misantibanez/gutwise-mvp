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
  Activity,
  Utensils
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
  const [selectedConditions, setSelectedConditions] = useState<string[]>(['IBS', 'Lactose Intolerance']);
  const [selectedRestrictions, setSelectedRestrictions] = useState<string[]>(['Gluten-free', 'Low FODMAP']);

  const healthConditions = [
    'IBS (Irritable Bowel Syndrome)',
    'Crohn\'s Disease',
    'Ulcerative Colitis',
    'Celiac Disease',
    'Lactose Intolerance',
    'SIBO (Small Intestinal Bacterial Overgrowth)',
    'Gastroparesis',
    'GERD (Gastroesophageal Reflux Disease)',
    'Food Allergies',
    'Non-specific digestive sensitivity'
  ];

  const dietaryRestrictions = [
    'Vegetarian',
    'Vegan',
    'Gluten-free',
    'Dairy-free',
    'Nut-free',
    'Soy-free',
    'Egg-free',
    'Shellfish-free',
    'Low FODMAP',
    'Keto',
    'Paleo',
    'Mediterranean',
    'Low sodium',
    'Low sugar',
    'Kosher',
    'Halal'
  ];

  const toggleCondition = (condition: string) => {
    setSelectedConditions(prev => 
      prev.includes(condition)
        ? prev.filter(c => c !== condition)
        : [...prev, condition]
    );
  };

  const toggleRestriction = (restriction: string) => {
    setSelectedRestrictions(prev => 
      prev.includes(restriction)
        ? prev.filter(r => r !== restriction)
        : [...prev, restriction]
    );
  };

  const menuItems = [
    {
      icon: <User className="w-5 h-5" />,
      title: "Personal Information", 
      subtitle: "Update your profile details",
      action: () => {}
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
    // Simple mock sign out - no API calls
    console.log('Mock sign out');
    
    if (onSignOut) {
      onSignOut();
    } else {
      // Navigate to home or welcome screen
      onNavigate('home');
    }
  };

  // Mock user data
  const mockUser = {
    name: 'Demo User',
    email: 'demo@gutwise.com'
  };

  const displayName = user?.name || mockUser.name;
  const displayEmail = user?.email || mockUser.email;

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

      {/* Health Conditions */}
      <Card className="bg-gray-800 border-gray-700 p-6">
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-green-500 rounded-lg flex items-center justify-center">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <div>
              <h4 className="text-white">Health Conditions</h4>
              <p className="text-sm text-gray-400">Select your digestive conditions for personalized recommendations</p>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="text-sm text-gray-300">
              Currently managing: <span className="text-green-400">{selectedConditions.length} condition{selectedConditions.length !== 1 ? 's' : ''}</span>
            </div>
            <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto">
              {healthConditions.map(condition => {
                const isSelected = selectedConditions.includes(condition);
                return (
                  <button
                    key={condition}
                    onClick={() => toggleCondition(condition)}
                    className={`p-3 rounded-lg text-left transition-all ${
                      isSelected 
                        ? 'bg-blue-600 text-white border border-blue-500' 
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600 border border-gray-600'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm">{condition}</span>
                      {isSelected && <CheckCircle className="w-4 h-4" />}
                    </div>
                  </button>
                );
              })}
            </div>
            {selectedConditions.length > 0 && (
              <div className="pt-2">
                <p className="text-xs text-gray-400">
                  These conditions help us personalize your food recommendations and safety scores.
                </p>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Dietary Restrictions */}
      <Card className="bg-gray-800 border-gray-700 p-6">
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-red-500 rounded-lg flex items-center justify-center">
              <Utensils className="w-5 h-5 text-white" />
            </div>
            <div>
              <h4 className="text-white">Dietary Restrictions</h4>
              <p className="text-sm text-gray-400">Select your dietary preferences and restrictions</p>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="text-sm text-gray-300">
              Following: <span className="text-orange-400">{selectedRestrictions.length} restriction{selectedRestrictions.length !== 1 ? 's' : ''}</span>
            </div>
            <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
              {dietaryRestrictions.map(restriction => {
                const isSelected = selectedRestrictions.includes(restriction);
                return (
                  <button
                    key={restriction}
                    onClick={() => toggleRestriction(restriction)}
                    className={`p-3 rounded-lg text-left transition-all ${
                      isSelected 
                        ? 'bg-orange-600 text-white border border-orange-500' 
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600 border border-gray-600'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm">{restriction}</span>
                      {isSelected && <CheckCircle className="w-4 h-4" />}
                    </div>
                  </button>
                );
              })}
            </div>
            {selectedRestrictions.length > 0 && (
              <div className="pt-2">
                <p className="text-xs text-gray-400">
                  These preferences help us filter restaurants and dishes that match your dietary needs.
                </p>
              </div>
            )}
          </div>
        </div>
      </Card>

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