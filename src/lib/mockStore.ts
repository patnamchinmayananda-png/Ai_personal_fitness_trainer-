export interface Routine {
  name: string;
  sets?: number;
  reps?: number;
  duration?: string;
  description?: string;
}

export interface ExerciseDay {
  day: string;
  routines: Routine[];
}

export interface WorkoutPlan {
  schedule: string[];
  exercises: ExerciseDay[];
}

export interface Meal {
  name: string;
  foods: string[];
}

export interface DietPlan {
  dailyCalories: number;
  meals: Meal[];
}

export interface Plan {
  _id: string;
  userId: string;
  name: string;
  workoutPlan: WorkoutPlan;
  dietPlan: DietPlan;
  isActive: boolean;
}

const DEFAULT_PLANS: Plan[] = [
  {
    _id: "plan_default_1",
    userId: "user_mock123",
    name: "Muscle Gain Plan - 2026-08-25",
    isActive: true,
    workoutPlan: {
      schedule: ["Monday", "Wednesday", "Friday"],
      exercises: [
        {
          day: "Monday",
          routines: [
            { name: "Barbell Bench Press", sets: 4, reps: 8, description: "Flat bench barbell chest press. Keep shoulder blades retracted." },
            { name: "Incline Dumbbell Flyes", sets: 3, reps: 10, description: "Incline bench dumbbell chest flyes to stretch the upper chest muscles." },
            { name: "Overhead Press (OHP)", sets: 4, reps: 8, description: "Standing barbell overhead shoulder press. Keep core tight." },
            { name: "Tricep Pushdowns", sets: 3, reps: 12, description: "Cable pushdowns using a rope attachment for tricep isolation." },
          ]
        },
        {
          day: "Wednesday",
          routines: [
            { name: "Deadlift", sets: 4, reps: 5, description: "Conventional barbell deadlift. Focus on driving through hips." },
            { name: "Pull-Ups / Lat Pulldown", sets: 3, reps: 8, description: "Wide-grip pull-ups or machine lat pulldowns for back width." },
            { name: "Barbell Row", sets: 3, reps: 10, description: "Bent-over barbell back rows. Pull bar towards lower stomach." },
            { name: "Barbell Bicep Curls", sets: 3, reps: 12, description: "Standing EZ-bar or barbell bicep curls." },
          ]
        },
        {
          day: "Friday",
          routines: [
            { name: "Barbell Squat", sets: 4, reps: 8, description: "Back squats. Keep chest upright and squat to parallel." },
            { name: "Romanian Deadlift", sets: 3, reps: 10, description: "RDL focusing on hamstring and glute stretch. Keep back straight." },
            { name: "Leg Press", sets: 3, reps: 12, description: "Sled leg press for additional quad/glute development." },
            { name: "Standing Calf Raises", sets: 4, reps: 15, description: "Calf isolation reps with a pause at peak contraction." },
          ]
        }
      ]
    },
    dietPlan: {
      dailyCalories: 2800,
      meals: [
        { name: "Breakfast", foods: ["4 Scrambled Eggs", "3 slices of Whole Wheat Toast", "1 Banana", "1 cup Orange Juice"] },
        { name: "Lunch", foods: ["200g Grilled Chicken Breast", "150g Cooked Brown Rice", "Steamed Broccoli", "1 tbsp Olive Oil"] },
        { name: "Afternoon Snack", foods: ["Whey Protein Shake with Oats", "Handful of Almonds"] },
        { name: "Dinner", foods: ["200g Baked Salmon", "200g Roasted Sweet Potato", "Asparagus spears roasted in olive oil"] },
      ]
    }
  }
];

export function getMockPlans(userId: string): Plan[] {
  if (typeof window === "undefined") return DEFAULT_PLANS;
  
  const saved = localStorage.getItem(`mock_plans_${userId}`);
  if (!saved) {
    localStorage.setItem(`mock_plans_${userId}`, JSON.stringify(DEFAULT_PLANS));
    return DEFAULT_PLANS;
  }
  
  try {
    return JSON.parse(saved);
  } catch {
    return DEFAULT_PLANS;
  }
}

