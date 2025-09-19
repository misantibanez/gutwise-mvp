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
  // Mock data for Level 5 user with more extensive history and realistic food-symptom patterns
  const mockSymptoms: SymptomEntry[] = [
    // Recent meals - mostly positive
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
    
    // Spicy Thai Curry - caused bloating
    {
      id: 'symptom-006',
      overall_feeling: 'not-good',
      symptoms: ['bloating', 'stomach discomfort'],
      severity_scores: { 'bloating': 3, 'stomach discomfort': 2 },
      recorded_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      meal_id: 'meal-006'
    },
    
    // Caesar Salad - mild symptoms (dairy intolerance)
    {
      id: 'symptom-007',
      overall_feeling: 'okay',
      symptoms: ['mild bloating'],
      severity_scores: { 'bloating': 2 },
      recorded_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
      meal_id: 'meal-007'
    },
    
    // Margherita Pizza - gluten sensitivity
    {
      id: 'symptom-008',
      overall_feeling: 'not-good',
      symptoms: ['bloating', 'fatigue'],
      severity_scores: { 'bloating': 3, 'fatigue': 2 },
      recorded_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      meal_id: 'meal-008'
    },
    
    // Beef Burrito Bowl - beans caused gas
    {
      id: 'symptom-009',
      overall_feeling: 'okay',
      symptoms: ['gas', 'mild cramping'],
      severity_scores: { 'gas': 2, 'cramping': 1 },
      recorded_at: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
      meal_id: 'meal-009'
    },
    
    // Pad Thai - peanut sensitivity
    {
      id: 'symptom-010',
      overall_feeling: 'not-good',
      symptoms: ['stomach pain', 'nausea'],
      severity_scores: { 'stomach pain': 3, 'nausea': 2 },
      recorded_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      meal_id: 'meal-010'
    },
    
    // Grilled Chicken Salad - safe food
    {
      id: 'symptom-011',
      overall_feeling: 'great',
      symptoms: [],
      severity_scores: {},
      recorded_at: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
      meal_id: 'meal-011'
    },
    
    // Mushroom Risotto - rich and creamy caused discomfort
    {
      id: 'symptom-012',
      overall_feeling: 'okay',
      symptoms: ['heaviness', 'mild nausea'],
      severity_scores: { 'heaviness': 2, 'nausea': 1 },
      recorded_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
      meal_id: 'meal-012'
    },
    
    // Fish and Chips - fried food intolerance
    {
      id: 'symptom-013',
      overall_feeling: 'not-good',
      symptoms: ['stomach pain', 'bloating', 'nausea'],
      severity_scores: { 'stomach pain': 4, 'bloating': 3, 'nausea': 3 },
      recorded_at: new Date(Date.now() - 16 * 24 * 60 * 60 * 1000).toISOString(),
      meal_id: 'meal-013'
    },
    
    // Vegetable Stir Fry - good choice
    {
      id: 'symptom-014',
      overall_feeling: 'good',
      symptoms: [],
      severity_scores: {},
      recorded_at: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000).toISOString(),
      meal_id: 'meal-014'
    },
    
    // BBQ Pulled Pork - heavy sauce caused acid reflux
    {
      id: 'symptom-015',
      overall_feeling: 'okay',
      symptoms: ['acid reflux', 'heartburn'],
      severity_scores: { 'acid reflux': 2, 'heartburn': 2 },
      recorded_at: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
      meal_id: 'meal-015'
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
    },
    {
      id: 'meal-006',
      dish_name: 'Spicy Thai Curry',
      restaurant_name: 'Bangkok Bistro',
      meal_time: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      tags: ['thai', 'curry', 'spicy', 'coconut']
    },
    {
      id: 'meal-007',
      dish_name: 'Caesar Salad',
      restaurant_name: 'Olive Garden',
      meal_time: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
      tags: ['salad', 'caesar', 'dairy', 'gluten']
    },
    {
      id: 'meal-008',
      dish_name: 'Margherita Pizza',
      restaurant_name: 'Tony\'s Pizzeria',
      meal_time: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      tags: ['pizza', 'cheese', 'tomato', 'gluten']
    },
    {
      id: 'meal-009',
      dish_name: 'Beef Burrito Bowl',
      restaurant_name: 'Chipotle',
      meal_time: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
      tags: ['mexican', 'beef', 'beans', 'spicy']
    },
    {
      id: 'meal-010',
      dish_name: 'Pad Thai with Shrimp',
      restaurant_name: 'Thai Express',
      meal_time: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      tags: ['thai', 'noodles', 'shrimp', 'peanuts']
    },
    {
      id: 'meal-011',
      dish_name: 'Grilled Chicken Salad',
      restaurant_name: 'Fresh & Fast',
      meal_time: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
      tags: ['salad', 'chicken', 'healthy', 'low-carb']
    },
    {
      id: 'meal-012',
      dish_name: 'Mushroom Risotto',
      restaurant_name: 'Italian Corner',
      meal_time: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
      tags: ['italian', 'rice', 'mushroom', 'creamy']
    },
    {
      id: 'meal-013',
      dish_name: 'Fish and Chips',
      restaurant_name: 'The Pub',
      meal_time: new Date(Date.now() - 16 * 24 * 60 * 60 * 1000).toISOString(),
      tags: ['fried', 'fish', 'potatoes', 'greasy']
    },
    {
      id: 'meal-014',
      dish_name: 'Vegetable Stir Fry',
      restaurant_name: 'Wok Express',
      meal_time: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000).toISOString(),
      tags: ['chinese', 'vegetables', 'healthy', 'garlic']
    },
    {
      id: 'meal-015',
      dish_name: 'BBQ Pulled Pork Sandwich',
      restaurant_name: 'Smoky Joe\'s',
      meal_time: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
      tags: ['bbq', 'pork', 'sauce', 'bread']
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

  // Calculate comprehensive statistics from real data
  const calculateStats = () => {
    if (symptoms.length === 0) {
      // Return fallback stats when no data
      return {
        totalEntries: 0,
        safeRatio: 0,
        topSymptoms: [],
        feelingDistribution: {
          excellent: 0,
          great: 0,
          good: 0,
          okay: 0,
          'not-good': 0,
          terrible: 0
        },
        recentTrend: 'stable' as 'improving' | 'stable' | 'concerning',
        averageSeverity: 0,
        safeFoods: [],
        riskyFoods: [],
        foodSymptomAssociations: []
      };
    }

    const totalEntries = symptoms.length;
    
    // Calculate feeling distribution
    const feelingDistribution = symptoms.reduce((acc, symptom) => {
      const feeling = symptom.overall_feeling;
      acc[feeling] = (acc[feeling] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Calculate safe ratio (excellent + great + good feelings)
    const safeFeelings = (feelingDistribution.excellent || 0) + (feelingDistribution.great || 0) + (feelingDistribution.good || 0);
    const safeRatio = totalEntries > 0 ? Math.round((safeFeelings / totalEntries) * 100) : 0;

    // Calculate food associations with symptoms and feelings
    const foodAssociations: Record<string, {
      positiveCount: number;
      negativeCount: number;
      symptoms: string[];
      meals: MealEntry[];
    }> = {};

    symptoms.forEach(symptom => {
      const meal = meals.find(m => m.id === symptom.meal_id);
      if (meal) {
        const isPositive = ['excellent', 'great', 'good'].includes(symptom.overall_feeling);
        const isNegative = ['not-good', 'terrible'].includes(symptom.overall_feeling);
        
        if (!foodAssociations[meal.dish_name]) {
          foodAssociations[meal.dish_name] = {
            positiveCount: 0,
            negativeCount: 0,
            symptoms: [],
            meals: []
          };
        }

        if (isPositive) {
          foodAssociations[meal.dish_name].positiveCount++;
        } else if (isNegative) {
          foodAssociations[meal.dish_name].negativeCount++;
          if (symptom.symptoms) {
            foodAssociations[meal.dish_name].symptoms.push(...symptom.symptoms);
          }
        }
        foodAssociations[meal.dish_name].meals.push(meal);
      }
    });

    // Get safe and risky foods
    const safeFoods = Object.entries(foodAssociations)
      .filter(([_, data]) => data.positiveCount > 0 && data.negativeCount === 0)
      .map(([food, data]) => ({
        name: food,
        count: data.positiveCount,
        restaurant: data.meals[0]?.restaurant_name
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const riskyFoods = Object.entries(foodAssociations)
      .filter(([_, data]) => data.negativeCount > 0)
      .map(([food, data]) => ({
        name: food,
        negativeCount: data.negativeCount,
        commonSymptoms: [...new Set(data.symptoms)].slice(0, 3),
        restaurant: data.meals[0]?.restaurant_name
      }))
      .sort((a, b) => b.negativeCount - a.negativeCount)
      .slice(0, 3);

    // Calculate top symptoms with food associations
    const symptomCounts: Record<string, { 
      count: number; 
      severities: number[]; 
      associatedFoods: string[];
    }> = {};
    
    symptoms.forEach(entry => {
      const meal = meals.find(m => m.id === entry.meal_id);
      if (entry.symptoms && Array.isArray(entry.symptoms)) {
        entry.symptoms.forEach(symptom => {
          if (!symptomCounts[symptom]) {
            symptomCounts[symptom] = { count: 0, severities: [], associatedFoods: [] };
          }
          symptomCounts[symptom].count++;
          
          if (meal) {
            symptomCounts[symptom].associatedFoods.push(meal.dish_name);
          }
          
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
          : 0,
        topFoods: [...new Set(data.associatedFoods)].slice(0, 3)
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3);

    // Food-symptom associations for detailed view
    const foodSymptomAssociations = Object.entries(foodAssociations)
      .filter(([_, data]) => data.symptoms.length > 0)
      .map(([food, data]) => ({
        food,
        symptoms: [...new Set(data.symptoms)],
        occurrences: data.negativeCount,
        restaurant: data.meals[0]?.restaurant_name
      }))
      .sort((a, b) => b.occurrences - a.occurrences);

    // Calculate average severity
    const allSeverities: number[] = [];
    symptoms.forEach(entry => {
      if (entry.severity_scores) {
        Object.values(entry.severity_scores).forEach(severity => {
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

    // Calculate recent trend with more detail
    let recentTrend: 'improving' | 'stable' | 'concerning' = 'stable';
    let trendDetails = '';
    
    if (symptoms.length >= 7) {
      const recent = symptoms.slice(-7);
      const recentGoodFeelings = recent.filter(s => ['excellent', 'great', 'good'].includes(s.overall_feeling)).length;
      const recentBadFeelings = recent.filter(s => ['not-good', 'terrible'].includes(s.overall_feeling)).length;
      
      if (symptoms.length >= 14) {
        const previous = symptoms.slice(-14, -7);
        const previousGoodFeelings = previous.filter(s => ['excellent', 'great', 'good'].includes(s.overall_feeling)).length;
        const previousBadFeelings = previous.filter(s => ['not-good', 'terrible'].includes(s.overall_feeling)).length;
        
        if (recentGoodFeelings > previousGoodFeelings && recentBadFeelings <= previousBadFeelings) {
          recentTrend = 'improving';
          trendDetails = `${recentGoodFeelings} good days this week vs ${previousGoodFeelings} last week`;
        } else if (recentBadFeelings > previousBadFeelings) {
          recentTrend = 'concerning';
          trendDetails = `${recentBadFeelings} difficult days this week vs ${previousBadFeelings} last week`;
        } else {
          trendDetails = `Consistently ${recentGoodFeelings} good days per week`;
        }
      } else {
        trendDetails = `${recentGoodFeelings} out of ${recent.length} recent meals felt good`;
      }
    }

    return {
      totalEntries,
      safeRatio,
      topSymptoms,
      feelingDistribution: {
        excellent: feelingDistribution.excellent || 0,
        great: feelingDistribution.great || 0,
        good: feelingDistribution.good || 0,
        okay: feelingDistribution.okay || 0,
        'not-good': feelingDistribution['not-good'] || 0,
        terrible: feelingDistribution.terrible || 0
      },
      recentTrend,
      trendDetails,
      averageSeverity,
      safeFoods,
      riskyFoods,
      foodSymptomAssociations
    };
  };

  const stats = calculateStats();

  const generateInsights = () => {
    const insights = [];

    // Safe foods insights
    if (stats.safeFoods.length > 0) {
      const topSafeFood = stats.safeFoods[0];
      insights.push({
        type: 'positive',
        title: `${topSafeFood.name} works great for you!`,
        description: `You've had ${topSafeFood.count} positive experiences with this dish${topSafeFood.restaurant ? ` from ${topSafeFood.restaurant}` : ''}`,
        icon: <Award className="w-4 h-4" />
      });
    }

    // Risky foods insights  
    if (stats.riskyFoods.length > 0) {
      const topRiskyFood = stats.riskyFoods[0];
      insights.push({
        type: 'warning',
        title: `Consider avoiding ${topRiskyFood.name}`,
        description: `This dish caused symptoms ${topRiskyFood.negativeCount} time(s). Common issues: ${topRiskyFood.commonSymptoms.join(', ')}`,
        icon: <AlertTriangle className="w-4 h-4" />
      });
    }

    // Trending insights
    if (stats.recentTrend === 'improving') {
      insights.push({
        type: 'positive',
        title: 'Great progress this week!',
        description: stats.trendDetails || 'Your digestive health is trending upward. Keep it up!',
        icon: <TrendingUp className="w-4 h-4" />
      });
    } else if (stats.recentTrend === 'concerning') {
      insights.push({
        type: 'warning',
        title: 'Watch your recent choices',
        description: stats.trendDetails || 'More symptoms than usual this week.',
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
        description: `Only ${stats.safeRatio}% safe meals. Focus on your safe foods list below.`,
        icon: <AlertTriangle className="w-4 h-4" />
      });
    }

    return insights.slice(0, 4); // Show up to 4 insights
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
      case 'excellent': return '#10b981'; // emerald-500
      case 'great': return '#22c55e'; // green-500
      case 'good': return '#4ade80'; // green-400
      case 'okay': return '#eab308'; // yellow-500
      case 'not-good': return '#f97316'; // orange-500
      case 'terrible': return '#ef4444'; // red-500
      default: return '#6b7280'; // gray-500
    }
  };

  const getFeelingBgClass = (feeling: string) => {
    switch (feeling) {
      case 'excellent': return 'bg-emerald-500/10 border-emerald-500/30';
      case 'great': return 'bg-green-500/10 border-green-500/30';
      case 'good': return 'bg-green-400/10 border-green-400/30';
      case 'okay': return 'bg-yellow-500/10 border-yellow-500/30';
      case 'not-good': return 'bg-orange-500/10 border-orange-500/30';
      case 'terrible': return 'bg-red-500/10 border-red-500/30';
      default: return 'bg-gray-500/10 border-gray-500/30';
    }
  };

  const getFeelingIcon = (feeling: string) => {
    switch (feeling) {
      case 'excellent': return '🤩';
      case 'great': return '😊';
      case 'good': return '🙂';
      case 'okay': return '😐';
      case 'not-good': return '😔';
      case 'terrible': return '😞';
      default: return '😐';
    }
  };

  const getFeelingDescription = (feeling: string) => {
    switch (feeling) {
      case 'excellent': return 'Felt amazing after eating';
      case 'great': return 'Felt really good after eating';
      case 'good': return 'Felt good after eating';
      case 'okay': return 'Felt neutral after eating';
      case 'not-good': return 'Experienced some discomfort';
      case 'terrible': return 'Felt quite unwell after eating';
      default: return 'Unknown feeling';
    }
  };

  const getFeelingLabel = (feeling: string) => {
    switch (feeling) {
      case 'excellent': return 'Excellent';
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

      {/* Safe Foods */}
      {stats.safeFoods.length > 0 && (
        <Card className="bg-gray-800 border-gray-700 p-4">
          <h3 className="text-white mb-3">🥗 Your Safe Foods</h3>
          <p className="text-sm text-gray-400 mb-3">
            Foods that consistently make you feel great - stick with these!
          </p>
          <div className="space-y-3">
            {stats.safeFoods.map((food, index) => (
              <div key={index} className="flex items-center justify-between bg-green-600/10 border border-green-600/30 rounded-lg p-3">
                <div className="flex-1">
                  <span className="text-white font-medium">{food.name}</span>
                  {food.restaurant && (
                    <div className="text-sm text-gray-400">{food.restaurant}</div>
                  )}
                </div>
                <div className="text-right">
                  <Badge className="bg-green-600/20 text-green-400 border-green-500/30">
                    {food.count} ✓
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Risky Foods */}
      {stats.riskyFoods.length > 0 && (
        <Card className="bg-gray-800 border-gray-700 p-4">
          <h3 className="text-white mb-3">⚠️ Foods to Watch</h3>
          <p className="text-sm text-gray-400 mb-3">
            Foods that have caused symptoms - consider avoiding or modifying these
          </p>
          <div className="space-y-3">
            {stats.riskyFoods.map((food, index) => (
              <div key={index} className="bg-red-600/10 border border-red-600/30 rounded-lg p-3">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <span className="text-white font-medium">{food.name}</span>
                    {food.restaurant && (
                      <div className="text-sm text-gray-400">{food.restaurant}</div>
                    )}
                  </div>
                  <Badge className="bg-red-600/20 text-red-400 border-red-500/30">
                    {food.negativeCount}x
                  </Badge>
                </div>
                {food.commonSymptoms.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {food.commonSymptoms.map((symptom, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs border-orange-400 text-orange-300">
                        {symptom}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* How You've Been Feeling */}
      <Card className="bg-gray-800 border-gray-700 p-4">
        <h3 className="text-white mb-3">😊 How You've Been Feeling</h3>
        <p className="text-sm text-gray-400 mb-4">
          Your digestive wellness after meals - this shows how you felt 2-4 hours after eating
        </p>
        
        {/* Summary Stats */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-gray-700/50 rounded-lg p-3">
            <div className="text-lg font-medium text-white">
              {stats.safeRatio}%
            </div>
            <div className="text-xs text-gray-400">
              Felt good or better
            </div>
          </div>
          <div className="bg-gray-700/50 rounded-lg p-3">
            <div className="text-lg font-medium text-white">
              {Math.round(((stats.feelingDistribution['not-good'] || 0) + (stats.feelingDistribution.terrible || 0)) / stats.totalEntries * 100) || 0}%
            </div>
            <div className="text-xs text-gray-400">
              Experienced discomfort
            </div>
          </div>
        </div>

        {/* Detailed Breakdown */}
        <div className="space-y-3">
          {Object.entries(stats.feelingDistribution)
            .filter(([_, count]) => count > 0)
            .sort(([,a], [,b]) => b - a)
            .map(([feeling, count]) => {
              const percentage = Math.round((count / stats.totalEntries) * 100);
              return (
                <div key={feeling} className={`border rounded-lg p-3 ${getFeelingBgClass(feeling)}`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">{getFeelingIcon(feeling)}</span>
                      <div>
                        <span className="text-white font-medium">{getFeelingLabel(feeling)}</span>
                        <div className="text-xs text-gray-400">{getFeelingDescription(feeling)}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-white font-medium">{count} meals</div>
                      <div className="text-xs text-gray-400">{percentage}%</div>
                    </div>
                  </div>
                  <Progress 
                    value={percentage} 
                    className="h-2 bg-gray-700" 
                    style={{
                      '--progress-background': getFeelingColor(feeling)
                    } as React.CSSProperties}
                  />
                </div>
              );
            })}
        </div>

        {/* Helpful Note */}
        <div className="mt-4 p-3 bg-blue-600/10 border border-blue-600/30 rounded-lg">
          <p className="text-xs text-blue-300">
            💡 <strong>How this works:</strong> After logging a meal, GutWise asks how you're feeling 2-4 hours later. 
            This helps identify which foods work well for your digestive system.
          </p>
        </div>
      </Card>

      {/* Potential Food Triggers */}
      {stats.topSymptoms.length > 0 && (
        <Card className="bg-gray-800 border-gray-700 p-4">
          <h3 className="text-white mb-3">🔍 Potential Food Triggers</h3>
          <p className="text-sm text-gray-400 mb-3">
            When you experience symptoms, these are the foods you ate 2-4 hours before. These might be your triggers.
          </p>
          
          {/* Explanation Box */}
          <div className="mb-4 p-3 bg-yellow-600/10 border border-yellow-600/30 rounded-lg">
            <p className="text-xs text-yellow-300">
              <strong>📋 How to read this:</strong> If you ate "Chicken Tikka" and felt bloating 3 hours later, 
              GutWise connects them as a potential trigger. The more times this happens, the stronger the connection.
            </p>
          </div>

          <div className="space-y-4">
            {stats.topSymptoms.map((symptom, index) => (
              <div key={index} className="bg-orange-600/10 border border-orange-600/30 rounded-lg p-4">
                {/* Symptom Header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">😣</span>
                    <div>
                      <span className="text-white font-medium capitalize">{symptom.name}</span>
                      <div className="text-xs text-gray-400">
                        Experienced {symptom.count} time{symptom.count > 1 ? 's' : ''}
                      </div>
                    </div>
                  </div>
                  <Badge 
                    variant="outline" 
                    className={`${
                      symptom.avgSeverity >= 4 ? 'border-red-400 text-red-300 bg-red-400/10' :
                      symptom.avgSeverity >= 3 ? 'border-orange-400 text-orange-300 bg-orange-400/10' :
                      'border-yellow-400 text-yellow-300 bg-yellow-400/10'
                    }`}
                  >
                    {symptom.avgSeverity}/5 pain level
                  </Badge>
                </div>

                {/* Food Triggers */}
                {symptom.topFoods.length > 0 ? (
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-sm text-gray-300 font-medium">🍽️ Foods eaten before this symptom:</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {symptom.topFoods.map((food, idx) => (
                        <div key={idx} className="bg-red-600/20 border border-red-500/30 rounded-lg px-3 py-1">
                          <span className="text-sm text-red-300">{food}</span>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-gray-400 mt-2">
                      💡 Consider avoiding these foods or ask for modifications when ordering
                    </p>
                  </div>
                ) : (
                  <div className="text-center py-2">
                    <p className="text-sm text-gray-400">
                      No specific food patterns identified yet. Keep tracking for better insights!
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Action Note */}
          <div className="mt-4 p-3 bg-blue-600/10 border border-blue-600/30 rounded-lg">
            <p className="text-xs text-blue-300">
              <strong>⚡ Quick Tip:</strong> These are patterns, not proof! A food might affect you differently 
              depending on portion size, preparation, or what else you eat with it. Use this as a starting point for discussion with your healthcare provider.
            </p>
          </div>
        </Card>
      )}

      {/* Recent Trend */}
      <Card className="bg-gray-800 border-gray-700 p-4">
        <h3 className="text-white mb-3">📈 Recent Trend</h3>
        <div className="flex items-start space-x-3">
          <div className={`p-3 rounded-full flex-shrink-0 ${
            stats.recentTrend === 'improving' ? 'bg-green-600' :
            stats.recentTrend === 'concerning' ? 'bg-red-600' :
            'bg-gray-600'
          }`}>
            {stats.recentTrend === 'improving' ? <TrendingUp className="w-5 h-5" /> :
             stats.recentTrend === 'concerning' ? <TrendingDown className="w-5 h-5" /> :
             <Activity className="w-5 h-5" />}
          </div>
          <div className="flex-1">
            <div className="text-white font-medium capitalize mb-1">{stats.recentTrend}</div>
            <div className="text-sm text-gray-400 mb-2">
              {stats.trendDetails}
            </div>
            <div className="text-xs text-gray-500">
              {stats.recentTrend === 'improving' ? 
                'Keep doing what you\'re doing! Focus on your safe foods.' :
                stats.recentTrend === 'concerning' ? 
                'Consider reviewing your recent food choices and avoiding risky foods.' :
                'Your digestive health is stable. Continue tracking for better insights.'}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}