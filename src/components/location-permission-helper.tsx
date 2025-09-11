import { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { MapPin, Settings, RefreshCw } from 'lucide-react';

interface LocationPermissionHelperProps {
  onRetry: () => void;
  show: boolean;
}

export function LocationPermissionHelper({ onRetry, show }: LocationPermissionHelperProps) {
  const [isRetrying, setIsRetrying] = useState(false);

  if (!show) return null;

  const handleRetry = async () => {
    setIsRetrying(true);
    try {
      await onRetry();
    } finally {
      setIsRetrying(false);
    }
  };

  return (
    <Card className="bg-blue-900/20 border-blue-700 p-4 mb-4">
      <div className="flex items-start space-x-3">
        <MapPin className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <h3 className="text-blue-300 font-medium mb-2">Enable Location for Better Results</h3>
          <p className="text-blue-200 text-sm mb-3">
            We're showing restaurants from a default area. For personalized nearby restaurants, please:
          </p>
          <ol className="text-blue-200 text-sm space-y-1 mb-4 list-decimal list-inside">
            <li>Click the location icon in your browser's address bar</li>
            <li>Select "Allow" for location access</li>
            <li>Refresh the page or try again</li>
          </ol>
          <div className="flex space-x-2">
            <Button
              onClick={handleRetry}
              disabled={isRetrying}
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-3 py-1.5 h-auto"
            >
              {isRetrying ? (
                <>
                  <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                  Checking...
                </>
              ) : (
                <>
                  <MapPin className="w-3 h-3 mr-1" />
                  Try Again
                </>
              )}
            </Button>
            <Button
              variant="outline"
              className="border-blue-700 text-blue-300 hover:bg-blue-900/30 text-sm px-3 py-1.5 h-auto"
              onClick={() => window.location.reload()}
            >
              <Settings className="w-3 h-3 mr-1" />
              Refresh Page
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}