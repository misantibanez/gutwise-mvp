import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Checkbox } from "./ui/checkbox";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import { 
  Activity, 
  Plus, 
  X, 
  Check,
  Heart,
  AlertTriangle,
  Info
} from "lucide-react";
import { projectId } from '../utils/supabase/info';

interface HealthConditionsScreenProps {
  onNavigate: (screen: string) => void;
  onBack: () => void;
}

const COMMON_CONDITIONS = [
  {
    id: 'ibs',
    name: 'IBS (Irritable Bowel Syndrome)',
    description: 'Affects digestion and can cause cramping, bloating, gas, and changes in bowel movements',
    category: 'digestive'
  },
  {
    id: 'crohns',
    name: "Crohn's Disease",
    description: 'Inflammatory bowel disease that can affect any part of the digestive tract',
    category: 'digestive'
  },
  {
    id: 'ulcerative_colitis',
    name: 'Ulcerative Colitis',
    description: 'Inflammatory bowel disease affecting the colon and rectum',
    category: 'digestive'
  },
  {
    id: 'celiac',
    name: 'Celiac Disease',
    description: 'Autoimmune disorder triggered by gluten consumption',
    category: 'autoimmune'
  },
  {
    id: 'lactose_intolerance',
    name: 'Lactose Intolerance',
    description: 'Difficulty digesting lactose found in dairy products',
    category: 'intolerance'
  },
  {
    id: 'gerd',
    name: 'GERD (Acid Reflux)',
    description: 'Stomach acid flows back into the esophagus causing heartburn',
    category: 'digestive'
  },
  {
    id: 'gastroparesis',
    name: 'Gastroparesis',
    description: 'Delayed stomach emptying affecting digestion',
    category: 'digestive'
  },
  {
    id: 'diverticulitis',
    name: 'Diverticulitis',
    description: 'Inflammation of small pouches in the colon wall',
    category: 'digestive'
  },
  {
    id: 'sibo',
    name: 'SIBO (Small Intestinal Bacterial Overgrowth)',
    description: 'Excessive bacteria in the small intestine causing digestive symptoms',
    category: 'digestive'
  },
  {
    id: 'food_allergies',
    name: 'Food Allergies',
    description: 'Immune system reactions to specific foods',
    category: 'allergy'
  }
];

const DIETARY_RESTRICTIONS = [
  {
    id: 'vegetarian',
    name: 'Vegetarian',
    description: 'No meat, poultry, or fish'
  },
  {
    id: 'vegan',
    name: 'Vegan',
    description: 'No animal products including dairy, eggs, and honey'
  },
  {
    id: 'gluten_free',
    name: 'Gluten-Free',
    description: 'No wheat, barley, rye, or other gluten-containing grains'
  },
  {
    id: 'dairy_free',
    name: 'Dairy-Free',
    description: 'No milk, cheese, yogurt, or other dairy products'
  },
  {
    id: 'low_fodmap',
    name: 'Low FODMAP',
    description: 'Avoiding fermentable carbohydrates that can trigger IBS symptoms'
  },
  {
    id: 'paleo',
    name: 'Paleo',
    description: 'Whole foods, no grains, legumes, or processed foods'
  },
  {
    id: 'keto',
    name: 'Ketogenic',
    description: 'Very low carb, high fat diet'
  },
  {
    id: 'kosher',
    name: 'Kosher',
    description: 'Following Jewish dietary laws'
  },
  {
    id: 'halal',
    name: 'Halal',
    description: 'Following Islamic dietary laws'
  },
  {
    id: 'low_sodium',
    name: 'Low Sodium',
    description: 'Reduced salt intake for heart health'
  }
];

