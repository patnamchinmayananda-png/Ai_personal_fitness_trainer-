import { Mic, Camera, Sparkles, TrendingUp } from "lucide-react";
import CornerElements from "./CornerElements";

const STEPS = [
  {
    number: "01",
    title: "Voice consultation",
    subtitle: "SPEAK TO YOUR COACH",
    description: "Start by initiating a voice call with our advanced AI trainer. Explain your specific fitness goals, injuries, dietary restrictions, and how many days a week you want to exercise.",
    icon: Mic,
  },
  {
    number: "02",
    title: "Form calibration",
    subtitle: "AI POSTURE ANALYSIS",
    description: "Activate your camera for real-time exercise analysis. Our AI vision assistant tracks your movements, counts reps, and gives instant corrective guidance to keep you safe.",
    icon: Camera,
  },
  {
    number: "03",
    title: "Dynamic build",
    subtitle: "DEPLOY YOUR RECIPE",
    description: "The Gemini AI engine calculates your daily caloric targets and immediately structures a detailed, progressive workout routine and meal schedule tailored specifically to you.",
    icon: Sparkles,
  },
  {
    number: "04",
    title: "Track your progress",
    subtitle: "BUILD INTENSITY",
    description: "Review details on your personalized dashboard. Easily access your routines, check off daily targets, and watch your strength parameters grow over time.",
    icon: TrendingUp,
  },
];

const HowItWorks = () => {
  return (
    <section className="w-full py-20 relative overflow-hidden">
      <div className="container mx-auto max-w-6xl px-4 relative z-10">
        {/* SECTION HEADER */}
        <div className="text-center mb-16 reveal-up">
          <div className="flex items-center justify-center gap-2 mb-3">
            <span className="h-px w-8 bg-primary"></span>
            <span className="text-sm font-mono text-primary uppercase tracking-widest">
              Operation Guide
            </span>
            <span className="h-px w-8 bg-primary"></span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight font-mono">
            HOW <span className="text-primary">IT WORKS</span>
          </h2>
          <p className="text-muted-foreground mt-4 max-w-lg mx-auto text-base">
            Understand the complete process from your first consultation to executing your plans.
          </p>
        </div>

        {/* STEPS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          {STEPS.map((step) => {
            const IconComponent = step.icon;
            return (
              <div
                key={step.number}
                className="relative bg-card/60 backdrop-blur-sm border border-border p-6 rounded-lg group hover:border-primary/50 transition-all duration-300 reveal-up flex flex-col justify-between"
              >
                {/* CYBER CORNER ELEMENTS */}
                <CornerElements />

                <div>
                  {/* STEP NUMBER & ICON ROW */}
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-2xl font-black font-mono text-primary/40 group-hover:text-primary transition-colors">
                      {step.number}
                    </span>
                    <div className="p-3 bg-primary/5 border border-primary/10 rounded-lg text-primary group-hover:bg-primary/20 group-hover:border-primary/30 transition-all duration-300 shadow-[0_0_15px_rgba(229,27,36,0.05)] group-hover:shadow-[0_0_20px_rgba(229,27,36,0.15)]">
                      <IconComponent className="w-6 h-6" />
                    </div>
                  </div>

                  {/* STEP DETAILS */}
                  <span className="text-[10px] font-mono text-primary/80 uppercase tracking-widest">
                    {step.subtitle}
                  </span>
                  <h3 className="text-lg font-bold text-foreground mt-1 mb-3 group-hover:text-primary transition-colors font-mono">
                    {step.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {step.description}
                  </p>
                </div>

                {/* Cyber accent line on bottom */}
                <div className="w-full h-[2px] bg-gradient-to-r from-transparent via-primary/20 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-500 mt-6"></div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
