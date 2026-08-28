import TerminalOverlay from "@/components/TerminalOverlay";
import { Button } from "@/components/ui/button";
import UserPrograms from "@/components/UserPrograms";
import HowItWorks from "@/components/HowItWorks";
import { ArrowRightIcon } from "lucide-react";
import Link from "next/link";

const HomePage = () => {
  return (
    <div className="flex flex-col min-h-screen text-foreground overflow-hidden">
      <section className="relative z-10 py-24 flex-grow">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative">
            {/* CORNER DECARATION */}
            <div className="absolute -top-10 left-0 w-40 h-40 border-l-2 border-t-2" />

            {/* LEFT SIDE CONTENT */}
            <div className="lg:col-span-7 space-y-8 relative animate-fade-slide-up">
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight">
                <div>
                  <span className="text-foreground">Transform</span>
                </div>
                <div>
                  <span className="text-primary">Your Body</span>
                </div>
                <div className="pt-2">
                  <span className="text-foreground">With Advanced</span>
                </div>
                <div className="pt-2">
                  <span className="text-foreground">AI</span>
                  <span className="text-primary"> Technology</span>
                </div>
              </h1>

              {/* SEPERATOR LINE */}
              <div className="h-px w-full bg-gradient-to-r from-primary via-secondary to-primary opacity-50"></div>

              <p className="text-xl text-muted-foreground w-2/3">
                Talk to our AI assistant and get personalized diet plans and workout routines
                designed just for you
              </p>

              {/* STATS */}
              <div className="flex items-center gap-10 py-6 font-mono">
                <div className="flex flex-col">
                  <div className="text-2xl text-primary">500+</div>
                  <div className="text-xs uppercase tracking-wider">ACTIVE USERS</div>
                </div>
                <div className="h-12 w-px bg-gradient-to-b from-transparent via-border to-transparent"></div>
                <div className="flex flex-col">
                  <div className="text-2xl text-primary">3min</div>
                  <div className="text-xs uppercase tracking-wider">GENERATION</div>
                </div>
                <div className="h-12 w-px bg-gradient-to-b from-transparent via-border to-transparent"></div>
                <div className="flex flex-col">
                  <div className="text-2xl text-primary">100%</div>
                  <div className="text-xs uppercase tracking-wider">PERSONALIZED</div>
                </div>
              </div>

              {/* BUTTON */}
              <div className="flex flex-col sm:flex-row gap-4 pt-6">
                <Button
                  size="lg"
                  asChild
                  className="overflow-hidden bg-primary text-primary-foreground px-8 py-6 text-lg font-medium"
                >
                  <Link href={"/generate-program"} className="flex items-center font-mono">
                    Build Your Program
                    <ArrowRightIcon className="ml-2 size-5" />
                  </Link>
                </Button>
              </div>
            </div>

            {/* RIGHT SIDE CONTENT */}
            <div className="lg:col-span-5 relative animate-fade-slide-up animate-delay-200">
              {/* CORNER PIECES */}
              <div className="absolute -inset-4 pointer-events-none">
                <div className="absolute top-0 left-0 w-16 h-16 border-l-2 border-t-2 border-border" />
                <div className="absolute top-0 right-0 w-16 h-16 border-r-2 border-t-2 border-border" />
                <div className="absolute bottom-0 left-0 w-16 h-16 border-l-2 border-b-2 border-border" />
                <div className="absolute bottom-0 right-0 w-16 h-16 border-r-2 border-b-2 border-border" />
              </div>

              {/* IMAGE CONTANINER */}
              <div className="relative aspect-square max-w-lg mx-auto">
                <div className="relative overflow-hidden rounded-lg bg-cyber-black">
                  <img
                    src="/hero-ai3.png"
                    alt="AI Fitness Coach"
                    className="size-full object-cover object-center"
                  />

                  {/* SCAN LINE */}
                  <div className="absolute inset-0 bg-[linear-gradient(transparent_0%,transparent_calc(50%-1px),var(--cyber-glow-primary)_50%,transparent_calc(50%+1px),transparent_100%)] bg-[length:100%_8px] animate-scanline pointer-events-none" />

                  {/* DECORATIONS ON TOP THE IMAGE */}
                  <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-1/3 left-1/3 w-1/3 h-1/3 border border-primary/40 rounded-full" />

                    {/* Targeting lines */}
                    <div className="absolute top-1/2 left-0 w-1/4 h-px bg-primary/50" />
                    <div className="absolute top-1/2 right-0 w-1/4 h-px bg-primary/50" />
                    <div className="absolute top-0 left-1/2 h-1/4 w-px bg-primary/50" />
                    <div className="absolute bottom-0 left-1/2 h-1/4 w-px bg-primary/50" />
                  </div>

                  <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
                </div>

                {/* TERMINAL OVERLAY */}
                <TerminalOverlay />
              </div>
            </div>
          </div>
        </div>
      </section>

      <HowItWorks />

      {/* SUCCESS STORIES SECTION */}
      <section className="py-20 relative border-t border-border/50">
        <div className="container mx-auto px-4 max-w-6xl">
          {/* Section Header */}
          <div className="bg-card/90 backdrop-blur-sm border border-border rounded-lg overflow-hidden mb-16 reveal-up">
            <div className="flex items-center justify-between px-5 py-3 border-b border-border bg-background/70">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse"></div>
                <span className="text-sm text-primary font-medium">Motivation Zone</span>
              </div>
              <div className="text-sm text-muted-foreground">User Results</div>
            </div>
            
            <div className="p-8 text-center">
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                <span className="text-foreground">Real </span>
                <span className="text-primary">Transformations</span>
              </h2>
              <p className="text-lg text-muted-foreground max-w-xl mx-auto">
                Discover the actual physical results achieved by users following personalized AI training and nutrition plans.
              </p>
            </div>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {/* Card 1: Male */}
            <div className="group relative bg-card/60 backdrop-blur-sm border border-border rounded-xl overflow-hidden shadow-lg hover:border-primary/50 transition-all duration-300 reveal-up">
              {/* Corner indicators */}
              <div className="absolute top-2 left-2 text-[10px] font-mono text-primary opacity-60">&gt; CASE_01</div>
              <div className="absolute top-2 right-2 text-[10px] font-mono text-muted-foreground uppercase">12 WEEKS</div>
              
              <div className="aspect-square relative w-full overflow-hidden border-b border-border bg-black/40">
                <img
                  src="/male_transform.jpg"
                  alt="Male Fitness Transformation"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent pointer-events-none" />
              </div>
              
              <div className="p-6 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold font-mono">
                    Marcus<span className="text-primary">.fit</span>
                  </h3>
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-primary/20 text-primary border border-primary/30">
                    MUSCLE GAIN
                  </span>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  &quot;I was always struggling to structure my workouts. The AI split combined Bench, OHP, and Squats with precise diet targets. I lost 12kg of body fat and built solid athletic muscle.&quot;
                </p>
                <div className="pt-2 flex justify-between items-center text-xs font-mono text-muted-foreground border-t border-border/40">
                  <span>Weight: 82kg &gt; 74kg</span>
                  <span className="text-primary font-bold">Body Fat: -9%</span>
                </div>
              </div>
            </div>

            {/* Card 2: Female */}
            <div className="group relative bg-card/60 backdrop-blur-sm border border-border rounded-xl overflow-hidden shadow-lg hover:border-primary/50 transition-all duration-300 reveal-up">
              {/* Corner indicators */}
              <div className="absolute top-2 left-2 text-[10px] font-mono text-primary opacity-60">&gt; CASE_02</div>
              <div className="absolute top-2 right-2 text-[10px] font-mono text-muted-foreground uppercase">10 WEEKS</div>
              
              <div className="aspect-square relative w-full overflow-hidden border-b border-border bg-black/40">
                <img
                  src="/female_transform.jpg"
                  alt="Female Fitness Transformation"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent pointer-events-none" />
              </div>
              
              <div className="p-6 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold font-mono">
                    Sarah<span className="text-primary">.fit</span>
                  </h3>
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-secondary/20 text-secondary border border-secondary/30">
                    TONE & HIIT
                  </span>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  &quot;The equipment-free Darebee circuits let me work out in my apartment. The diet suggestions kept me full while maintaining a calorie deficit. My core strength has never been better!&quot;
                </p>
                <div className="pt-2 flex justify-between items-center text-xs font-mono text-muted-foreground border-t border-border/40">
                  <span>Goal: Conditioning</span>
                  <span className="text-primary font-bold">Core Strength: +40%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <UserPrograms />
    </div>
  );
};
export default HomePage;
