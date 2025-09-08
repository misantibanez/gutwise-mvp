import { useState } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Textarea } from "./ui/textarea";
import { Clock, AlertCircle, CheckCircle, Zap, Heart, Brain, Activity } from "lucide-react";

interface SymptomTrackerProps {
  meal?: any;
  onNavigate: (screen: string) => void;
  onBack: () => void;
}

export function SymptomTracker({
  meal,
  onNavigate,
  onBack,
}: SymptomTrackerProps) {
  const [selectedFeeling, setSelectedFeeling] =
    useState<string>("");
  const [selectedSymptoms, setSelectedSymptoms] = useState<
    string[]
  >([]);
  const [severity, setSeverity] = useState<{
    [key: string]: number;
  }>({});
  const [timing, setTiming] = useState<{
    [key: string]: string;
  }>({});
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const feelingOptions = [
    {
      value: "excellent",
      label: "Excellent",
      color: "bg-emerald-600 hover:bg-emerald-700",
      icon: "🤩",
      description: "Feel amazing, full of energy"
    },
    {
      value: "great",
      label: "Great",
      color: "bg-green-600 hover:bg-green-700",
      icon: "😊",
      description: "Feel good, comfortable"
    },
    {
      value: "good",
      label: "Good",
      color: "bg-blue-600 hover:bg-blue-700",
      icon: "🙂",
      description: "Feel normal, no issues"
    },
    {
      value: "okay",
      label: "Okay",
      color: "bg-yellow-600 hover:bg-yellow-700",
      icon: "😐",
      description: "Some mild discomfort"
    },
    {
      value: "not-good",
      label: "Not Good",
      color: "bg-orange-600 hover:bg-orange-700",
      icon: "😕",
      description: "Noticeable discomfort"
    },
    {
      value: "poor",
      label: "Poor",
      color: "bg-red-600 hover:bg-red-700",
      icon: "😣",
      description: "Significant discomfort"
    },
    {
      value: "terrible",
      label: "Terrible",
      color: "bg-red-700 hover:bg-red-800",
      icon: "🤢",
      description: "Severe symptoms, very uncomfortable"
    }
  ];

  const symptomCategories = [
    {
      name: "Digestive",
      icon: <Activity className="w-4 h-4" />,
      color: "border-orange-500 text-orange-300",
      symptoms: [
        { name: "Bloating", timing: true },
        { name: "Gas", timing: true },
        { name: "Stomach pain", timing: true },
        { name: "Abdominal cramps", timing: true },
        { name: "Nausea", timing: true },
        { name: "Heartburn", timing: true },
        { name: "Acid reflux", timing: true },
        { name: "Constipation", timing: false },
        { name: "Diarrhea", timing: true },
        { name: "Urgency", timing: true }
      ]
    },
    {
      name: "Energy & Body",
      icon: <Zap className="w-4 h-4" />,
      color: "border-blue-500 text-blue-300",
      symptoms: [
        { name: "Fatigue", timing: true },
        { name: "Low energy", timing: true },
        { name: "Joint pain", timing: true },
        { name: "Muscle aches", timing: true },
        { name: "Headache", timing: true },
        { name: "Dizziness", timing: true }
      ]
    },
    {
      name: "Mental & Emotional",
      icon: <Brain className="w-4 h-4" />,
      color: "border-purple-500 text-purple-300",
      symptoms: [
        { name: "Mood changes", timing: true },
        { name: "Irritability", timing: true },
        { name: "Anxiety", timing: true },
        { name: "Brain fog", timing: true },
        { name: "Difficulty concentrating", timing: true }
      ]
    },
    {
      name: "Sleep & Other",
      icon: <Heart className="w-4 h-4" />,
      color: "border-green-500 text-green-300",
      symptoms: [
        { name: "Sleep issues", timing: false },
        { name: "Skin issues", timing: true },
        { name: "Congestion", timing: true },
        { name: "Hot flashes", timing: true }
      ]
    }
  ];

  const timingOptions = [
    { value: "immediate", label: "Right away (0-30 min)" },
    { value: "soon", label: "Soon after (30 min - 2 hrs)" },
    { value: "later", label: "Later (2-6 hrs)" },
    { value: "much-later", label: "Much later (6+ hrs)" }
  ];

  const toggleSymptom = (symptom: string) => {
    setSelectedSymptoms((prev) => {
      if (prev.includes(symptom)) {
        const newSeverity = { ...severity };
        delete newSeverity[symptom];
        setSeverity(newSeverity);
        return prev.filter((s) => s !== symptom);
      } else {
        setSeverity((prev) => ({ ...prev, [symptom]: 1 }));
        return [...prev, symptom];
      }
    });
  };

  const handleSeverityChange = (
    symptom: string,
    value: number,
  ) => {
    setSeverity((prev) => ({ ...prev, [symptom]: value }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    const symptomData = {
      meal_id: meal?.id || null,
      overall_feeling: selectedFeeling,
      symptoms: selectedSymptoms,
      severity_scores: severity,
      timing: timing,
      notes: notes.trim() || null,
      recorded_at: new Date().toISOString(),
    };

    console.log("Mock symptoms logged:", symptomData);
    
    // Simple mock save - no API calls
    setTimeout(() => {
      console.log("Symptoms saved successfully");
      onNavigate("feedback-success");
      setIsSubmitting(false);
    }, 1500);
  };

  const mockMeal = meal || {
    dish: "Mediterranean Quinoa Bowl",
    restaurant: "Green Bowl Cafe",
    time: "3 hours ago",
  };

  // Get display values based on whether we have real meal data or mock data
  const displayMeal = meal ? {
    dish: meal.dish_name,
    restaurant: meal.restaurant_name || "Unknown restaurant",
    time: meal.meal_time ? new Date(meal.meal_time).toLocaleDateString() + " at " + new Date(meal.meal_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : "Recently"
  } : mockMeal;

  return (
    <div
      className="space-y-6"
      data-frame="[screen:SymptomTracker]"
    >
      {/* Header */}
      <div className="flex items-center justify-between py-4">
        <Button
          variant="ghost"
          onClick={onBack}
          className="text-gray-300 hover:text-white hover:bg-gray-800"
        >
          ← Back
        </Button>
        <h2 className="text-white">How are you feeling?</h2>
        <div></div>
      </div>

      {/* Meal Reference */}
      <Card className="bg-gray-800 border-gray-700 p-4">
        <div className="flex items-center space-x-2 mb-2">
          <Clock className="w-4 h-4 text-blue-400" />
          <span className="text-blue-400">
            Following up on your meal
          </span>
        </div>
        <h3 className="text-white mb-1">{displayMeal.dish}</h3>
        <p className="text-gray-400">
          {displayMeal.restaurant} • {displayMeal.time}
        </p>
      </Card>

      {/* Overall Feeling */}
      <Card className="bg-gray-800 border-gray-700 p-6">
        <h3 className="text-white mb-6 text-center">
          Overall, how do you feel after this meal?
        </h3>
        <div className="grid grid-cols-1 gap-3">
          {feelingOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setSelectedFeeling(option.value)}
              className={`group relative overflow-hidden rounded-xl p-4 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] ${
                selectedFeeling === option.value
                  ? `${option.color} shadow-lg ring-2 ring-white/20 scale-[1.02]`
                  : "bg-gray-700/50 hover:bg-gray-700 border border-gray-600 hover:border-gray-500"
              }`}
            >
              {/* Background gradient overlay for selected state */}
              {selectedFeeling === option.value && (
                <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-20" />
              )}
              
              <div className="relative flex items-center space-x-4">
                {/* Emoji with animated background */}
                <div className={`flex items-center justify-center w-14 h-14 rounded-full transition-all duration-300 ${
                  selectedFeeling === option.value 
                    ? 'bg-white/20 shadow-lg' 
                    : 'bg-gray-600/50 group-hover:bg-gray-600'
                }`}>
                  <span className="text-2xl transform transition-transform duration-300 group-hover:scale-110">
                    {option.icon}
                  </span>
                </div>

                {/* Content */}
                <div className="flex-1 text-left">
                  <div className={`font-medium mb-1 transition-colors duration-300 ${
                    selectedFeeling === option.value ? 'text-white' : 'text-gray-200'
                  }`}>
                    {option.label}
                  </div>
                  <div className={`text-sm transition-colors duration-300 ${
                    selectedFeeling === option.value ? 'text-white/80' : 'text-gray-400'
                  }`}>
                    {option.description}
                  </div>
                </div>

                {/* Selection indicator */}
                <div className={`w-6 h-6 rounded-full border-2 transition-all duration-300 flex items-center justify-center ${
                  selectedFeeling === option.value
                    ? 'border-white bg-white'
                    : 'border-gray-400 group-hover:border-gray-300'
                }`}>
                  {selectedFeeling === option.value && (
                    <CheckCircle className="w-4 h-4 text-gray-800" />
                  )}
                </div>
              </div>

              {/* Ripple effect on tap */}
              <div className="absolute inset-0 opacity-0 group-active:opacity-20 bg-white rounded-xl transition-opacity duration-150" />
            </button>
          ))}
        </div>

        {/* Helper text */}
        {!selectedFeeling && (
          <p className="text-gray-400 text-center mt-4 text-sm animate-fade-in">
            Tap an option to continue with your symptom report
          </p>
        )}
        
        {selectedFeeling && (
          <div className="mt-4 p-3 bg-blue-900/20 border border-blue-500/30 rounded-lg animate-fade-in">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-blue-400 flex-shrink-0" />
              <div className="text-sm text-blue-300">
                <span className="font-medium">Feeling logged:</span> {feelingOptions.find(opt => opt.value === selectedFeeling)?.label}
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Symptoms */}
      {selectedFeeling &&
        ["okay", "not-good", "poor", "terrible"].includes(
          selectedFeeling,
        ) && (
          <Card className="bg-gray-800 border-gray-700 p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white">Any specific symptoms?</h3>
              <Badge variant="outline" className="text-xs border-gray-500 text-gray-400">
                {selectedSymptoms.length} selected
              </Badge>
            </div>
            
            <div className="space-y-4">
              {symptomCategories.map((category) => (
                <div key={category.name} className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <div className="p-1 bg-gray-700 rounded">
                      {category.icon}
                    </div>
                    <Badge
                      variant="outline"
                      className={`${category.color} cursor-default`}
                    >
                      {category.name}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-2 ml-6">
                    {category.symptoms.map((symptom) => (
                      <div key={symptom.name} className="space-y-2">
                        <Badge
                          variant={
                            selectedSymptoms.includes(symptom.name)
                              ? "default"
                              : "outline"
                          }
                          className={`cursor-pointer w-full justify-center py-2 ${
                            selectedSymptoms.includes(symptom.name)
                              ? "bg-orange-600 hover:bg-orange-700 text-white border-orange-500"
                              : "border-gray-600 text-gray-300 hover:bg-gray-700"
                          }`}
                          onClick={() => toggleSymptom(symptom.name)}
                        >
                          {symptom.name}
                        </Badge>

                        {selectedSymptoms.includes(symptom.name) && (
                          <div className="space-y-2 p-2 bg-gray-700/50 rounded-lg">
                            <div className="flex items-center space-x-2">
                              <span className="text-xs text-gray-400 min-w-fit">
                                Severity:
                              </span>
                              <div className="flex space-x-1">
                                {[1, 2, 3, 4, 5].map((level) => (
                                  <button
                                    key={level}
                                    onClick={() =>
                                      handleSeverityChange(
                                        symptom.name,
                                        level,
                                      )
                                    }
                                    className={`w-6 h-6 rounded-full text-xs transition-colors ${
                                      severity[symptom.name] >= level
                                        ? "bg-orange-500 text-white"
                                        : "bg-gray-600 text-gray-400 hover:bg-gray-500"
                                    }`}
                                  >
                                    {level}
                                  </button>
                                ))}
                              </div>
                            </div>

                            {symptom.timing && (
                              <div className="space-y-1">
                                <span className="text-xs text-gray-400">
                                  When did it start?
                                </span>
                                <div className="grid grid-cols-2 gap-1">
                                  {timingOptions.map((option) => (
                                    <button
                                      key={option.value}
                                      onClick={() =>
                                        setTiming((prev) => ({ ...prev, [symptom.name]: option.value }))
                                      }
                                      className={`px-2 py-1 rounded text-xs transition-colors ${
                                        timing[symptom.name] === option.value
                                          ? "bg-blue-600 text-white"
                                          : "bg-gray-600 text-gray-300 hover:bg-gray-500"
                                      }`}
                                    >
                                      {option.label}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

      {/* Additional Notes */}
      <Card className="bg-gray-800 border-gray-700 p-4">
        <h3 className="text-white mb-3">Additional Notes</h3>
        <Textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Anything else you'd like to note about how this meal affected you?"
          rows={3}
          className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400"
        />
      </Card>

      {/* Submit */}
      <div className="pb-6">
        {selectedFeeling && selectedSymptoms.length > 0 && (
          <Card className="bg-blue-600/10 border-blue-500/30 p-3 mb-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-blue-400" />
              <div className="text-sm text-blue-300">
                <span className="font-medium">{selectedSymptoms.length} symptom{selectedSymptoms.length !== 1 ? 's' : ''}</span> logged with severity levels
              </div>
            </div>
          </Card>
        )}
        
        <Button
          onClick={handleSubmit}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3"
          disabled={!selectedFeeling || isSubmitting}
        >
          {isSubmitting ? (
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              <span>Saving your feedback...</span>
            </div>
          ) : (
            <div className="flex items-center justify-center space-x-2">
              <CheckCircle className="w-4 h-4" />
              <span>Submit Symptom Report</span>
            </div>
          )}
        </Button>
        <p className="text-xs text-gray-500 text-center mt-2">
          Your feedback helps us provide better food recommendations
        </p>
      </div>
    </div>
  );
}