export function saveMockPlan(userId: string, plan: Omit<Plan, "_id">): Plan {
  const plans = getMockPlans(userId);
  
  // Set others to inactive if this one is active
  if (plan.isActive) {
    plans.forEach(p => p.isActive = false);
  }
  
  const newPlan: Plan = {
    ...plan,
    _id: `plan_${Date.now()}`
  };
  
  plans.push(newPlan);
  
  if (typeof window !== "undefined") {
    localStorage.setItem(`mock_plans_${userId}`, JSON.stringify(plans));
  }
  
  return newPlan;
}

export function selectActiveMockPlan(userId: string, planId: string): Plan[] {
  const plans = getMockPlans(userId);
  plans.forEach(p => {
    p.isActive = p._id === planId;
  });
  
  if (typeof window !== "undefined") {
    localStorage.setItem(`mock_plans_${userId}`, JSON.stringify(plans));
  }
  
  return plans;
}

export function generateAndSavePlan(
  userId: string, 
  fitnessGoal: string, 
  workoutDays: number, 
  fitnessLevel: string
): Plan {
  // Generate customized content dynamically based on goal
  let schedule = ["Monday", "Wednesday", "Friday"];
  if (workoutDays === 1) {
    schedule = ["Wednesday"];
  } else if (workoutDays === 2) {
    schedule = ["Tuesday", "Thursday"];
  } else if (workoutDays === 4) {
    schedule = ["Monday", "Tuesday", "Thursday", "Friday"];
  } else if (workoutDays === 5) {
    schedule = ["Monday", "Tuesday", "Wednesday", "Friday", "Saturday"];
  } else if (workoutDays === 6) {
    schedule = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  } else if (workoutDays === 7) {
    schedule = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  }
  
  const exercises: ExerciseDay[] = schedule.map(day => {
    let routines: Routine[] = [];
    if (fitnessGoal.toLowerCase().includes("loss") || fitnessGoal.toLowerCase().includes("shred")) {
      routines = [
        { name: "HIIT Treadmill Sprints", sets: 1, reps: 1, duration: "15 min", description: "30s sprint, 30s walk intervals." },
        { name: "Dumbbell Goblet Squats", sets: 3, reps: 15, description: "Keep high reps for calorie burning." },
        { name: "Kettlebell Swings", sets: 3, reps: 20, description: "Explosive swings. Hinge at hips." },
        { name: "Plank Hold", sets: 3, reps: 1, duration: "60 seconds", description: "Keep core tight and spine neutral." },
      ];
    } else if (fitnessGoal.toLowerCase().includes("gain") || fitnessGoal.toLowerCase().includes("build") || fitnessGoal.toLowerCase().includes("muscle")) {
      routines = [
        { name: "Compound Bench Press", sets: 4, reps: 8, description: "Hypertrophy focus." },
        { name: "Seated Cable Rows", sets: 4, reps: 10, description: "Focus on squeeze at the peak." },
        { name: "Overhead Shoulder Press", sets: 3, reps: 8, description: "Core braced throughout." },
        { name: "Bicep Curl / Tricep Extension Superset", sets: 3, reps: 12, description: "High pump arm finisher." },
      ];
    } else {
      routines = [
        { name: "Bodyweight Lunges", sets: 3, reps: 12, description: "Step back lunges for knee safety." },
        { name: "Push-Ups", sets: 3, reps: 10, description: "Standard pushups. Elevate hands if too difficult." },
        { name: "Dumbbell Single-Arm Row", sets: 3, reps: 12, description: "Support body on a bench." },
        { name: "Bicycle Crunches", sets: 3, reps: 20, description: "Slow and controlled core twists." },
      ];
    }
    
    return { day, routines };
  });

  const dailyCalories = fitnessGoal.toLowerCase().includes("loss") ? 1600 : 2500;
  
  const meals: Meal[] = [
    { name: "Breakfast", foods: ["Protein Smoothie (Whey, Almond Milk, Oats, Blueberries)"] },
    { name: "Lunch", foods: ["Large Chicken breast salad with mixed greens, cucumbers, olive oil"] },
    { name: "Dinner", foods: ["Baked salmon fillet with roasted broccoli and half avocado"] }
  ];
  
  return saveMockPlan(userId, {
    userId,
    name: `${fitnessGoal} Plan (${fitnessLevel}) - Generated by AI`,
    isActive: true,
    workoutPlan: { schedule, exercises },
    dietPlan: { dailyCalories, meals }
  });
}
