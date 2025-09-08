import { useState } from "react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { projectId } from '../utils/supabase/info';

interface OpenAITestScreenProps {
  onBack: () => void;
}

export function OpenAITestScreen({ onBack }: OpenAITestScreenProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [testDish, setTestDish] = useState("Spaghetti Carbonara with Parmesan");
  const [results, setResults] = useState<any>(null);
  const [error, setError] = useState<string>("");
  const [isMockMode, setIsMockMode] = useState(false);

  const testSingleDish = async () => {
    setIsAnalyzing(true);
    setError("");
    setResults(null);

    try {
      const token = localStorage.getItem('supabase_access_token');
      
      if (!token) {
        setError("No auth token found. Please sign in.");
        return;
      }

      console.log("Testing dish analysis for:", testDish);

      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-10f495ea/analyze-dish`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          dishName: testDish,
        }),
      });

      console.log("Dish analysis response status:", response.status);

      if (response.ok) {
        const data = await response.json();
        console.log("Dish analysis successful:", data);
        setResults(data.analysis);
        // Check if the response indicates mock mode
        if (data.analysis?.recommendations?.includes('Mock analysis')) {
          setIsMockMode(true);
        }
      } else {
        const errorData = await response.text();
        console.error("Dish analysis failed:", response.status, errorData);
        setError(`Analysis failed: ${response.status} - ${errorData}`);
      }
    } catch (error) {
      console.error("Error testing dish analysis:", error);
      setError(`Error: ${error.message}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const testMenuAnalysis = async () => {
    setIsAnalyzing(true);
    setError("");
    setResults(null);

    try {
      const token = localStorage.getItem('supabase_access_token');
      
      if (!token) {
        setError("No auth token found. Please sign in.");
        return;
      }

      const mockMenu = [
        {
          name: "Spaghetti Carbonara",
          description: "Classic pasta with eggs, cheese, pancetta, and black pepper",
          price: "$18"
        },
        {
          name: "Margherita Pizza",
          description: "Fresh tomato sauce, mozzarella, basil on thin crust",
          price: "$16"
        },
        {
          name: "Caesar Salad",
          description: "Romaine lettuce, parmesan, croutons, anchovy dressing",
          price: "$12"
        }
      ];

      console.log("Testing menu analysis for:", mockMenu);

      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-10f495ea/analyze-menu`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          menuItems: mockMenu,
        }),
      });

      console.log("Menu analysis response status:", response.status);

      if (response.ok) {
        const data = await response.json();
        console.log("Menu analysis successful:", data);
        setResults(data.analysis);
      } else {
        const errorData = await response.text();
        console.error("Menu analysis failed:", response.status, errorData);
        setError(`Analysis failed: ${response.status} - ${errorData}`);
      }
    } catch (error) {
      console.error("Error testing menu analysis:", error);
      setError(`Error: ${error.message}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between py-4">
        <Button 
          variant="ghost" 
          onClick={onBack}
          className="text-gray-300 hover:text-white hover:bg-gray-800"
        >
          ← Back
        </Button>
        <h2 className="text-white">OpenAI Test</h2>
        <div></div>
      </div>

      {/* Info */}
      <Card className="bg-blue-900/50 border-blue-700 p-4">
        <h3 className="text-blue-200 font-medium mb-2">Test OpenAI Integration</h3>
        <p className="text-blue-100 text-sm">
          This screen lets you test the Azure OpenAI menu analysis directly. 
          Make sure you've set up your health conditions first!
        </p>
      </Card>

      {/* Mock Mode Warning */}
      {isMockMode && (
        <Card className="bg-yellow-900/50 border-yellow-700 p-4">
          <h3 className="text-yellow-200 font-medium mb-2">🤖 Mock Mode Active</h3>
          <p className="text-yellow-100 text-sm">
            Azure OpenAI is not available, so mock data is being used for testing. 
            The app functionality works, but analysis results are simulated.
          </p>
        </Card>
      )}

      {/* Single Dish Test */}
      <Card className="bg-gray-800 border-gray-700 p-4">
        <h4 className="text-white font-medium mb-3">Test Single Dish Analysis</h4>
        <div className="space-y-3">
          <Input
            placeholder="Enter a dish name..."
            value={testDish}
            onChange={(e) => setTestDish(e.target.value)}
            className="bg-gray-700 border-gray-600 text-white"
          />
          <Button
            onClick={testSingleDish}
            disabled={isAnalyzing || !testDish.trim()}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            {isAnalyzing ? "Analyzing..." : "Analyze Dish"}
          </Button>
        </div>
      </Card>

      {/* Menu Test */}
      <Card className="bg-gray-800 border-gray-700 p-4">
        <h4 className="text-white font-medium mb-3">Test Full Menu Analysis</h4>
        <p className="text-gray-400 text-sm mb-3">
          Tests analysis of 3 Italian dishes using your health profile.
        </p>
        <Button
          onClick={testMenuAnalysis}
          disabled={isAnalyzing}
          className="w-full bg-green-600 hover:bg-green-700"
        >
          {isAnalyzing ? "Analyzing Menu..." : "Analyze Sample Menu"}
        </Button>
      </Card>

      {/* Loading */}
      {isAnalyzing && (
        <Card className="bg-gray-800 border-gray-700 p-4">
          <div className="flex items-center space-x-3">
            <div className="w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-blue-400">Calling Azure OpenAI...</span>
          </div>
        </Card>
      )}

      {/* Error */}
      {error && (
        <Card className="bg-red-900/50 border-red-700 p-4">
          <h4 className="text-red-200 font-medium mb-2">Error</h4>
          <p className="text-red-100 text-sm">{error}</p>
        </Card>
      )}

      {/* Results */}
      {results && (
        <Card className="bg-gray-800 border-gray-700 p-4">
          <h4 className="text-white font-medium mb-3">Analysis Results</h4>
          <div className="space-y-3">
            
            {/* Single dish result */}
            {results.safetyScore !== undefined && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Safety Score:</span>
                  <Badge 
                    className={`${
                      results.safetyScore >= 8 ? 'bg-green-600' :
                      results.safetyScore >= 6 ? 'bg-yellow-600' : 'bg-red-600'
                    } text-white`}
                  >
                    {results.safetyScore}/10
                  </Badge>
                </div>
                {results.warnings && results.warnings.length > 0 && (
                  <div>
                    <span className="text-gray-300 text-sm">Warnings:</span>
                    <ul className="text-red-300 text-sm mt-1">
                      {results.warnings.map((warning: string, index: number) => (
                        <li key={index}>• {warning}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {results.recommendations && (
                  <div>
                    <span className="text-gray-300 text-sm">Recommendations:</span>
                    <p className="text-green-300 text-sm mt-1">{results.recommendations}</p>
                  </div>
                )}
              </div>
            )}

            {/* Menu results */}
            {results.dishes && Array.isArray(results.dishes) && (
              <div className="space-y-3">
                {results.dishes.map((dish: any, index: number) => (
                  <div key={index} className="bg-gray-700 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white font-medium">{dish.name}</span>
                      <Badge 
                        className={`${
                          dish.safetyScore >= 8 ? 'bg-green-600' :
                          dish.safetyScore >= 6 ? 'bg-yellow-600' : 'bg-red-600'
                        } text-white`}
                      >
                        {dish.safetyScore}/10
                      </Badge>
                    </div>
                    {dish.warnings && dish.warnings.length > 0 && (
                      <div className="text-red-300 text-sm">
                        Warnings: {dish.warnings.join(", ")}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Raw JSON for debugging */}
            <details className="mt-4">
              <summary className="text-gray-400 text-sm cursor-pointer">View Raw Response</summary>
              <pre className="text-xs text-gray-300 mt-2 bg-gray-900 p-2 rounded overflow-auto">
                {JSON.stringify(results, null, 2)}
              </pre>
            </details>
          </div>
        </Card>
      )}
    </div>
  );
}