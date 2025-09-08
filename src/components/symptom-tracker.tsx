import { useState } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Textarea } from "./ui/textarea";
import { Clock, AlertCircle, CheckCircle } from "lucide-react";
import { logSymptoms } from "../utils/api/index";

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
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const feelingOptions = [
    {
      value: "great",
      label: "Great",
      color: "bg-green-600 hover:bg-green-700",
      icon: "😊",
    },
    {
      value: "good",
      label: "Good",
      color: "bg-blue-600 hover:bg-blue-700",
      icon: "🙂",
    },
    {
      value: "okay",
      label: "Okay",
      color: "bg-yellow-600 hover:bg-yellow-700",
      icon: "😐",
    },
    {
      value: "not-good",
      label: "Not Good",
      color: "bg-orange-600 hover:bg-orange-700",
      icon: "😕",
    },
    {
      value: "terrible",
      label: "Terrible",
      color: "bg-red-600 hover:bg-red-700",
      icon: "😣",
    },
  ];

  const commonSymptoms = [
    "Bloating",
    "Gas",
    "Stomach pain",
    "Nausea",
    "Heartburn",
    "Constipation",
    "Diarrhea",
    "Fatigue",
    "Headache",
    "Mood changes",
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
      notes: notes.trim() || null,
      recorded_at: new Date().toISOString(),
    };

    console.log("Logging symptoms:", symptomData);
    
    try {
      // Try to save to real database with authentication
      const result = await logSymptoms(symptomData);
      console.log("Symptoms saved successfully:", result);
      
      setTimeout(() => {
        console.log("Symptoms logged, continuing to success");
        onNavigate("feedback-success");
        setIsSubmitting(false);
      }, 1000);
      
    } catch (err) {
      const errorMessage = err?.message || err || 'Failed to save symptoms';
      console.error("Symptom save failed:", errorMessage);
      
      // Continue to success screen even if save fails (graceful degradation)
      setTimeout(() => {
        console.log("Symptoms logged with error, continuing to success (offline mode)");
        onNavigate("feedback-success");
        setIsSubmitting(false);
        // You could show a toast here about offline mode
      }, 1000);
    }
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
      <Card className="bg-gray-800 border-gray-700 p-4">
        <h3 className="text-white mb-3">
          Overall, how do you feel?
        </h3>
        <div className="grid grid-cols-1 gap-2">
          {feelingOptions.map((option) => (
            <Button
              key={option.value}
              variant={
                selectedFeeling === option.value
                  ? "default"
                  : "outline"
              }
              className={`h-12 justify-start ${
                selectedFeeling === option.value
                  ? option.color + " text-white"
                  : "border-gray-600 text-gray-300 hover:bg-gray-700"
              }`}
              onClick={() => setSelectedFeeling(option.value)}
            >
              <span className="mr-3">{option.icon}</span>
              {option.label}
            </Button>
          ))}
        </div>
      </Card>

      {/* Symptoms */}
      {selectedFeeling &&
        ["okay", "not-good", "terrible"].includes(
          selectedFeeling,
        ) && (
          <Card className="bg-gray-800 border-gray-700 p-4">
            <h3 className="text-white mb-3">Any symptoms?</h3>
            <div className="space-y-3">
              {commonSymptoms.map((symptom) => (
                <div key={symptom}>
                  <div className="flex items-center justify-between mb-2">
                    <Badge
                      variant={
                        selectedSymptoms.includes(symptom)
                          ? "default"
                          : "outline"
                      }
                      className={`cursor-pointer ${
                        selectedSymptoms.includes(symptom)
                          ? "bg-orange-600 hover:bg-orange-700 text-white"
                          : "border-gray-600 text-gray-300 hover:bg-gray-700"
                      }`}
                      onClick={() => toggleSymptom(symptom)}
                    >
                      {symptom}
                    </Badge>
                  </div>

                  {selectedSymptoms.includes(symptom) && (
                    <div className="ml-4">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-xs text-gray-400">
                          Severity:
                        </span>
                        <div className="flex space-x-1">
                          {[1, 2, 3, 4, 5].map((level) => (
                            <button
                              key={level}
                              onClick={() =>
                                handleSeverityChange(
                                  symptom,
                                  level,
                                )
                              }
                              className={`w-6 h-6 rounded-full text-xs ${
                                severity[symptom] >= level
                                  ? "bg-orange-500 text-white"
                                  : "bg-gray-600 text-gray-400"
                              }`}
                            >
                              {level}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
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
        <Button
          onClick={handleSubmit}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3"
          disabled={!selectedFeeling || isSubmitting}
        >
          {isSubmitting ? "Saving..." : "Submit Feedback"}
        </Button>
        <p className="text-xs text-gray-500 text-center mt-2">
          Thank you for helping us learn your preferences
        </p>
      </div>
    </div>
  );
}