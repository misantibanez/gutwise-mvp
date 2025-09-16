import { useState, useEffect } from 'react';
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { TrendingUp, TrendingDown, Calendar, Award, AlertTriangle, BarChart3, Activity, Zap, Loader2 } from "lucide-react";
import { GamificationDisplay } from "./gamification-display";

interface InsightsDashboardProps {
  onBack: () => void;
  onNavigate?: (screen: string) => void;
}

interface SymptomEntry {
  id: string;
  overall_feeling: string;
  symptoms: string[] | null;
  severity_scores: Record<string, number> | null;
  recorded_at: string;
  meal_id?: string;
}

interface MealEntry {
  id: string;
  dish_name: string;
  restaurant_name: string | null;
  meal_time: string;
  tags: string[] | null;
}

export function InsightsDashboard({ onBack, onNavigate }: InsightsDashboardProps) {
  // Mock data for Level 5 user with more extensive history
  const mockSymptoms: SymptomEntry[] = [
    {
      id: 'symptom-001',
      overall_feeling: 'great',
      symptoms: [],
      severity_scores: {},
      recorded_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      meal_id: 'meal-001'
    },
    {
      id: 'symptom-002',
      overall_feeling: 'excellent',
      symptoms: [],
      severity_scores: {},
      recorded_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      meal_id: 'meal-002'
    },
    {
      id: 'symptom-003',
      overall_feeling: 'good',
      symptoms: [],
      severity_scores: {},
      recorded_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      meal_id: 'meal-003'
    },
    {
      id: 'symptom-004',
      overall_feeling: 'great',
      symptoms: [],
      severity_scores: {},
      recorded_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      meal_id: 'meal-004'
    },
    {
      id: 'symptom-005',
      overall_feeling: 'good',
      symptoms: [],
      severity_scores: {},
      recorded_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
      meal_id: 'meal-005'
    },
    {
      id: 'symptom-006',
      overall_feeling: 'okay',
      symptoms: ['mild bloating'],
      severity_scores: { 'bloating': 2 },
      recorded_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      meal_id: 'meal-006'
    },
    {
      id: 'symptom-007',
      overall_feeling: 'great',
      symptoms: [],
      severity_scores: {},
      recorded_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
      meal_id: 'meal-007'
    },
    {
      id: 'symptom-008',
      overall_feeling: 'excellent',
      symptoms: [],
      severity_scores: {},
      recorded_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      meal_id: 'meal-008'
    },
    {
      id: 'symptom-009',
      overall_feeling: 'good',
      symptoms: [],
      severity_scores: {},
      recorded_at: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
      meal_id: 'meal-009'
    },
    {
      id: 'symptom-010',
      overall_feeling: 'not-good',
      symptoms: ['bloating', 'stomach pain'],
      severity_scores: { 'bloating': 3, 'stomach pain': 3 },
      recorded_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      meal_id: 'meal-010'
    },
    {
      id: 'symptom-011',
      overall_feeling: 'great',
      symptoms: [],
      severity_scores: {},
      recorded_at: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
      meal_id: 'meal-011'
    },
    {
      id: 'symptom-012',
      overall_feeling: 'excellent',
      symptoms: [],
      severity_scores: {},
      recorded_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
      meal_id: 'meal-012'
    }
  ];

  const mockMeals: MealEntry[] = [
    {
      id: 'meal-001',
      dish_name: 'Grilled Salmon Bowl',
      restaurant_name: 'Mediterranean Garden',
      meal_time: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      tags: ['mediterranean', 'salmon', 'healthy', 'gluten-free']
    },
    {
      id: 'meal-002',
      dish_name: 'Quinoa Buddha Bowl',
      restaurant_name: 'Green Leaf Cafe',
      meal_time: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      tags: ['healthy', 'quinoa', 'vegetarian', 'low-fodmap']
    },
    {
      id: 'meal-003',
      dish_name: 'Chicken Tikka (No Onions)',
      restaurant_name: 'Spice Route',
      meal_time: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      tags: ['indian', 'chicken', 'customized']
    },
    {
      id: 'meal-004',
      dish_name: 'Greek Salad with Grilled Chicken',
      restaurant_name: 'Athens Corner',
      meal_time: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      tags: ['greek', 'salad', 'chicken', 'dairy-free']
    },
    {
      id: 'meal-005',
      dish_name: 'Sushi Bowl (No Spicy Mayo)',
      restaurant_name: 'Zen Sushi',
      meal_time: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
      tags: ['japanese', 'sushi', 'customized', 'low-fat']
    }
  ];

  const [symptoms] = useState<SymptomEntry[]>(mockSymptoms);
  const [meals] = useState<MealEntry[]>(mockMeals);
  const [isLoading, setIsLoading] = useState(true);

  // Simulate loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  // Calculate statistics from real data
  const calculateStats = () => {
    if (symptoms.length === 0) {
      // Return fallback stats when no data
      return {
        totalEntries: 0,
        safeRatio: 0,
        topSymptoms: [],
        feelingDistribution: {
          great: 0,
          good: 0,
          okay: 0,
          'not-good': 0,
          terrible: 0
        },
        recentTrend: 'stable' as 'improving' | 'stable' | 'concerning',
        averageSeverity: 0
      };
    }

    const totalEntries = symptoms.length;
    
    // Calculate feeling distribution
    const feelingDistribution = symptoms.reduce((acc, symptom) => {
      const feeling = symptom.overall_feeling;
      acc[feeling] = (acc[feeling] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Calculate safe ratio (great + good feelings)
    const safeFeelings = (feelingDistribution.great || 0) + (feelingDistribution.good || 0);
    const safeRatio = totalEntries > 0 ? Math.round((safeFeelings / totalEntries) * 100) : 0;

    // Calculate top symptoms
    const symptomCounts: Record<string, { count: number; severities: number[] }> = {};
    
    symptoms.forEach(entry => {
      if (entry.symptoms && Array.isArray(entry.symptoms)) {
        entry.symptoms.forEach(symptom => {
          if (!symptomCounts[symptom]) {
            symptomCounts[symptom] = { count: 0, severities: [] };
          }
          symptomCounts[symptom].count++;
          
          // Add severity if available with validation
          if (entry.severity_scores && entry.severity_scores[symptom]) {
            const severityNum = typeof entry.severity_scores[symptom] === 'number' 
              ? entry.severity_scores[symptom] 
              : parseFloat(String(entry.severity_scores[symptom]));
            if (!isNaN(severityNum) && severityNum >= 1 && severityNum <= 5) {
              symptomCounts[symptom].severities.push(severityNum);
            }
          }
        });
      }
    });

    const topSymptoms = Object.entries(symptomCounts)
      .map(([name, data]) => ({
        name,
        count: data.count,
        avgSeverity: data.severities.length > 0 
          ? Math.round((data.severities.reduce((a, b) => a + b, 0) / data.severities.length) * 10) / 10
          : 0
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3);

    // Calculate average severity
    const allSeverities: number[] = [];
    symptoms.forEach(entry => {
      if (entry.severity_scores) {
        Object.values(entry.severity_scores).forEach(severity => {
          // Ensure we have a valid number and it's within expected range (1-5)
          const severityNum = typeof severity === 'number' ? severity : parseFloat(String(severity));
          if (!isNaN(severityNum) && severityNum >= 1 && severityNum <= 5) {
            allSeverities.push(severityNum);
          }
        });
      }
    });
    const averageSeverity = allSeverities.length > 0 
      ? Math.round((allSeverities.reduce((a, b) => a + b, 0) / allSeverities.length) * 10) / 10
      : 0;

    // Calculate recent trend (last 7 vs previous 7 entries)
    let recentTrend: 'improving' | 'stable' | 'concerning' = 'stable';
    if (symptoms.length >= 14) {
      const recent = symptoms.slice(-7);
      const previous = symptoms.slice(-14, -7);
      
      const recentBadFeelings = recent.filter(s => ['not-good', 'terrible'].includes(s.overall_feeling)).length;
      const previousBadFeelings = previous.filter(s => ['not-good', 'terrible'].includes(s.overall_feeling)).length;
      
      if (recentBadFeelings < previousBadFeelings) {
        recentTrend = 'improving';
      } else if (recentBadFeelings > previousBadFeelings) {
        recentTrend = 'concerning';
      }
    }

    return {
      totalEntries,
      safeRatio,
      topSymptoms,
      feelingDistribution: {
        great: feelingDistribution.great || 0,
        good: feelingDistribution.good || 0,
        okay: feelingDistribution.okay || 0,
        'not-good': feelingDistribution['not-good'] || 0,
        terrible: feelingDistribution.terrible || 0
      },
      recentTrend,
      averageSeverity
    };
  };

  const stats = calculateStats();

  const generateInsights = () => {
    const insights = [];

    // Trending insights
    if (stats.recentTrend === 'improving') {
      insights.push({
        type: 'positive',
        title: 'Great progress this week!',
        description: `Your digestive health is trending upward. Keep it up!`,
        icon: <TrendingUp className="w-4 h-4" />
      });
    } else if (stats.recentTrend === 'concerning') {
      insights.push({
        type: 'warning',
        title: 'Watch your recent choices',
        description: `More symptoms than usual this week. Consider reviewing your meals.`,
        icon: <TrendingDown className="w-4 h-4" />
      });
    }

    // Safe ratio insights
    if (stats.safeRatio >= 80) {
      insights.push({
        type: 'positive',
        title: 'Excellent food choices!',
        description: `${stats.safeRatio}% of your meals had no major issues`,
        icon: <Award className="w-4 h-4" />
      });
    } else if (stats.safeRatio < 60) {
      insights.push({
        type: 'warning',
        title: 'Room for improvement',
        description: `Only ${stats.safeRatio}% safe meals. Let's identify your triggers.`,
        icon: <AlertTriangle className="w-4 h-4" />
      });
    }

    // Top symptom insights
    if (stats.topSymptoms.length > 0) {
      const topSymptom = stats.topSymptoms[0];
      insights.push({
        type: 'tip',
        title: `Watch out for ${topSymptom.name.toLowerCase()}`,
        description: `Your most frequent symptom (${topSymptom.count} times, avg severity ${topSymptom.avgSeverity})`,
        icon: <Activity className="w-4 h-4" />
      });
    }

    return insights.slice(0, 3); // Limit to 3 insights
  };

  const getInsightStyle = (type: string) => {
    switch (type) {
      case 'positive': return 'border-green-600 bg-green-600/10';
      case 'warning': return 'border-yellow-600 bg-yellow-600/10';
      case 'tip': return 'border-blue-600 bg-blue-600/10';
      default: return 'border-gray-600 bg-gray-600/10';
    }
  };

  const getFeelingColor = (feeling: string) => {
    switch (feeling) {
      case 'great': return 'bg-green-500';
      case 'good': return 'bg-green-400';
      case 'okay': return 'bg-yellow-500';
      case 'not-good': return 'bg-orange-500';
      case 'terrible': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getFeelingLabel = (feeling: string) => {
    switch (feeling) {
      case 'great': return 'Great';
      case 'good': return 'Good';
      case 'okay': return 'Okay';
      case 'not-good': return 'Not Good';
      case 'terrible': return 'Terrible';
      default: return feeling;
    }
  };

  const insights = generateInsights();

  // Show loading state
  if (isLoading) {
    return (
      <div className="space-y-6" data-frame="[screen:Insights]">
        {/* Header */}
        <div className="flex items-center justify-between py-4">
          <Button 
            variant="ghost" 
            onClick={onBack}
            className="text-gray-300 hover:text-white hover:bg-gray-800"
          >
            ← Back
          </Button>
          <h2 className="text-white">Your Insights</h2>
          <div></div>
        </div>

        {/* Loading State */}
        <Card className="bg-gray-800 border-gray-700 p-8">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto animate-pulse">
              <Loader2 className="w-8 h-8 text-white animate-spin" />
            </div>
            <div>
              <h3 className="text-white mb-2">Loading your insights...</h3>
              <p className="text-gray-400 text-sm">Analyzing your meal and symptom data</p>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  // Show empty state if no data
  if (stats.totalEntries === 0) {
    return (
      <div className="space-y-6" data-frame="[screen:Insights]">
        {/* Header */}
        <div className="flex items-center justify-between py-4">
          <Button 
            variant="ghost" 
            onClick={onBack}
            className="text-gray-300 hover:text-white hover:bg-gray-800"
          >
            ← Back
          </Button>
          <h2 className="text-white">Your Insights</h2>
          <div></div>
        </div>

        {/* Empty State */}
        <Card className="bg-gray-800 border-gray-700 p-8">
          <div className="text-center space-y-4">
            <BarChart3 className="w-16 h-16 text-gray-400 mx-auto" />
            <div>
              <h3 className="text-white mb-2">No insights yet</h3>
              <p className="text-gray-400 text-sm mb-4">
                Start logging meals and tracking symptoms to see personalized insights about your digestive health.
              </p>
              <Button 
                onClick={() => onNavigate && onNavigate('log-meal')}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Log Your First Meal
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-frame="[screen:Insights]">
      {/* Header */}
      <div className="flex items-center justify-between py-4">
        <Button 
          variant="ghost" 
          onClick={onBack}
          className="text-gray-300 hover:text-white hover:bg-gray-800"
        >
          ← Back
        </Button>
        <h2 className="text-white">Your Insights</h2>
        <div></div>
      </div>

      {/* Gamification Display */}
      <GamificationDisplay variant="full" showDoctorShare={true} />

      {/* Overview Stats */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="bg-gray-800 border-gray-700 p-4 text-center">
          <div className="text-2xl font-bold text-white">{stats.totalEntries}</div>
          <div className="text-xs text-gray-400">Total Entries</div>
        </Card>
        <Card className="bg-gray-800 border-gray-700 p-4 text-center">
          <div className="text-2xl font-bold text-green-400">{stats.safeRatio}%</div>
          <div className="text-xs text-gray-400">Safe Meals</div>
        </Card>
        <Card className="bg-gray-800 border-gray-700 p-4 text-center">
          <div className="text-2xl font-bold text-blue-400">{stats.averageSeverity}</div>
          <div className="text-xs text-gray-400">Avg Severity</div>
        </Card>
      </div>

      {/* Key Insights */}
      {insights.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-white">Key Insights</h3>
          {insights.map((insight, index) => (
            <Card key={index} className={`p-4 ${getInsightStyle(insight.type)}`}>
              <div className="flex items-start space-x-3">
                <div className={`p-2 rounded-full ${
                  insight.type === 'positive' ? 'bg-green-600' :
                  insight.type === 'warning' ? 'bg-yellow-600' :
                  'bg-blue-600'
                }`}>
                  {insight.icon}
                </div>
                <div className="flex-1">
                  <h4 className="text-white mb-1">{insight.title}</h4>
                  <p className="text-sm text-gray-400">{insight.description}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Feeling Distribution */}
      <Card className="bg-gray-800 border-gray-700 p-4">
        <h3 className="text-white mb-3">How You've Been Feeling</h3>
        <div className="space-y-2">
          {Object.entries(stats.feelingDistribution)
            .sort(([,a], [,b]) => b - a)
            .map(([feeling, count]) => {
              const percentage = Math.round((count / stats.totalEntries) * 100);
              return (
                <div key={feeling} className="flex items-center space-x-3">
                  <div className="w-16 text-sm text-gray-300 capitalize">
                    {getFeelingLabel(feeling)}
                  </div>
                  <div className="flex-1">
                    <Progress 
                      value={percentage} 
                      className="h-2" 
                      style={{
                        '--progress-background': getFeelingColor(feeling)
                      } as React.CSSProperties}
                    />
                  </div>
                  <div className="text-sm text-gray-400 w-12 text-right">
                    {count}
                  </div>
                </div>
              );
            })}
        </div>
      </Card>

      {/* Top Symptoms */}
      {stats.topSymptoms.length > 0 && (
        <Card className="bg-gray-800 border-gray-700 p-4">
          <h3 className="text-white mb-3">Most Common Symptoms</h3>
          <div className="space-y-3">
            {stats.topSymptoms.map((symptom, index) => (
              <div key={index} className="flex items-center justify-between">
                <div>
                  <span className="text-white">{symptom.name}</span>
                  <div className="flex items-center space-x-1 mt-1">
                    <span className="text-sm text-gray-400">{symptom.count} times</span>
                  </div>
                </div>
                <div className="text-right">
                  <Badge 
                    variant="outline" 
                    className={`${
                      symptom.avgSeverity >= 4 ? 'border-red-400 text-red-300' :
                      symptom.avgSeverity >= 3 ? 'border-orange-400 text-orange-300' :
                      'border-yellow-400 text-yellow-300'
                    }`}
                  >
                    {symptom.avgSeverity}/5
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Trend Indicator */}
      <Card className="bg-gray-800 border-gray-700 p-4">
        <h3 className="text-white mb-3">Recent Trend</h3>
        <div className="flex items-center space-x-3">
          <div className={`p-3 rounded-full ${
            stats.recentTrend === 'improving' ? 'bg-green-600' :
            stats.recentTrend === 'concerning' ? 'bg-red-600' :
            'bg-gray-600'
          }`}>
            {stats.recentTrend === 'improving' ? <TrendingUp className="w-5 h-5" /> :
             stats.recentTrend === 'concerning' ? <TrendingDown className="w-5 h-5" /> :
             <Activity className="w-5 h-5" />}
          </div>
          <div>
            <div className="text-white capitalize">{stats.recentTrend}</div>
            <div className="text-sm text-gray-400">
              {stats.recentTrend === 'improving' ? 'Your digestive health is getting better!' :
               stats.recentTrend === 'concerning' ? 'Consider reviewing recent meal choices' :
               'Your digestive health is stable'}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}