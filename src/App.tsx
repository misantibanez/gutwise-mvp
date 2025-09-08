import { useState, useEffect } from 'react';
import { AuthScreen } from './components/auth-screen';
import { ProfileScreen } from './components/profile-screen';
import { HealthConditionsScreen } from './components/health-conditions-screen';
import { WelcomeScreen } from './components/welcome-screen';
import { HomeDashboard } from './components/home-dashboard';
import { RestaurantSuggestions } from './components/restaurant-suggestions';
import { MenuAnalysis } from './components/menu-analysis';
import { MealLogger } from './components/meal-logger';
import { SymptomTracker } from './components/symptom-tracker';
import { InsightsDashboard } from './components/insights-dashboard';
import { AllMealsScreen } from './components/all-meals-screen';
import { MealLoggedSuccess } from './components/meal-logged-success';
import { SuccessScreen } from './components/success-screens';
import { BottomNavigation } from './components/bottom-navigation';
import { CheckInModal } from './components/check-in-modal';
import { EmailVerificationScreen } from './components/email-verification-screen';
import { supabase } from './utils/supabase/client';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('loading');
  const [showCheckIn, setShowCheckIn] = useState(false);
  const [screenData, setScreenData] = useState<any>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [session, setSession] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing session on app load
  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error('Error getting session:', error);
        } else {
          setSession(session);
          if (session?.user) {
            // Store access token for API calls
            if (session.access_token) {
              localStorage.setItem('supabase_access_token', session.access_token);
            }
            
            setCurrentUser({
              id: session.user.id,
              email: session.user.email,
              name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'User'
            });
            setCurrentScreen('home');
          } else {
            setCurrentScreen('welcome');
          }
        }
      } catch (error) {
        console.error('Session check failed:', error);
        setCurrentScreen('welcome');
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.email);
      setSession(session);
      
      if (session?.user) {
        // Store access token in localStorage for API calls
        if (session.access_token) {
          localStorage.setItem('supabase_access_token', session.access_token);
        }
        
        setCurrentUser({
          id: session.user.id,
          email: session.user.email,
          name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'User'
        });
        // Only auto-navigate to home if we're coming from auth or welcome
        setCurrentScreen(prev => {
          if (prev === 'auth' || prev === 'welcome' || prev === 'loading') {
            return 'home';
          }
          return prev; // Keep current screen if we're already authenticated and navigating
        });
      } else {
        // Clear token on sign out
        localStorage.removeItem('supabase_access_token');
        setCurrentUser(null);
        setCurrentScreen('welcome');
      }
    });

    return () => subscription.unsubscribe();
  }, []); // Remove currentScreen dependency

  // Simulate location-based check-in after a delay
  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentScreen === 'home' && !showCheckIn && session) {
        setShowCheckIn(true);
      }
    }, 5000);

    return () => clearTimeout(timer);
  }, [currentScreen, showCheckIn, session]);

  const handleNavigate = (screen: string, data?: any) => {
    console.log('handleNavigate called with screen:', screen, 'data:', data);
    setCurrentScreen(screen);
    setScreenData(data);
    setShowCheckIn(false);
  };

  const handleAuthSuccess = (user: any) => {
    setCurrentUser(user);
    setCurrentScreen('home');
  };

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Error signing out:', error);
      }
      setCurrentUser(null);
      setSession(null);
      setCurrentScreen('welcome');
    } catch (error) {
      console.error('Sign out failed:', error);
      // Still clear local state even if sign out fails
      setCurrentUser(null);
      setSession(null);
      setCurrentScreen('welcome');
    }
  };

  const handleBack = () => {
    // Simple back navigation logic
    switch (currentScreen) {
      case 'suggestions':
      case 'restaurants':
      case 'insights':
      case 'log-meal':
      case 'all-meals':
      case 'history':
        setCurrentScreen('home');
        break;
      case 'menu':
        setCurrentScreen('restaurants');
        break;
      case 'symptom-tracker':
        setCurrentScreen('home');
        break;
      case 'confirmation':
      case 'feedback-success':
        setCurrentScreen('home');
        break;
      case 'health-conditions':
        setCurrentScreen('profile');
        break;
      default:
        setCurrentScreen('home');
    }
    setScreenData(null);
  };

  // Show loading screen while checking session
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-blue-500 rounded-2xl flex items-center justify-center mx-auto animate-pulse">
            <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-gray-400">Loading GutWise...</p>
        </div>
      </div>
    );
  }

  const renderScreen = () => {
    console.log('Rendering screen:', currentScreen);
    switch (currentScreen) {
      case 'welcome':
        return <WelcomeScreen onNavigate={handleNavigate} />;
      
      case 'auth':
        return <AuthScreen onNavigate={handleNavigate} onAuthSuccess={handleAuthSuccess} />;
      
      case 'email-verification':
        return <EmailVerificationScreen onNavigate={handleNavigate} userEmail={screenData?.userEmail} />;
      
      case 'home':
        return <HomeDashboard onNavigate={handleNavigate} />;
      
      case 'suggestions':
      case 'restaurants':
        return (
          <RestaurantSuggestions 
            onNavigate={handleNavigate} 
            onBack={handleBack}
          />
        );
      
      case 'menu':
        return (
          <MenuAnalysis 
            restaurant={screenData?.restaurant}
            onNavigate={handleNavigate}
            onBack={handleBack}
          />
        );
      
      case 'log-meal':
        return (
          <MealLogger
            dish={screenData?.dish}
            restaurant={screenData?.restaurant}
            onNavigate={handleNavigate}
            onBack={handleBack}
          />
        );
      
      case 'symptom-tracker':
        return (
          <SymptomTracker
            meal={screenData?.meal}
            onNavigate={handleNavigate}
            onBack={handleBack}
          />
        );
      
      case 'insights':
        return (
          <InsightsDashboard 
            onBack={handleBack} 
            onNavigate={handleNavigate}
          />
        );
      
      case 'all-meals':
      case 'history':
        return (
          <AllMealsScreen 
            onBack={handleBack} 
            onNavigate={handleNavigate}
          />
        );
      
      case 'meal-logged-success':
        return (
          <MealLoggedSuccess 
            onNavigate={handleNavigate}
            meal={screenData?.meal}
          />
        );
      
      case 'confirmation':
        return (
          <SuccessScreen 
            type="meal-logged" 
            onNavigate={handleNavigate}
          />
        );
      
      case 'feedback-success':
        return (
          <SuccessScreen 
            type="feedback-submitted" 
            onNavigate={handleNavigate}
          />
        );
      
      case 'profile':
        return (
          <ProfileScreen 
            onNavigate={handleNavigate}
            onBack={handleBack}
            onSignOut={handleSignOut}
            user={currentUser}
          />
        );
      
      case 'health-conditions':
        return (
          <HealthConditionsScreen 
            onNavigate={handleNavigate}
            onBack={handleBack}
          />
        );
      
      default:
        return <HomeDashboard onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      <div className="max-w-md mx-auto min-h-screen flex flex-col">
        {/* Main Content */}
        <div className={`flex-1 p-4 ${!['welcome', 'auth', 'email-verification'].includes(currentScreen) ? 'pb-20' : ''}`}>
          {renderScreen()}
        </div>

        {/* Bottom Navigation */}
        {!['welcome', 'auth', 'email-verification'].includes(currentScreen) && (
          <BottomNavigation 
            currentScreen={currentScreen}
            onNavigate={handleNavigate}
          />
        )}

        {/* Check-in Modal */}
        {showCheckIn && (
          <CheckInModal 
            onNavigate={handleNavigate}
            onClose={() => setShowCheckIn(false)}
          />
        )}
      </div>
    </div>
  );
}