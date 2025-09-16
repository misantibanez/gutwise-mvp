import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { MapPin } from "lucide-react";

interface CheckInModalProps {
  onNavigate: (screen: string) => void;
  onClose: () => void;
}

export function CheckInModal({ onNavigate, onClose }: CheckInModalProps) {
  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
      <Card className="bg-gray-800 border-gray-700 p-6 max-w-sm w-full">
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <MapPin className="w-5 h-5 text-blue-400" />
            <span className="text-blue-400">GutWise Check-in</span>
          </div>
          
          <h3 className="text-white text-lg">Are you eating out?</h3>
          <p className="text-gray-400 text-sm">
            We found 3 restaurants nearby. Pick yours to see safe options.
          </p>
          
          <div className="space-y-3 pt-2">
            <Button 
              onClick={() => {
                onClose();
                onNavigate('restaurants');
              }}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              Choose Restaurant
            </Button>
            
            <Button 
              onClick={onClose}
              variant="ghost"
              className="w-full text-gray-300 hover:text-white hover:bg-gray-700"
            >
              Not eating out
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}