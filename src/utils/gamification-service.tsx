import { Trophy, Target, Calendar, Award, Zap, Star } from 'lucide-react';

export interface GamificationStats {
  totalMealsLogged: number;
  totalSymptomsTracked: number;
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: string | null;
  weeklyGoalMeals: number;
  weeklyGoalSymptoms: number;
  level: number;
  experiencePoints: number;
  achievements: Achievement[];
  weeklyProgress: {
    mealsThisWeek: number;
    symptomsThisWeek: number;
    weekStartDate: string;
  };
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt: string;
  category: 'meals' | 'symptoms' | 'streak' | 'consistency' | 'milestone';
  isRare?: boolean;
}

class GamificationService {
  private readonly STORAGE_KEY = 'gutwise-gamification-stats';
  private readonly ACHIEVEMENTS_KEY = 'gutwise-achievements';

  // Achievement definitions
  private readonly ACHIEVEMENT_DEFINITIONS = [
    // Meal logging achievements
    {
      id: 'first-meal',
      name: 'First Bite',
      description: 'Logged your first meal',
      icon: 'Trophy',
      category: 'meals' as const,
      requirement: (stats: GamificationStats) => stats.totalMealsLogged >= 1
    },
    {
      id: 'meal-explorer',
      name: 'Food Explorer',
      description: 'Logged 10 meals',
      icon: 'Target',
      category: 'meals' as const,
      requirement: (stats: GamificationStats) => stats.totalMealsLogged >= 10
    },
    {
      id: 'meal-master',
      name: 'Meal Master',
      description: 'Logged 50 meals',
      icon: 'Award',
      category: 'meals' as const,
      requirement: (stats: GamificationStats) => stats.totalMealsLogged >= 50,
      isRare: true
    },
    {
      id: 'meal-legend',
      name: 'Nutrition Legend',
      description: 'Logged 100 meals',
      icon: 'Star',
      category: 'meals' as const,
      requirement: (stats: GamificationStats) => stats.totalMealsLogged >= 100,
      isRare: true
    },

    // Symptom tracking achievements
    {
      id: 'first-symptom',
      name: 'Self-Awareness',
      description: 'Tracked your first symptom',
      icon: 'Trophy',
      category: 'symptoms' as const,
      requirement: (stats: GamificationStats) => stats.totalSymptomsTracked >= 1
    },
    {
      id: 'symptom-tracker',
      name: 'Health Monitor',
      description: 'Tracked 10 symptom episodes',
      icon: 'Target',
      category: 'symptoms' as const,
      requirement: (stats: GamificationStats) => stats.totalSymptomsTracked >= 10
    },
    {
      id: 'symptom-expert',
      name: 'Wellness Expert',
      description: 'Tracked 25 symptom episodes',
      icon: 'Award',
      category: 'symptoms' as const,
      requirement: (stats: GamificationStats) => stats.totalSymptomsTracked >= 25,
      isRare: true
    },

    // Streak achievements
    {
      id: 'streak-starter',
      name: 'Getting Started',
      description: 'Maintained a 3-day streak',
      icon: 'Zap',
      category: 'streak' as const,
      requirement: (stats: GamificationStats) => stats.longestStreak >= 3
    },
    {
      id: 'streak-keeper',
      name: 'Consistency Champion',
      description: 'Maintained a 7-day streak',
      icon: 'Calendar',
      category: 'streak' as const,
      requirement: (stats: GamificationStats) => stats.longestStreak >= 7
    },
    {
      id: 'streak-master',
      name: 'Dedication Master',
      description: 'Maintained a 30-day streak',
      icon: 'Star',
      category: 'streak' as const,
      requirement: (stats: GamificationStats) => stats.longestStreak >= 30,
      isRare: true
    },

    // Consistency achievements
    {
      id: 'weekly-goals',
      name: 'Goal Crusher',
      description: 'Met your weekly goals',
      icon: 'Target',
      category: 'consistency' as const,
      requirement: (stats: GamificationStats) => 
        stats.weeklyProgress.mealsThisWeek >= stats.weeklyGoalMeals && 
        stats.weeklyProgress.symptomsThisWeek >= stats.weeklyGoalSymptoms
    },

    // Milestone achievements
    {
      id: 'power-user',
      name: 'GutWise Pro',
      description: 'Logged 25+ meals and tracked 15+ symptoms',
      icon: 'Award',
      category: 'milestone' as const,
      requirement: (stats: GamificationStats) => 
        stats.totalMealsLogged >= 25 && stats.totalSymptomsTracked >= 15,
      isRare: true
    }
  ];

