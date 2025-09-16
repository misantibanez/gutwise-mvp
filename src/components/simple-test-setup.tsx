import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { TestTube, X, CheckCircle } from 'lucide-react';

interface SimpleTestSetupProps {
  onTestModeActivated?: () => void;
  onClose?: () => void;
}

export function SimpleTestSetup({ onTestModeActivated, onClose }: SimpleTestSetupProps) {
  const [objectId, setObjectId] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  // Simple localStorage-based test setup
  const handleSetupTestUser = () => {
    if (!objectId.trim()) {
      setErrorMessage('Azure Object ID is required');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      // Create test configuration
      const testConfig = {
        object_id: objectId.trim(),
        name: name.trim() || 'Test User',
        email: email.trim() || 'test@gutwise.com',
        active: true,
        created_at: new Date().toISOString()
      };

      // Store in localStorage
      localStorage.setItem('gutwise-test-config', JSON.stringify(testConfig));
      
      setStatus('success');
      console.log('✅ Test user setup completed with Azure Object ID:', objectId);

      // Notify parent component
      if (onTestModeActivated) {
        setTimeout(() => {
          onTestModeActivated();
        }, 1000);
      }

    } catch (error) {
      console.error('❌ Test user setup failed:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Failed to set up test user');
      setStatus('error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearTestMode = () => {
    localStorage.removeItem('gutwise-test-config');
    setStatus('idle');
    setErrorMessage('');
    console.log('🧹 Test mode cleared');
    
    if (onTestModeActivated) {
      onTestModeActivated();
    }
  };

  // Check if test mode is already active
  const testConfig = localStorage.getItem('gutwise-test-config');
  const isTestModeActive = testConfig ? JSON.parse(testConfig).active : false;
  const currentConfig = testConfig ? JSON.parse(testConfig) : null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md bg-gray-900 border-gray-700">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-white">
              <TestTube className="h-5 w-5 text-blue-400" />
              Azure User Test Mode
            </CardTitle>
            <CardDescription className="text-gray-400">
              Test with your real Azure user object ID
            </CardDescription>
          </div>
          {onClose && (
            <Button variant="ghost" size="sm" onClick={onClose} className="text-gray-400">
              <X className="h-4 w-4" />
            </Button>
          )}
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Current Status */}
          {isTestModeActive && currentConfig && (
            <div className="p-3 bg-green-900/20 border border-green-700 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="h-4 w-4 text-green-400" />
                <span className="text-green-400 font-medium">Test Mode Active</span>
              </div>
              <div className="text-sm text-gray-300 space-y-1">
                <div>Object ID: <code className="text-blue-400">{currentConfig.object_id}</code></div>
                <div>Name: {currentConfig.name}</div>
                <div>Email: {currentConfig.email}</div>
              </div>
            </div>
          )}

          {/* Setup Form */}
          {!isTestModeActive && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="object-id" className="text-gray-300">
                  Azure Object ID <span className="text-red-400">*</span>
                </Label>
                <Input
                  id="object-id"
                  value={objectId}
                  onChange={(e) => setObjectId(e.target.value)}
                  placeholder="12345678-1234-1234-1234-123456789012"
                  className="bg-gray-800 border-gray-600 text-white font-mono text-sm"
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="name" className="text-gray-300">Name (Optional)</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Test User"
                  className="bg-gray-800 border-gray-600 text-white"
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-300">Email (Optional)</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="test@gutwise.com"
                  className="bg-gray-800 border-gray-600 text-white"
                  disabled={isLoading}
                />
              </div>
            </div>
          )}

          {/* Error Message */}
          {errorMessage && (
            <div className="p-3 bg-red-900/20 border border-red-700 rounded-lg">
              <p className="text-red-400 text-sm">{errorMessage}</p>
            </div>
          )}

          {/* Success Message */}
          {status === 'success' && (
            <div className="p-3 bg-green-900/20 border border-green-700 rounded-lg">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-400" />
                <span className="text-green-400">Test user setup completed!</span>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-2">
            {!isTestModeActive ? (
              <Button 
                onClick={handleSetupTestUser}
                disabled={isLoading || !objectId.trim()}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                ) : (
                  <TestTube className="h-4 w-4 mr-2" />
                )}
                Set Up Test User
              </Button>
            ) : (
              <Button 
                onClick={handleClearTestMode}
                disabled={isLoading}
                variant="outline"
                className="w-full border-red-600 text-red-400 hover:bg-red-600/10"
              >
                Clear Test Mode
              </Button>
            )}
          </div>

          {/* Instructions */}
          <div className="text-xs text-gray-400 space-y-1">
            <p><strong>How to test:</strong></p>
            <p>1. Enter your Azure user's Object ID above</p>
            <p>2. Click "Set Up Test User" to activate test mode</p>
            <p>3. The app will use your real Azure user ID for all data operations</p>
            <p>4. Once you install <code>@azure/cosmos</code>, all data will be stored in Cosmos DB</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}