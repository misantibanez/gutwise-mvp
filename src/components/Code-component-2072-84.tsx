import { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Textarea } from './ui/textarea';
import { 
  Trophy, 
  Target, 
  Calendar, 
  Award, 
  Zap, 
  Star, 
  Share2, 
  Copy, 
  CheckCircle,
  TrendingUp,
  Flame,
  Crown
} from 'lucide-react';
import { gamificationService, GamificationStats, Achievement } from '../utils/gamification-service';
import { toast } from 'sonner@2.0.3';

interface GamificationDisplayProps {
  variant?: 'full' | 'compact' | 'mini';
  showDoctorShare?: boolean;
}

export function GamificationDisplay({ variant = 'full', showDoctorShare = true }: GamificationDisplayProps) {
  const [stats, setStats] = useState<GamificationStats>(gamificationService.getStats());
  const [showAchievements, setShowAchievements] = useState(false);
  const [showDoctorReport, setShowDoctorReport] = useState(false);
  const [doctorReport, setDoctorReport] = useState('');

  useEffect(() => {
    setStats(gamificationService.getStats());
  }, []);

  const levelProgress = gamificationService.getProgressToNextLevel(stats);
  const weeklyProgress = gamificationService.getWeeklyProgress(stats);

  const getIconComponent = (iconName: string) => {
    const icons = {
      Trophy,
      Target,
      Calendar,
      Award,
      Zap,
      Star
    };
    return icons[iconName as keyof typeof icons] || Trophy;
  };

  const handleGenerateDoctorReport = () => {
    const report = gamificationService.generateDoctorReport(stats);
    setDoctorReport(report);
    setShowDoctorReport(true);
  };

  const handleCopyReport = async () => {
    try {
      await navigator.clipboard.writeText(doctorReport);
      toast.success('Report copied to clipboard');
    } catch (error) {
      toast.error('Failed to copy report');
    }
  };

  const handleShareReport = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'GutWise Progress Report',
          text: doctorReport
        });
      } catch (error) {
        // User cancelled sharing
      }
    } else {
      handleCopyReport();
    }
  };

  if (variant === 'mini') {
    return (
      <div className="flex items-center space-x-4 p-3 bg-gray-800 rounded-lg">
        <div className="flex items-center space-x-2">
          <Crown className="w-5 h-5 text-yellow-400" />
          <span className="text-white">Level {stats.level}</span>
        </div>
        <div className="flex items-center space-x-2">
          <Flame className="w-5 h-5 text-orange-400" />
          <span className="text-orange-400">{stats.currentStreak}</span>
        </div>
        <div className="flex items-center space-x-2">
          <Trophy className="w-5 h-5 text-blue-400" />
          <span className="text-blue-400">{stats.achievements.length}</span>
        </div>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <Card className="bg-gray-800 border-gray-700 p-4">
        <div className="space-y-4">
          {/* Level and XP */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Crown className="w-6 h-6 text-yellow-400" />
              <div>
                <h3 className="text-white">Level {stats.level}</h3>
                <p className="text-xs text-gray-400">{stats.experiencePoints} XP</p>
              </div>
            </div>
            <div className="flex items-center space-x-1">
              <Flame className="w-5 h-5 text-orange-400" />
              <span className="text-orange-400">{stats.currentStreak} day streak</span>
            </div>
          </div>

          {/* Progress to next level */}
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-400">Next Level</span>
              <span className="text-gray-400">{levelProgress.current}/{levelProgress.needed} XP</span>
            </div>
            <Progress value={levelProgress.percentage} className="h-2" />
          </div>

          {/* Quick stats */}
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-xl text-green-400">{stats.totalMealsLogged}</p>
              <p className="text-xs text-gray-400">Meals</p>
            </div>
            <div>
              <p className="text-xl text-blue-400">{stats.totalSymptomsTracked}</p>
              <p className="text-xs text-gray-400">Symptoms</p>
            </div>
            <div>
              <p className="text-xl text-yellow-400">{stats.achievements.length}</p>
              <p className="text-xs text-gray-400">Achievements</p>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Level and Experience */}
      <Card className="bg-gray-800 border-gray-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full flex items-center justify-center">
              <Crown className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-white">Level {stats.level}</h2>
              <p className="text-gray-400">{stats.experiencePoints} Experience Points</p>
            </div>
          </div>
          <div className="flex items-center space-x-2 text-orange-400">
            <Flame className="w-5 h-5" />
            <span>{stats.currentStreak}</span>
            <span className="text-sm text-gray-400">day streak</span>
          </div>
        </div>

        {/* Progress to next level */}
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-300">Progress to Level {stats.level + 1}</span>
            <span className="text-gray-300">{levelProgress.current}/{levelProgress.needed} XP</span>
          </div>
          <Progress value={levelProgress.percentage} className="h-3" />
          <p className="text-xs text-gray-400 mt-1">
            {levelProgress.needed - levelProgress.current} XP until next level
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-700 rounded-lg p-3">
            <div className="flex items-center space-x-2 mb-1">
              <Target className="w-4 h-4 text-green-400" />
              <span className="text-green-400">Meals Logged</span>
            </div>
            <p className="text-2xl text-white">{stats.totalMealsLogged}</p>
            <p className="text-xs text-gray-400">Longest streak: {stats.longestStreak} days</p>
          </div>

          <div className="bg-gray-700 rounded-lg p-3">
            <div className="flex items-center space-x-2 mb-1">
              <TrendingUp className="w-4 h-4 text-blue-400" />
              <span className="text-blue-400">Symptoms Tracked</span>
            </div>
            <p className="text-2xl text-white">{stats.totalSymptomsTracked}</p>
            <p className="text-xs text-gray-400">
              {stats.totalSymptomsTracked > 0 
                ? `${Math.round((stats.totalSymptomsTracked / stats.totalMealsLogged) * 100) || 0}% of meals` 
                : 'Start tracking symptoms'
              }
            </p>
          </div>
        </div>
      </Card>

      {/* Weekly Progress */}
      <Card className="bg-gray-800 border-gray-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white">This Week's Progress</h3>
          {weeklyProgress.isWeeklyGoalMet && (
            <Badge className="bg-green-600 hover:bg-green-700 text-white">
              <CheckCircle className="w-3 h-3 mr-1" />
              Goal Met!
            </Badge>
          )}
        </div>

        <div className="space-y-4">
          {/* Meals Progress */}
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-300">Meals This Week</span>
              <span className="text-gray-300">
                {stats.weeklyProgress.mealsThisWeek}/{stats.weeklyGoalMeals}
              </span>
            </div>
            <Progress value={weeklyProgress.mealsProgress} className="h-2" />
          </div>

          {/* Symptoms Progress */}
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-300">Symptoms Tracked</span>
              <span className="text-gray-300">
                {stats.weeklyProgress.symptomsThisWeek}/{stats.weeklyGoalSymptoms}
              </span>
            </div>
            <Progress value={weeklyProgress.symptomsProgress} className="h-2" />
          </div>
        </div>
      </Card>

      {/* Achievements */}
      <Card className="bg-gray-800 border-gray-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white">Achievements</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAchievements(true)}
            className="text-blue-400 hover:text-blue-300"
          >
            View All ({stats.achievements.length})
          </Button>
        </div>

        {stats.achievements.length > 0 ? (
          <div className="grid grid-cols-2 gap-3">
            {stats.achievements.slice(0, 4).map((achievement) => {
              const IconComponent = getIconComponent(achievement.icon);
              return (
                <div
                  key={achievement.id}
                  className={`p-3 rounded-lg border ${
                    achievement.isRare 
                      ? 'bg-gradient-to-r from-purple-900 to-pink-900 border-purple-500' 
                      : 'bg-gray-700 border-gray-600'
                  }`}
                >
                  <div className="flex items-center space-x-2 mb-1">
                    <IconComponent className={`w-4 h-4 ${
                      achievement.isRare ? 'text-yellow-300' : 'text-blue-400'
                    }`} />
                    {achievement.isRare && (
                      <Badge variant="secondary" className="text-xs px-1 py-0">Rare</Badge>
                    )}
                  </div>
                  <h4 className="text-white text-sm">{achievement.name}</h4>
                  <p className="text-xs text-gray-400">{achievement.description}</p>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8">
            <Trophy className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">Start logging meals to unlock achievements!</p>
          </div>
        )}
      </Card>

      {/* Doctor Report Section */}
      {showDoctorShare && (
        <Card className="bg-gray-800 border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white">Share with Healthcare Provider</h3>
            <Share2 className="w-5 h-5 text-blue-400" />
          </div>
          <p className="text-gray-400 text-sm mb-4">
            Generate a comprehensive progress report to share with your doctor or healthcare provider.
          </p>
          <Button
            onClick={handleGenerateDoctorReport}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Share2 className="w-4 h-4 mr-2" />
            Generate Progress Report
          </Button>
        </Card>
      )}

      {/* Achievements Dialog */}
      <Dialog open={showAchievements} onOpenChange={setShowAchievements}>
        <DialogContent className="bg-gray-800 border-gray-700 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Trophy className="w-5 h-5 text-yellow-400" />
              <span>All Achievements ({stats.achievements.length})</span>
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {stats.achievements.map((achievement) => {
              const IconComponent = getIconComponent(achievement.icon);
              return (
                <div
                  key={achievement.id}
                  className={`p-3 rounded-lg border ${
                    achievement.isRare 
                      ? 'bg-gradient-to-r from-purple-900 to-pink-900 border-purple-500' 
                      : 'bg-gray-700 border-gray-600'
                  }`}
                >
                  <div className="flex items-center space-x-2 mb-1">
                    <IconComponent className={`w-5 h-5 ${
                      achievement.isRare ? 'text-yellow-300' : 'text-blue-400'
                    }`} />
                    <h4 className="text-white">{achievement.name}</h4>
                    {achievement.isRare && (
                      <Badge variant="secondary" className="text-xs">Rare</Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-400">{achievement.description}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Unlocked: {new Date(achievement.unlockedAt).toLocaleDateString()}
                  </p>
                </div>
              );
            })}
            {stats.achievements.length === 0 && (
              <div className="text-center py-8">
                <Trophy className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">No achievements yet. Start logging to unlock them!</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Doctor Report Dialog */}
      <Dialog open={showDoctorReport} onOpenChange={setShowDoctorReport}>
        <DialogContent className="bg-gray-800 border-gray-700 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Share2 className="w-5 h-5 text-blue-400" />
              <span>Progress Report for Healthcare Provider</span>
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              value={doctorReport}
              readOnly
              className="bg-gray-700 border-gray-600 text-white min-h-96 font-mono text-sm"
            />
            <div className="flex space-x-2">
              <Button
                onClick={handleCopyReport}
                variant="outline"
                className="flex-1 border-gray-600 text-gray-300 hover:text-white hover:bg-gray-700"
              >
                <Copy className="w-4 h-4 mr-2" />
                Copy Report
              </Button>
              <Button
                onClick={handleShareReport}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Share Report
              </Button>
            </div>
            <p className="text-xs text-gray-400">
              This report contains your activity summary and can be shared with your healthcare provider to discuss your progress.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}