  getStats(): GamificationStats {
    // For demo purposes, always clear localStorage to use fresh mock data
    // This ensures the Level 5 user simulation always has the correct XP
    localStorage.removeItem(this.STORAGE_KEY);
    
    // No longer check for stored data, always use fresh mock data
    // try {
    //   const stored = localStorage.getItem(this.STORAGE_KEY);
    //   if (stored) {
    //     return JSON.parse(stored);
    //   }
    // } catch (error) {
    //   console.error('Error loading gamification stats:', error);
    // }

    // Simulate Level 5 user with realistic progress
    const mockLevel5Stats = {
      totalMealsLogged: 17, // 17 meals = 170 XP
      totalSymptomsTracked: 8, // 8 symptoms = 120 XP (total 290 XP = Level 5)
      currentStreak: 5, // Good current streak
      longestStreak: 12, // Has had a great streak before
      lastActivityDate: new Date().toISOString(), // Active today
      weeklyGoalMeals: 7,
      weeklyGoalSymptoms: 3,
      level: 5,
      experiencePoints: 290, // Level 5 = 250-299 XP, so 290 XP puts them at level 5 with 10 XP to go
      achievements: [
        {
          id: 'first-meal',
          name: 'First Bite',
          description: 'Logged your first meal',
          icon: 'Trophy',
          unlockedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(), // 20 days ago
          category: 'meals' as const
        },
        {
          id: 'first-symptom',
          name: 'Self-Awareness',
          description: 'Tracked your first symptom',
          icon: 'Trophy',
          unlockedAt: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000).toISOString(), // 18 days ago
          category: 'symptoms' as const
        },
        {
          id: 'meal-explorer',
          name: 'Food Explorer',
          description: 'Logged 10 meals',
          icon: 'Target',
          unlockedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days ago
          category: 'meals' as const
        },
        // Note: User has only tracked 8 symptoms, so this achievement wouldn't be unlocked yet
        {
          id: 'streak-starter',
          name: 'Getting Started',
          description: 'Maintained a 3-day streak',
          icon: 'Zap',
          unlockedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(), // 15 days ago
          category: 'streak' as const
        },
        {
          id: 'streak-keeper',
          name: 'Consistency Champion',
          description: 'Maintained a 7-day streak',
          icon: 'Calendar',
          unlockedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
          category: 'streak' as const
        },
        {
          id: 'weekly-goals',
          name: 'Goal Crusher',
          description: 'Met your weekly goals',
          icon: 'Target',
          unlockedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
          category: 'consistency' as const
        }
      ],
      weeklyProgress: {
        mealsThisWeek: 5, // Good progress this week
        symptomsThisWeek: 2, // Some symptoms tracked
        weekStartDate: this.getWeekStartDate()
      }
    };

    // Save the mock data so it persists
    this.saveStats(mockLevel5Stats);
    
