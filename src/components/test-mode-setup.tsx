import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Separator } from './ui/separator';
import { Badge } from './ui/badge';
// Import test auth utilities but handle gracefully if not available
let setupTestUser: any = null;
let runCosmosDBTests: any = null;
let testAuth: any = null;

try {
  const testAuthModule = require('../utils/auth/test-auth');
  setupTestUser = testAuthModule.setupTestUser;
  runCosmosDBTests = testAuthModule.runCosmosDBTests;
  testAuth = testAuthModule.testAuth;
} catch (error) {
  console.log('Test auth module not available');
}
import { TestTube, Database, User, Play, X, CheckCircle } from 'lucide-react';

interface TestModeSetupProps {
  onTestModeActivated?: () => void;
  onClose?: () => void;
}

export function TestModeSetup({ onTestModeActivated, onClose }: TestModeSetupProps) {
  const [objectId, setObjectId] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [testStatus, setTestStatus] = useState<'idle' | 'setting-up' | 'testing' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  // Check if test mode is already active
  const isTestModeActive = testAuth ? testAuth.isTestModeActive() : false;
  const currentTestConfig = testAuth ? testAuth.getTestConfig() : null;

  const handleSetupTestUser = async () => {
    if (!setupTestUser) {
      setErrorMessage('Test mode not available - Cosmos DB SDK not installed');
      return;
    }

    if (!objectId.trim()) {
      setErrorMessage('Azure Object ID is required');
      return;
    }

    setIsLoading(true);
    setTestStatus('setting-up');
    setErrorMessage('');

    try {
      console.log('🧪 Setting up test user with Azure Object ID:', objectId);
      
      // Set up test user
      await setupTestUser(
        objectId.trim(),
        name.trim() || 'Test User',
        email.trim() || 'test@gutwise.com'
      );

      setTestStatus('success');
      console.log('✅ Test user setup completed');

      // Notify parent component
      if (onTestModeActivated) {
        setTimeout(() => {
          onTestModeActivated();
        }, 1000);
      }

    } catch (error) {
      console.error('❌ Test user setup failed:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Failed to set up test user');
      setTestStatus('error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRunCosmosDBTests = async () => {
    if (!runCosmosDBTests) {
      setErrorMessage('Cosmos DB tests not available - SDK not installed');
      return;
    }

    if (!isTestModeActive || !currentTestConfig) {
      setErrorMessage('Test mode must be active to run Cosmos DB tests');
      return;
    }

    setIsLoading(true);
    setTestStatus('testing');
    setErrorMessage('');

    try {
      console.log('🧪 Running Cosmos DB tests...');
      await runCosmosDBTests(currentTestConfig.object_id);
      setTestStatus('success');
      console.log('✅ Cosmos DB tests completed');
    } catch (error) {
      console.error('❌ Cosmos DB tests failed:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Cosmos DB tests failed');
      setTestStatus('error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearTestMode = () => {
    if (testAuth) {
      testAuth.clearTestMode();
    }
    setTestStatus('idle');
    setErrorMessage('');
    if (onTestModeActivated) {
      onTestModeActivated();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md bg-gray-900 border-gray-700">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-white">
              <TestTube className="h-5 w-5 text-blue-400" />
              Cosmos DB Test Mode
            </CardTitle>
            <CardDescription className="text-gray-400">
              Test with a real Azure user and Cosmos DB
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
          {isTestModeActive && currentTestConfig && (
            <div className="p-3 bg-green-900/20 border border-green-700 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="h-4 w-4 text-green-400" />
                <span className="text-green-400 font-medium">Test Mode Active</span>
              </div>
              <div className="text-sm text-gray-300 space-y-1">
                <div>Object ID: <code className="text-blue-400">{currentTestConfig.object_id}</code></div>
                <div>Name: {currentTestConfig.name || 'Test User'}</div>
                <div>Email: {currentTestConfig.email || 'test@gutwise.com'}</div>
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
                  placeholder="e.g., 12345678-1234-1234-1234-123456789012"
                  className="bg-gray-800 border-gray-600 text-white"
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

          {/* Status Messages */}
          {testStatus === 'setting-up' && (
            <div className="p-3 bg-blue-900/20 border border-blue-700 rounded-lg">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                <span className="text-blue-400">Setting up test user...</span>
              </div>
            </div>
          )}

          {testStatus === 'testing' && (
            <div className="p-3 bg-yellow-900/20 border border-yellow-700 rounded-lg">
              <div className="flex items-center gap-2">
                <Database className="h-4 w-4 text-yellow-400 animate-pulse" />
                <span className="text-yellow-400">Running Cosmos DB tests...</span>
              </div>
            </div>
          )}

          {testStatus === 'success' && (
            <div className="p-3 bg-green-900/20 border border-green-700 rounded-lg">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-400" />
                <span className="text-green-400">Operation completed successfully!</span>
              </div>
            </div>
          )}

          <Separator className="bg-gray-700" />

          {/* Action Buttons */}
          <div className="space-y-2">
            {!isTestModeActive ? (
              <Button 
                onClick={handleSetupTestUser}
                disabled={isLoading || !objectId.trim()}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                <User className="h-4 w-4 mr-2" />
                Set Up Test User
              </Button>
            ) : (
              <div className="space-y-2">
                <Button 
                  onClick={handleRunCosmosDBTests}
                  disabled={isLoading}
                  variant="outline"
                  className="w-full border-green-600 text-green-400 hover:bg-green-600/10"
                >
                  <Play className="h-4 w-4 mr-2" />
                  Run Cosmos DB Tests
                </Button>
                
                <Button 
                  onClick={handleClearTestMode}
                  disabled={isLoading}
                  variant="outline"
                  className="w-full border-red-600 text-red-400 hover:bg-red-600/10"
                >
                  Clear Test Mode
                </Button>
              </div>
            )}
          </div>

          {/* Instructions */}
          <div className="text-xs text-gray-400 space-y-1">
            <p><strong>Instructions:</strong></p>
            <p>1. Enter your Azure user's Object ID</p>
            <p>2. Click "Set Up Test User" to authenticate</p>
            <p>3. Use "Run Cosmos DB Tests" to verify integration</p>
            <p>4. Check browser console for detailed logs</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}