import { useState } from 'react';
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Textarea } from "./ui/textarea";
import { Separator } from "./ui/separator";
import { Loader2, AlertTriangle, CheckCircle, XCircle, HelpCircle, Sparkles } from "lucide-react";
import { menuAnalysisAPI, DishAnalysis, MenuAnalysisResponse } from "../utils/api/restaurants";

interface MenuAnalyzerProps {
  restaurantName?: string;
  onAnalysisComplete?: (analysis: MenuAnalysisResponse) => void;
}

export function MenuAnalyzer({ restaurantName, onAnalysisComplete }: MenuAnalyzerProps) {
  const [menuText, setMenuText] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<MenuAnalysisResponse | null>(null);
  const [error, setError] = useState("");

  const parseMenuItems = (text: string): string[] => {
    // Simple menu parsing - split by lines and filter out empty/short lines
    const lines = text.split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 3)
      .filter(line => !line.match(/^\$|^£|^€/)) // Remove price-only lines
      .slice(0, 20); // Limit to 20 items for analysis
    
    return lines;
  };

  const analyzeMenu = async () => {
    if (!menuText.trim()) {
      setError("Please enter menu items to analyze");
      return;
    }

    try {
      setError("");
      setIsAnalyzing(true);
      
      const menuItems = parseMenuItems(menuText);
      
      if (menuItems.length === 0) {
        setError("No valid menu items found. Please check your input.");
        return;
      }

      const response = await menuAnalysisAPI.analyzeMenu(menuItems);
      setAnalysis(response.analysis);
      
      if (onAnalysisComplete) {
        onAnalysisComplete(response.analysis);
      }
      
    } catch (err) {
      console.error('Menu analysis error:', err);
      setError(err instanceof Error ? err.message : 'Failed to analyze menu');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getSafetyIcon = (riskLevel: string, safetyScore: number) => {
    if (safetyScore >= 80) {
      return <CheckCircle className="w-4 h-4 text-green-400" />;
    } else if (safetyScore >= 60) {
      return <HelpCircle className="w-4 h-4 text-yellow-400" />;
    } else {
      return <XCircle className="w-4 h-4 text-red-400" />;
    }
  };

  const getSafetyColor = (safetyScore: number) => {
    if (safetyScore >= 80) return 'text-green-400';
    if (safetyScore >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getRiskBadgeColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'low': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'high': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gray-800 border-gray-700 p-4">
        <div className="flex items-center space-x-2 mb-4">
          <Sparkles className="w-5 h-5 text-blue-400" />
          <h3 className="text-white">AI Menu Analysis</h3>
          {restaurantName && (
            <span className="text-gray-400">• {restaurantName}</span>
          )}
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-2">
              Paste menu items (one per line):
            </label>
            <Textarea
              value={menuText}
              onChange={(e) => setMenuText(e.target.value)}
              placeholder="Grilled Salmon with Quinoa&#10;Caesar Salad&#10;Margherita Pizza&#10;Thai Green Curry&#10;..."
              rows={8}
              className="bg-gray-700 border-gray-600 text-white placeholder-gray-500 resize-none"
            />
          </div>

          {error && (
            <div className="flex items-center space-x-2 p-3 bg-red-500/10 border border-red-500/20 rounded">
              <AlertTriangle className="w-4 h-4 text-red-400" />
              <span className="text-red-400 text-sm">{error}</span>
            </div>
          )}

          <Button
            onClick={analyzeMenu}
            disabled={isAnalyzing || !menuText.trim()}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Analyzing Menu...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Analyze Menu with AI
              </>
            )}
          </Button>
        </div>
      </Card>

      {/* Analysis Results */}
      {analysis && (
        <div className="space-y-4">
          {/* Overall Recommendation */}
          <Card className="bg-gray-800 border-gray-700 p-4">
            <h4 className="text-white font-medium mb-2">Overall Recommendation</h4>
            <p className="text-gray-300 text-sm leading-relaxed">{analysis.overallRecommendation}</p>
          </Card>

          {/* Quick Insights */}
          <div className="grid grid-cols-2 gap-4">
            {analysis.safestOptions.length > 0 && (
              <Card className="bg-green-500/10 border-green-500/20 p-4">
                <h4 className="text-green-400 font-medium mb-2">Safest Options</h4>
                <ul className="space-y-1">
                  {analysis.safestOptions.slice(0, 3).map((option, index) => (
                    <li key={index} className="text-green-300 text-sm">• {option}</li>
                  ))}
                </ul>
              </Card>
            )}

            {analysis.riskiestOptions.length > 0 && (
              <Card className="bg-red-500/10 border-red-500/20 p-4">
                <h4 className="text-red-400 font-medium mb-2">Avoid These</h4>
                <ul className="space-y-1">
                  {analysis.riskiestOptions.slice(0, 3).map((option, index) => (
                    <li key={index} className="text-red-300 text-sm">• {option}</li>
                  ))}
                </ul>
              </Card>
            )}
          </div>

          {/* Detailed Analysis */}
          <Card className="bg-gray-800 border-gray-700 p-4">
            <h4 className="text-white font-medium mb-4">Detailed Analysis</h4>
            <div className="space-y-4">
              {analysis.analyses.map((dish, index) => (
                <div key={index} className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        {getSafetyIcon(dish.riskLevel, dish.safetyScore)}
                        <h5 className="text-white font-medium">{dish.dish}</h5>
                      </div>
                      
                      <div className="flex items-center space-x-2 mb-2">
                        <span className={`text-sm font-medium ${getSafetyColor(dish.safetyScore)}`}>
                          Safety Score: {dish.safetyScore}/100
                        </span>
                        <Badge className={`text-xs ${getRiskBadgeColor(dish.riskLevel)}`}>
                          {dish.riskLevel} risk
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <p className="text-gray-300 text-sm leading-relaxed">
                    {dish.recommendations}
                  </p>

                  {dish.triggers.length > 0 && (
                    <div>
                      <span className="text-orange-400 text-xs font-medium">Potential Triggers: </span>
                      <span className="text-gray-400 text-xs">
                        {dish.triggers.join(', ')}
                      </span>
                    </div>
                  )}

                  {dish.modifications && dish.modifications.length > 0 && (
                    <div>
                      <span className="text-blue-400 text-xs font-medium">Suggested Modifications: </span>
                      <span className="text-gray-400 text-xs">
                        {dish.modifications.join(', ')}
                      </span>
                    </div>
                  )}

                  {index < analysis.analyses.length - 1 && (
                    <Separator className="bg-gray-600" />
                  )}
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}