    return mockLevel5Stats;
  }

  private saveStats(stats: GamificationStats): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(stats));
    } catch (error) {
      console.error('Error saving gamification stats:', error);
    }
  }

  private getWeekStartDate(): string {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Monday as start of week
    const weekStart = new Date(now.getTime() + diff * 24 * 60 * 60 * 1000);
    weekStart.setHours(0, 0, 0, 0);
    return weekStart.toISOString();
  }

  private isNewWeek(weekStartDate: string): boolean {
    const currentWeekStart = this.getWeekStartDate();
    return weekStartDate !== currentWeekStart;
  }

  private updateStreak(stats: GamificationStats): void {
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString();
    
    if (!stats.lastActivityDate) {
      stats.currentStreak = 1;
    } else {
      const lastActivityDate = new Date(stats.lastActivityDate).toDateString();
      
      if (lastActivityDate === today) {
        // Already logged today, no change to streak
        return;
      } else if (lastActivityDate === yesterday) {
        // Consecutive day, increment streak
        stats.currentStreak += 1;
      } else {
        // Streak broken, reset to 1
        stats.currentStreak = 1;
      }
    }

    // Update longest streak
    if (stats.currentStreak > stats.longestStreak) {
      stats.longestStreak = stats.currentStreak;
    }

    stats.lastActivityDate = new Date().toISOString();
  }

  private calculateLevel(experiencePoints: number): number {
    // Level progression: 100 XP for level 2, then +50 XP per level
    if (experiencePoints < 100) return 1;
    return Math.floor((experiencePoints - 100) / 50) + 2;
  }

  private checkAndUnlockAchievements(stats: GamificationStats): Achievement[] {
    const newAchievements: Achievement[] = [];
    const existingAchievementIds = new Set(stats.achievements.map(a => a.id));

    for (const achievementDef of this.ACHIEVEMENT_DEFINITIONS) {
      if (!existingAchievementIds.has(achievementDef.id) && achievementDef.requirement(stats)) {
        const newAchievement: Achievement = {
          id: achievementDef.id,
          name: achievementDef.name,
          description: achievementDef.description,
          icon: achievementDef.icon,
          unlockedAt: new Date().toISOString(),
          category: achievementDef.category,
          isRare: achievementDef.isRare
        };
        
        newAchievements.push(newAchievement);
        stats.achievements.push(newAchievement);
      }
    }

    return newAchievements;
  }

  logMeal(): { newAchievements: Achievement[]; levelUp: boolean } {
    const stats = this.getStats();
    
    // Reset weekly progress if new week
    if (this.isNewWeek(stats.weeklyProgress.weekStartDate)) {
      stats.weeklyProgress = {
        mealsThisWeek: 0,
        symptomsThisWeek: 0,
        weekStartDate: this.getWeekStartDate()
      };
    }

    const previousLevel = stats.level;
    
    // Update stats
    stats.totalMealsLogged += 1;
    stats.weeklyProgress.mealsThisWeek += 1;
    stats.experiencePoints += 10; // 10 XP per meal logged
    
    // Update streak
    this.updateStreak(stats);
    
    // Calculate new level
    stats.level = this.calculateLevel(stats.experiencePoints);
    const levelUp = stats.level > previousLevel;
    
    // Check for new achievements
    const newAchievements = this.checkAndUnlockAchievements(stats);
    
    this.saveStats(stats);
    
    return { newAchievements, levelUp };
  }

  trackSymptom(): { newAchievements: Achievement[]; levelUp: boolean } {
    const stats = this.getStats();
    
    // Reset weekly progress if new week
    if (this.isNewWeek(stats.weeklyProgress.weekStartDate)) {
      stats.weeklyProgress = {
        mealsThisWeek: 0,
        symptomsThisWeek: 0,
        weekStartDate: this.getWeekStartDate()
      };
    }

    const previousLevel = stats.level;
    
    // Update stats
    stats.totalSymptomsTracked += 1;
    stats.weeklyProgress.symptomsThisWeek += 1;
    stats.experiencePoints += 15; // 15 XP per symptom tracked (higher value as it's more important)
    
    // Update streak
    this.updateStreak(stats);
    
    // Calculate new level
    stats.level = this.calculateLevel(stats.experiencePoints);
    const levelUp = stats.level > previousLevel;
    
    // Check for new achievements
    const newAchievements = this.checkAndUnlockAchievements(stats);
    
    this.saveStats(stats);
    
    return { newAchievements, levelUp };
  }

  getProgressToNextLevel(stats: GamificationStats): { current: number; needed: number; percentage: number } {
    const currentLevel = stats.level;
    let xpForCurrentLevel = 0;
    let xpForNextLevel = 100;

    if (currentLevel > 1) {
      xpForCurrentLevel = 100 + (currentLevel - 2) * 50;
      xpForNextLevel = 100 + (currentLevel - 1) * 50;
    }

    const current = stats.experiencePoints - xpForCurrentLevel;
    const needed = xpForNextLevel - xpForCurrentLevel;
    const percentage = Math.min(100, (current / needed) * 100);

    return { current, needed, percentage };
  }

  getWeeklyProgress(stats: GamificationStats): {
    mealsProgress: number;
    symptomsProgress: number;
    isWeeklyGoalMet: boolean;
  } {
    const mealsProgress = Math.min(100, (stats.weeklyProgress.mealsThisWeek / stats.weeklyGoalMeals) * 100);
    const symptomsProgress = Math.min(100, (stats.weeklyProgress.symptomsThisWeek / stats.weeklyGoalSymptoms) * 100);
    const isWeeklyGoalMet = stats.weeklyProgress.mealsThisWeek >= stats.weeklyGoalMeals && 
                           stats.weeklyProgress.symptomsThisWeek >= stats.weeklyGoalSymptoms;

    return { mealsProgress, symptomsProgress, isWeeklyGoalMet };
  }

  generateDoctorReport(stats: GamificationStats): string {
    const today = new Date().toLocaleDateString();
    
    return `
GutWise Digestive Health Report
Generated: ${today}

DIGESTIVE HEALTH SUMMARY
━━━━━━━━━━━━━━━━━━━━━━━━━

🎯 SAFE FOOD RECOMMENDATIONS:
• Mediterranean dishes (Grilled Salmon Bowl, Greek Salad) - consistently well-tolerated
• Asian cuisine with modifications (Sushi Bowl without spicy mayo, Chicken Tikka without onions)
• Simple preparations (Grilled Chicken Salad, Vegetable Stir Fry)
• Quinoa-based meals showing excellent digestive tolerance

⚠️ IDENTIFIED FOOD TRIGGERS:
• Fried foods (Fish and Chips) - severe symptoms: stomach pain (4/5), bloating, nausea
• Spicy dishes (Thai Curry, Pad Thai) - consistent bloating and discomfort
• Gluten-containing foods (Pizza, Caesar Salad) - fatigue and bloating patterns
• High-fat dairy products - mild but consistent bloating episodes

📊 SYMPTOM PATTERNS:
• Primary concerns: Bloating (most frequent, avg severity 2.8/5)
• Secondary symptoms: Stomach pain, nausea, fatigue
• Symptom occurrence: 33% of meals (5/15 recent meals)
• Recovery time: Symptoms typically resolve within 2-4 hours

🍽️ DIETARY TRENDS:
• Restaurant variety: 10+ different establishments tried
• Cuisine preferences: Mediterranean, Asian, American casual dining
• Modification awareness: Patient actively requests customizations (no onions, no spicy mayo)
• Safe meal success rate: 67% of meals well-tolerated

📈 DIGESTIVE HEALTH TRAJECTORY:
• Recent trend: Stable management with occasional flare-ups
• Trigger avoidance: Learning to identify problematic foods
• Dietary diversity: Maintaining varied diet while managing symptoms
• Self-management: Good awareness of food-symptom connections

🔍 CLINICAL OBSERVATIONS:
• Possible gluten sensitivity - multiple wheat-based meals triggered symptoms
• Potential fat malabsorption - fried and high-fat foods consistently problematic
• FODMAP sensitivity patterns - onions and certain vegetables show reactions
• Spice intolerance - consistent reactions to spicy cuisine

RECOMMENDATIONS FOR HEALTHCARE PROVIDER:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. Consider food intolerance testing (gluten, lactose, FODMAP)
2. Evaluate fat digestion - possible lipase insufficiency
3. Discuss elimination diet for confirmed trigger identification
4. Monitor B12/folate levels if gluten sensitivity confirmed
5. Consider gastroenterology referral for comprehensive evaluation

PATIENT EDUCATION OPPORTUNITIES:
• Continue current food modification strategies
• Expand knowledge of safe cuisine options
• Develop meal planning around identified safe foods
• Consider keeping detailed food diary during flare-ups

Data reflects ${stats.totalMealsLogged} meal entries and ${stats.totalSymptomsTracked} symptom episodes over the past 3 weeks.

Generated by GutWise AI-Powered Digestive Health Platform
    `.trim();
  }

  private getEngagementLevel(stats: GamificationStats): string {
    const totalActivity = stats.totalMealsLogged + stats.totalSymptomsTracked;
    const weeklyActivity = stats.weeklyProgress.mealsThisWeek + stats.weeklyProgress.symptomsThisWeek;
    
    if (stats.currentStreak >= 14 && totalActivity >= 30) return 'Very High 🔥';
    if (stats.currentStreak >= 7 && totalActivity >= 15) return 'High ⭐';
    if (stats.currentStreak >= 3 && totalActivity >= 7) return 'Moderate 📈';
    if (totalActivity >= 3) return 'Getting Started 🌱';
    return 'New User 👋';
  }

  updateWeeklyGoals(mealsGoal: number, symptomsGoal: number): void {
    const stats = this.getStats();
    stats.weeklyGoalMeals = mealsGoal;
    stats.weeklyGoalSymptoms = symptomsGoal;
    this.saveStats(stats);
  }

  resetStats(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    localStorage.removeItem(this.ACHIEVEMENTS_KEY);
  }
}

export const gamificationService = new GamificationService();