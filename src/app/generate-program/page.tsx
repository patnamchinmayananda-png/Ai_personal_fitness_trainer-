"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import LiveFormCheck from "@/components/LiveFormCheck";
import CornerElements from "@/components/CornerElements";
import { useUser } from "@/hooks/useMockableClerk";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { generateAndSavePlan } from "@/lib/mockStore";

const IS_MOCK_MODE = typeof process !== "undefined" && 
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.startsWith("pk_test_dGVzdC1jbGVyay1kdW1teS");

const GenerateProgramPage = () => {
  const [connecting, setConnecting] = useState(false);
  const [messages, setMessages] = useState<any[]>([
    {
      role: "assistant",
      content: "Hello! I'm Power House, your AI Personal Fitness Trainer. Let's design your customized workout and diet plan. What is your primary fitness goal?"
    }
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [callEnded, setCallEnded] = useState(false);
  const [micError, setMicError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"chat" | "form">("chat");
  const [formData, setFormData] = useState({
    age: "25",
    height: "175cm",
    weight: "70kg",
    fitnessGoal: "Muscle Gain",
    fitnessLevel: "Intermediate",
    workoutDays: 3,
    injuries: "None",
    dietaryRestrictions: "None",
  });

  const { user } = useUser();
  const router = useRouter();

  const messageContainerRef = useRef<HTMLDivElement>(null);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMicError(null);

    if (IS_MOCK_MODE) {
      setConnecting(true);
      setTimeout(() => {
        generateAndSavePlan(
          user?.id || "user_mock123",
          formData.fitnessGoal,
          formData.workoutDays,
          formData.fitnessLevel
        );
        setConnecting(false);
        setCallEnded(true);
      }, 1500);
    } else {
      try {
        setConnecting(true);
        const res = await fetch(`${process.env.NEXT_PUBLIC_CONVEX_URL}/vapi/generate-program`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            user_id: user?.id,
            age: formData.age,
            height: formData.height,
            weight: formData.weight,
            injuries: formData.injuries,
            workout_days: String(formData.workoutDays),
            fitness_goal: formData.fitnessGoal,
            fitness_level: formData.fitnessLevel,
            dietary_restrictions: formData.dietaryRestrictions,
          }),
        });

        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }

        const data = await res.json();
        if (data.success) {
          setCallEnded(true);
        } else {
          setMicError(`Generation failed: ${data.error || "Unknown error"}`);
        }
      } catch (err: any) {
        console.error("Error generating program:", err);
        setMicError(`Error: ${err.message || "Failed to contact generator backend."}`);
      } finally {
        setConnecting(false);
      }
    }
  };

  // auto-scroll messages
  useEffect(() => {
    if (messageContainerRef.current) {
      messageContainerRef.current.scrollTop = messageContainerRef.current.scrollHeight;
    }
  }, [messages, connecting]);

  // navigate user to profile page after program generation completes
  useEffect(() => {
    if (callEnded) {
      const redirectTimer = setTimeout(() => {
        router.push("/profile");
      }, 2000);

      return () => clearTimeout(redirectTimer);
    }
  }, [callEnded, router]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || connecting || callEnded) return;

    const userMsg = { role: "user", content: inputMessage.trim() };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInputMessage("");
    setConnecting(true);
    setMicError(null);

    if (IS_MOCK_MODE) {
      setTimeout(() => {
        const replies = [
          "Got it! Let's aim for that. How many days per week can you train, and what is your fitness level (beginner, intermediate, or advanced)?",
          "Awesome! A 3-day intermediate split. Do you have any injuries, limitations, or dietary restrictions I should know about?",
          "Got it! I have all the details. Generating your personalized program now..."
        ];
        
        const assistantReplyCount = messages.filter(m => m.role === "assistant").length;
        const replyText = replies[Math.min(assistantReplyCount - 1, replies.length - 1)];
        
        const assistantMsg = { role: "assistant", content: replyText };
        setMessages((prev) => [...prev, assistantMsg]);
        setConnecting(false);

        if (replyText.includes("Generating your personalized program")) {
          setTimeout(() => {
            generateAndSavePlan(
              user?.id || "user_mock123",
              "Muscle Gain",
              3,
              "Intermediate"
            );
            setCallEnded(true);
          }, 1500);
        }
      }, 1000);
    } else {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_CONVEX_URL}/chat`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: updatedMessages }),
        });
        
        if (!res.ok) throw new Error("Failed to contact chat server");
        
        const data = await res.json();
        const assistantMsg = { role: "assistant", content: data.reply };
        setMessages((prev) => [...prev, assistantMsg]);
        setConnecting(false);

        if (data.reply.toLowerCase().includes("generating your personalized program") || data.reply.toLowerCase().includes("generating your program")) {
          setConnecting(true);
          const genRes = await fetch(`${process.env.NEXT_PUBLIC_CONVEX_URL}/chat/generate-program`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              user_id: user?.id,
              messages: [...updatedMessages, assistantMsg]
            }),
          });
          const genData = await genRes.json();
          if (genData.success) {
            setCallEnded(true);
          } else {
            setMicError("Failed to generate plan: " + genData.error);
          }
        }
      } catch (err: any) {
        console.error("Chat error:", err);
        setMicError("Chat error: " + err.message);
        setConnecting(false);
      }
    }
  };

  return (
    <div className="flex flex-col min-h-screen text-foreground overflow-hidden  pb-6 pt-24">
      <div className="container mx-auto px-4 h-full max-w-5xl">
        {/* Title */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold font-mono">
            <span>Generate Your </span>
            <span className="text-primary uppercase">Fitness Program</span>
          </h1>
          <p className="text-muted-foreground mt-2">
            {activeTab === "chat"
              ? "Have a chat conversation with our AI assistant to design your personalized plan"
              : "Fill in the form questionnaire below to generate your custom program instantly for free"}
          </p>
        </div>

        {/* TAB SWITCHER */}
        <div className="flex justify-center mb-8">
          <div className="flex bg-card/60 backdrop-blur-sm border border-border p-1 rounded-full">
            <button
              onClick={() => {
                setActiveTab("chat");
                setMicError(null);
              }}
              className={`px-6 py-2 rounded-full text-xs font-mono transition-all duration-300 ${
                activeTab === "chat"
                  ? "bg-primary text-white shadow-lg"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              AI CHAT COACH
            </button>
            <button
              onClick={() => {
                setActiveTab("form");
                setMicError(null);
              }}
              className={`px-6 py-2 rounded-full text-xs font-mono transition-all duration-300 ${
                activeTab === "form"
                  ? "bg-primary text-white shadow-lg"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              MANUAL FORM
            </button>
          </div>
        </div>

        {micError && (
          <div className="max-w-2xl mx-auto mb-6 p-4 bg-destructive/10 border border-destructive/20 text-destructive rounded-lg text-sm text-center font-mono animate-fadeIn">
            {micError}
          </div>
        )}

        {activeTab === "chat" ? (
          <>
            {/* CHAT INTERFACE */}
            <Card className="bg-card/60 backdrop-blur-sm border border-border rounded-lg p-6 max-w-2xl mx-auto relative overflow-hidden flex flex-col justify-between h-[450px]">
              <CornerElements />

              {/* CHAT MESSAGES PANEL */}
              <div 
                ref={messageContainerRef}
                className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2 scrollbar-thin scroll-smooth"
              >
                {messages.map((msg, index) => (
                  <div 
                    key={index} 
                    className={`flex ${msg.role === "assistant" ? "justify-start" : "justify-end"} animate-fadeIn`}
                  >
                    <div className="flex gap-3 max-w-[85%]">
                      {msg.role === "assistant" && (
                        <div className="size-8 rounded-full border border-border overflow-hidden shrink-0 bg-primary/10 flex items-center justify-center">
                          <img src="/ai-avatar.png" alt="AI" className="size-full object-cover" />
                        </div>
                      )}
                      <div className={`p-3 rounded-lg text-sm leading-relaxed ${
                        msg.role === "assistant"
                          ? "bg-card border border-border text-foreground font-sans"
                          : "bg-primary text-white font-sans"
                      }`}>
                        <p>{msg.content}</p>
                      </div>
                    </div>
                  </div>
                ))}

                {connecting && (
                  <div className="flex justify-start animate-pulse">
                    <div className="flex gap-3 max-w-[85%]">
                      <div className="size-8 rounded-full border border-border overflow-hidden shrink-0 bg-primary/10 flex items-center justify-center">
                        <img src="/ai-avatar.png" alt="AI" className="size-full object-cover" />
                      </div>
                      <div className="p-3 bg-card border border-border rounded-lg text-sm flex gap-1 items-center">
                        <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0s' }}></span>
                        <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                        <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
                      </div>
                    </div>
                  </div>
                )}

                {callEnded && (
                  <div className="flex justify-center my-4">
                    <div className="px-4 py-2 bg-green-500/10 border border-green-500/20 text-green-500 text-xs rounded-full font-mono">
                      Plan generated successfully! Redirecting to profile...
                    </div>
                  </div>
                )}
              </div>

              {/* CHAT INPUT FIELD */}
              <form onSubmit={handleSendMessage} className="flex gap-3 border-t border-border pt-4">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  disabled={connecting || callEnded}
                  placeholder={callEnded ? "Redirecting to your profile..." : "Type your message to Power House..."}
                  className="flex-1 bg-background border border-border rounded-full px-4 py-3 text-sm focus:border-primary focus:outline-none transition-colors duration-200"
                />
                <Button
                  type="submit"
                  disabled={connecting || callEnded || !inputMessage.trim()}
                  className="rounded-full px-6 bg-primary hover:bg-primary/90 text-white shrink-0 font-mono text-xs uppercase"
                >
                  Send
                </Button>
              </form>
            </Card>
          </>
        ) : (
          /* MANUAL FORM */
          <Card className="bg-card/60 backdrop-blur-sm border border-border p-6 rounded-lg max-w-2xl mx-auto relative overflow-hidden">
            <CornerElements />

            <h2 className="text-xl font-bold font-mono text-center mb-6 uppercase tracking-wider">
              TELL US ABOUT <span className="text-primary">YOURSELF</span>
            </h2>

            <form onSubmit={handleFormSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-mono text-muted-foreground mb-2 uppercase">Age</label>
                  <input
                    type="number"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                    className="w-full bg-background border border-border rounded p-3 text-sm focus:border-primary focus:outline-none transition-colors duration-200"
                    placeholder="25"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono text-muted-foreground mb-2 uppercase">Height</label>
                  <input
                    type="text"
                    value={formData.height}
                    onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                    className="w-full bg-background border border-border rounded p-3 text-sm focus:border-primary focus:outline-none transition-colors duration-200"
                    placeholder="175cm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono text-muted-foreground mb-2 uppercase">Weight</label>
                  <input
                    type="text"
                    value={formData.weight}
                    onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                    className="w-full bg-background border border-border rounded p-3 text-sm focus:border-primary focus:outline-none transition-colors duration-200"
                    placeholder="70kg"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono text-muted-foreground mb-2 uppercase">Fitness Goal</label>
                  <select
                    value={formData.fitnessGoal}
                    onChange={(e) => setFormData({ ...formData, fitnessGoal: e.target.value })}
                    className="w-full bg-background border border-border rounded p-3 text-sm focus:border-primary focus:outline-none transition-colors duration-200"
                  >
                    <option value="Muscle Gain">Muscle Gain</option>
                    <option value="Weight Loss">Weight Loss</option>
                    <option value="General Fitness">General Fitness</option>
                    <option value="Athletic Performance">Athletic Performance</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-mono text-muted-foreground mb-2 uppercase">Fitness Level</label>
                  <select
                    value={formData.fitnessLevel}
                    onChange={(e) => setFormData({ ...formData, fitnessLevel: e.target.value })}
                    className="w-full bg-background border border-border rounded p-3 text-sm focus:border-primary focus:outline-none transition-colors duration-200"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-muted-foreground mb-2 uppercase">Workout Days (Per Week)</label>
                <select
                  value={formData.workoutDays}
                  onChange={(e) => setFormData({ ...formData, workoutDays: Number(e.target.value) })}
                  className="w-full bg-background border border-border rounded p-3 text-sm focus:border-primary focus:outline-none transition-colors duration-200"
                >
                  <option value={3}>3 Days (Mon, Wed, Fri)</option>
                  <option value={4}>4 Days (Mon, Tue, Thu, Fri)</option>
                  <option value={5}>5 Days (Mon, Tue, Wed, Thu, Fri)</option>
                  <option value={2}>2 Days (Tue, Thu)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono text-muted-foreground mb-2 uppercase">Injuries or Limitations</label>
                <textarea
                  value={formData.injuries}
                  onChange={(e) => setFormData({ ...formData, injuries: e.target.value })}
                  className="w-full bg-background border border-border rounded p-3 text-sm focus:border-primary focus:outline-none h-20 resize-none transition-colors duration-200"
                  placeholder="e.g. Knee pain, lower back stiffness, none"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-muted-foreground mb-2 uppercase">Dietary Restrictions</label>
                <textarea
                  value={formData.dietaryRestrictions}
                  onChange={(e) => setFormData({ ...formData, dietaryRestrictions: e.target.value })}
                  className="w-full bg-background border border-border rounded p-3 text-sm focus:border-primary focus:outline-none h-20 resize-none transition-colors duration-200"
                  placeholder="e.g. Vegan, vegetarian, dairy-free, none"
                />
              </div>

              <div className="flex justify-center pt-2">
                <Button
                  type="submit"
                  disabled={connecting || callEnded}
                  className="w-full sm:w-64 text-xl rounded-3xl bg-primary hover:bg-primary/90 text-white relative"
                >
                  {connecting && (
                    <span className="absolute inset-0 rounded-full animate-ping bg-primary/50 opacity-75"></span>
                  )}
                  <span>{connecting ? "Generating Plan..." : "Generate Program"}</span>
                </Button>
              </div>
            </form>
          </Card>
        )}

        {/* LIVE FORM CHECK */}
        <div className="mt-10">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold font-mono">
              <span>Live </span>
              <span className="text-primary uppercase">Form Check</span>
            </h2>
            <p className="text-muted-foreground mt-2 text-sm">
              Real-time posture analysis powered by MediaPipe — your skeleton overlay appears automatically
            </p>
          </div>
          <LiveFormCheck />
        </div>
      </div>
    </div>
  );
};
export default GenerateProgramPage;
