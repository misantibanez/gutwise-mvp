import { useState, useEffect } from 'react';
import { WelcomeScreen } from './components/welcome-screen';
import { AuthScreen } from './components/auth-screen';
import { HomeDashboard } from './components/home-dashboard';
import { RestaurantSuggestions } from './components/restaurant-suggestions';
import { MenuAnalysis } from './components/menu-analysis';
import { MealLogger } from './components/meal-logger';
import { MealLoggedSuccess } from './components/meal-logged-success';
import { SymptomTracker } from './components/symptom-tracker';
import { CheckInModal } from './components/check-in-modal';
import { InsightsDashboard } from './components/insights-dashboard';
import { AllMealsScreen } from './components/all-meals-screen';
import { ProfileScreen } from './components/profile-screen';
import { BottomNavigation } from './components/bottom-navigation';
import { SuccessScreen } from './components/success-screens';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('welcome'); // Start with welcome screen
  const [showCheckIn, setShowCheckIn] = useState(false);
  const [screenData, setScreenData] = useState<any>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  // Simulate location-based check-in after being on home screen
  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentScreen === 'home' && !showCheckIn && isAuthenticated) {
        setShowCheckIn(true);
      }
    }, 5000);

    return () => clearTimeout(timer);
  }, [currentScreen, showCheckIn, isAuthenticated]);

  const handleNavigate = (screen: string, data?: any) => {
    console.log('handleNavigate called with screen:', screen, 'data:', data);
    setCurrentScreen(screen);
    setScreenData(data);
    setShowCheckIn(false);
  };

  const handleAuthSuccess = (userData?: any) => {
    console.log('Mock auth success:', userData);
    setIsAuthenticated(true);
    setUser(userData || { name: 'Demo User', email: 'demo@gutwise.com' });
    setCurrentScreen('home');
  };

  const handleSignOut = () => {
    console.log('Mock sign out');
    setIsAuthenticated(false);
    setUser(null);
    setCurrentScreen('welcome');
  };

  const handleBack = () => {
    // Simple back navigation logic
    switch (currentScreen) {
      case 'auth':
        setCurrentScreen('welcome');
        break;
      case 'suggestions':
      case 'restaurants':
      case 'log-meal':
      case 'all-meals':
      case 'history':
      case 'profile':
        setCurrentScreen('home');
        break;
      case 'insights':
        // Stay in insights or go to home if no previous context
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
      case 'meal-logged-success':
        setCurrentScreen('home');
        break;
      default:
        setCurrentScreen('home');
    }
    setScreenData(null);
  };

  const renderScreen = () => {
    console.log('Rendering screen:', currentScreen);
    switch (currentScreen) {
      case 'welcome':
        return <WelcomeScreen onNavigate={handleNavigate} />;
      
      case 'auth':
        return (
          <AuthScreen
            onNavigate={handleNavigate}
            onAuthSuccess={handleAuthSuccess}
            onBack={handleBack}
          />
        );
      
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

      case 'profile':
        return (
          <ProfileScreen 
            user={user}
            onBack={handleBack} 
            onNavigate={handleNavigate}
            onSignOut={handleSignOut}
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
      
      default:
        return <HomeDashboard onNavigate={handleNavigate} />;
    }
  };

  // Don't show bottom navigation on welcome and auth screens
  const shouldShowBottomNav = isAuthenticated && !['welcome', 'auth'].includes(currentScreen);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      <div className="max-w-md mx-auto min-h-screen flex flex-col">
        {/* Main Content */}
        <div className={`flex-1 ${shouldShowBottomNav ? 'p-4 pb-20' : 'p-4'}`}>
          {renderScreen()}
        </div>

        {/* Bottom Navigation - Only show when authenticated */}
        {shouldShowBottomNav && (
          <BottomNavigation 
            currentScreen={currentScreen}
            onNavigate={handleNavigate}
          />
        )}

        {/* Check-in Modal */}
        {showCheckIn && isAuthenticated && (
          <CheckInModal 
            onNavigate={handleNavigate}
            onClose={() => setShowCheckIn(false)}
          />
        )}
      </div>
    </div>
  );
}