export function HealthConditionsScreen({ onNavigate, onBack }: HealthConditionsScreenProps) {
  const [selectedConditions, setSelectedConditions] = useState<string[]>([]);
  const [selectedRestrictions, setSelectedRestrictions] = useState<string[]>([]);
  const [customConditions, setCustomConditions] = useState<string[]>([]);
  const [customRestrictions, setCustomRestrictions] = useState<string[]>([]);
  const [newCondition, setNewCondition] = useState('');
  const [newRestriction, setNewRestriction] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Load existing data on mount
  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('supabase_access_token');
      console.log('Loading profile with token:', token ? 'Token exists' : 'No token');
      
      if (!token) {
        console.error('No access token found');
        setIsLoading(false);
        return;
      }
      
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-10f495ea/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      console.log('Profile response status:', response.status);
      
      if (response.ok) {
        const { profile } = await response.json();
        console.log('Profile loaded:', profile);
        if (profile) {
          setSelectedConditions(profile.health_conditions || []);
          setSelectedRestrictions(profile.dietary_restrictions || []);
        }
      } else {
        const errorData = await response.text();
        console.error('Profile load error:', response.status, errorData);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConditionToggle = (conditionId: string) => {
    setSelectedConditions(prev => 
      prev.includes(conditionId) 
        ? prev.filter(id => id !== conditionId)
        : [...prev, conditionId]
    );
  };

  const handleRestrictionToggle = (restrictionId: string) => {
    setSelectedRestrictions(prev => 
      prev.includes(restrictionId)
        ? prev.filter(id => id !== restrictionId)
        : [...prev, restrictionId]
    );
  };

  const addCustomCondition = () => {
    if (newCondition.trim() && !customConditions.includes(newCondition.trim())) {
      const condition = newCondition.trim();
      setCustomConditions(prev => [...prev, condition]);
      setSelectedConditions(prev => [...prev, `custom_${condition.toLowerCase().replace(/\s+/g, '_')}`]);
      setNewCondition('');
    }
  };

  const addCustomRestriction = () => {
    if (newRestriction.trim() && !customRestrictions.includes(newRestriction.trim())) {
      const restriction = newRestriction.trim();
      setCustomRestrictions(prev => [...prev, restriction]);
      setSelectedRestrictions(prev => [...prev, `custom_${restriction.toLowerCase().replace(/\s+/g, '_')}`]);
      setNewRestriction('');
    }
  };

  const removeCustomCondition = (condition: string) => {
    setCustomConditions(prev => prev.filter(c => c !== condition));
    setSelectedConditions(prev => prev.filter(id => id !== `custom_${condition.toLowerCase().replace(/\s+/g, '_')}`));
  };

  const removeCustomRestriction = (restriction: string) => {
    setCustomRestrictions(prev => prev.filter(r => r !== restriction));
    setSelectedRestrictions(prev => prev.filter(id => id !== `custom_${restriction.toLowerCase().replace(/\s+/g, '_')}`));
  };

  const saveProfile = async () => {
    setIsSaving(true);
    try {
      const token = localStorage.getItem('supabase_access_token');
      console.log('Saving profile with token:', token ? 'Token exists' : 'No token');
      
      if (!token) {
        console.error('No access token found for save');
        alert('Authentication error. Please sign out and sign back in.');
        setIsSaving(false);
        return;
      }
      
      // Combine selected and custom conditions/restrictions
      const allConditions = [
        ...selectedConditions.filter(id => !id.startsWith('custom_')),
        ...customConditions.map(c => `custom_${c.toLowerCase().replace(/\s+/g, '_')}`)
      ];
      
      const allRestrictions = [
        ...selectedRestrictions.filter(id => !id.startsWith('custom_')),
        ...customRestrictions.map(r => `custom_${r.toLowerCase().replace(/\s+/g, '_')}`)
      ];

      console.log('Saving data:', { health_conditions: allConditions, dietary_restrictions: allRestrictions });

      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-10f495ea/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          health_conditions: allConditions,
          dietary_restrictions: allRestrictions,
        }),
      });

      console.log('Save response status:', response.status);

      if (response.ok) {
        const result = await response.json();
        console.log('Profile saved successfully:', result);
        // Show success and navigate back
        onBack();
      } else {
        const errorData = await response.text();
        console.error('Failed to save profile:', response.status, errorData);
        alert(`Failed to save profile: ${response.status} - ${errorData}`);
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      alert(`Error saving profile: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-2 border-green-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-400">Loading your profile...</p>
        </div>
      </div>
    );
  }

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
        <h2 className="text-white">Health Profile</h2>
        <div></div>
      </div>

      {/* Info Card */}
      <Card className="bg-gradient-to-r from-blue-900/50 to-purple-900/50 border-blue-700 p-4">
        <div className="flex items-start space-x-3">
          <Info className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
          <div className="space-y-2">
            <h3 className="text-blue-200 font-medium">Why we need this information</h3>
            <p className="text-blue-100 text-sm leading-relaxed">
              Your health conditions and dietary preferences help our AI provide personalized menu recommendations 
              and identify potential trigger foods before you order.
            </p>
          </div>
        </div>
      </Card>

      {/* Health Conditions */}
      <div className="space-y-4">
        <div>
          <h3 className="text-white text-lg mb-2 flex items-center">
            <Activity className="w-5 h-5 mr-2 text-red-400" />
            Health Conditions
          </h3>
          <p className="text-gray-400 text-sm mb-4">
            Select any digestive or health conditions that affect your food choices.
          </p>
        </div>

        <div className="grid gap-3">
          {COMMON_CONDITIONS.map((condition) => (
            <Card key={condition.id} className="bg-gray-800 border-gray-700">
              <div className="p-4">
                <div className="flex items-start space-x-3">
                  <Checkbox
                    id={condition.id}
                    checked={selectedConditions.includes(condition.id)}
                    onCheckedChange={() => handleConditionToggle(condition.id)}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <label 
                      htmlFor={condition.id}
                      className="block text-white font-medium cursor-pointer"
                    >
                      {condition.name}
                    </label>
                    <p className="text-sm text-gray-400 mt-1">{condition.description}</p>
                    <Badge 
                      variant="outline" 
                      className="mt-2 text-xs border-gray-600 text-gray-400"
                    >
                      {condition.category}
                    </Badge>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Custom Conditions */}
        <Card className="bg-gray-800 border-gray-700 p-4">
          <h4 className="text-white font-medium mb-3">Add Custom Condition</h4>
          <div className="flex space-x-2 mb-3">
            <Input
              placeholder="Enter a condition not listed above"
              value={newCondition}
              onChange={(e) => setNewCondition(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addCustomCondition()}
              className="bg-gray-700 border-gray-600 text-white"
            />
            <Button 
              onClick={addCustomCondition}
              size="sm"
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          {customConditions.length > 0 && (
            <div className="space-y-2">
              {customConditions.map((condition) => (
                <div key={condition} className="flex items-center justify-between bg-gray-700 rounded-lg p-2">
                  <span className="text-white text-sm">{condition}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeCustomCondition(condition)}
                    className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      <Separator className="bg-gray-700" />

      {/* Dietary Restrictions */}
      <div className="space-y-4">
        <div>
          <h3 className="text-white text-lg mb-2 flex items-center">
            <Heart className="w-5 h-5 mr-2 text-green-400" />
            Dietary Preferences & Restrictions
          </h3>
          <p className="text-gray-400 text-sm mb-4">
            Select any dietary restrictions or preferences you follow.
          </p>
        </div>

        <div className="grid gap-3">
          {DIETARY_RESTRICTIONS.map((restriction) => (
            <Card key={restriction.id} className="bg-gray-800 border-gray-700">
              <div className="p-4">
                <div className="flex items-start space-x-3">
                  <Checkbox
                    id={restriction.id}
                    checked={selectedRestrictions.includes(restriction.id)}
                    onCheckedChange={() => handleRestrictionToggle(restriction.id)}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <label 
                      htmlFor={restriction.id}
                      className="block text-white font-medium cursor-pointer"
                    >
                      {restriction.name}
                    </label>
                    <p className="text-sm text-gray-400 mt-1">{restriction.description}</p>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Custom Restrictions */}
        <Card className="bg-gray-800 border-gray-700 p-4">
          <h4 className="text-white font-medium mb-3">Add Custom Restriction</h4>
          <div className="flex space-x-2 mb-3">
            <Input
              placeholder="Enter a dietary restriction not listed above"
              value={newRestriction}
              onChange={(e) => setNewRestriction(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addCustomRestriction()}
              className="bg-gray-700 border-gray-600 text-white"
            />
            <Button 
              onClick={addCustomRestriction}
              size="sm"
              className="bg-green-600 hover:bg-green-700"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          {customRestrictions.length > 0 && (
            <div className="space-y-2">
              {customRestrictions.map((restriction) => (
                <div key={restriction} className="flex items-center justify-between bg-gray-700 rounded-lg p-2">
                  <span className="text-white text-sm">{restriction}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeCustomRestriction(restriction)}
                    className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Save Button */}
      <Card className="bg-gray-800 border-gray-700 p-4">
        <Button
          onClick={saveProfile}
          disabled={isSaving}
          className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white"
        >
          {isSaving ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              Saving...
            </>
          ) : (
            <>
              <Check className="w-4 h-4 mr-2" />
              Save Health Profile
            </>
          )}
        </Button>
        
        {(selectedConditions.length > 0 || selectedRestrictions.length > 0) && (
          <div className="mt-4 p-3 bg-green-900/20 border border-green-700 rounded-lg">
            <div className="flex items-start space-x-2">
              <AlertTriangle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-green-200">
                <p>
                  You've selected <strong>{selectedConditions.length + customConditions.length}</strong> health condition(s) 
                  and <strong>{selectedRestrictions.length + customRestrictions.length}</strong> dietary restriction(s).
                </p>
                <p className="mt-1 text-green-300">
                  Our AI will use this information to provide personalized recommendations.
                </p>
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}