"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import LiveFormCheck from "@/components/LiveFormCheck";
import { vapi, vapiWorkflowId } from "@/lib/vapi";
import { useUser } from "@/hooks/useMockableClerk";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { generateAndSavePlan } from "@/lib/mockStore";

const IS_MOCK_MODE = typeof process !== "undefined" && 
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.startsWith("pk_test_dGVzdC1jbGVyay1kdW1teS");

const GenerateProgramPage = () => {
  const [callActive, setCallActive] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [callEnded, setCallEnded] = useState(false);
  const [micError, setMicError] = useState<string | null>(null);

  const { user } = useUser();
  const router = useRouter();

  const messageContainerRef = useRef<HTMLDivElement>(null);
  const mockCallIntervalRef = useRef<any>(null);

  // SOLUTION to get rid of "Meeting has ended" error
  useEffect(() => {
    const originalError = console.error;
    // override console.error to ignore "Meeting has ended" errors
    console.error = function (msg, ...args) {
      if (
        (typeof msg === "string" && msg.includes("Meeting has ended")) ||
        (typeof msg?.toString === "function" && msg.toString().includes("Meeting has ended")) ||
        (args[0] && typeof args[0].toString === "function" && args[0].toString().includes("Meeting has ended"))
      ) {
        console.log("Ignoring known error: Meeting has ended");
        return; // don't pass to original handler
      }

      // pass all other errors to the original handler
      return originalError.call(console, msg, ...args);
    };

    // restore original handler on unmount
    return () => {
      console.error = originalError;
    };
  }, []);

  // auto-scroll messages
  useEffect(() => {
    if (messageContainerRef.current) {
      messageContainerRef.current.scrollTop = messageContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // navigate user to profile page after the call ends
  useEffect(() => {
    if (callEnded) {
      const redirectTimer = setTimeout(() => {
        router.push("/profile");
      }, 1500);

      return () => clearTimeout(redirectTimer);
    }
  }, [callEnded, router]);

  // setup event listeners for vapi — verbose logging for debugging
  useEffect(() => {
    const handleCallStart = () => {
      console.log("[Vapi] ✅ call-start: Connection established successfully.");
      setConnecting(false);
      setCallActive(true);
      setCallEnded(false);
    };

    const handleCallEnd = () => {
      console.log("[Vapi] 📞 call-end: The call has ended.");
      setCallActive(false);
      setConnecting(false);
      setIsSpeaking(false);
      setCallEnded(true);
    };

    const handleSpeechStart = () => {
      console.log("[Vapi] 🗣️ speech-start: AI assistant started speaking.");
      setIsSpeaking(true);
    };

    const handleSpeechEnd = () => {
      console.log("[Vapi] 🔇 speech-end: AI assistant stopped speaking.");
      setIsSpeaking(false);
    };

    const handleMessage = (message: any) => {
      console.log("[Vapi] 💬 message:", message.type, message);
      if (message.type === "transcript" && message.transcriptType === "final") {
        const newMessage = { content: message.transcript, role: message.role };
        setMessages((prev) => [...prev, newMessage]);
      }
    };

    const handleError = (error: any) => {
      console.error("[Vapi] ❌ error event:", error);

      // Surface specific HTTP status codes
      const statusCode = error?.statusCode ?? error?.status ?? error?.code;
      const errorMsg =
        error?.message ?? error?.msg ?? JSON.stringify(error);

      let friendlyMsg = "Connection failed. Please check your network.";

      if (statusCode === 401 || errorMsg?.includes("401") || errorMsg?.toLowerCase().includes("unauthorized")) {
        friendlyMsg = "Error: Invalid Vapi API Key (401).";
        console.error(
          "[Vapi] 🔑 401 Unauthorized — Your NEXT_PUBLIC_VAPI_API_KEY is invalid or expired. " +
            "Verify the key in your .env.local matches your Vapi dashboard."
        );
      } else if (statusCode === 404 || errorMsg?.includes("404") || errorMsg?.toLowerCase().includes("not found")) {
        friendlyMsg = "Error: Vapi Assistant Workflow not found (404).";
        console.error(
          "[Vapi] 🔍 404 Not Found — The assistant/workflow ID (NEXT_PUBLIC_VAPI_WORKFLOW_ID) was not found. " +
            "Check that it exists in your Vapi dashboard and is correctly set in .env.local."
        );
      } else if (statusCode === 403 || errorMsg?.toLowerCase().includes("forbidden")) {
        friendlyMsg = "Error: Forbidden (403) by Vapi.";
      } else if (errorMsg) {
        friendlyMsg = `Error: ${errorMsg}`;
      }

      setMicError(friendlyMsg);
      setConnecting(false);
      setCallActive(false);
    };

    vapi
      .on("call-start", handleCallStart)
      .on("call-end", handleCallEnd)
      .on("speech-start", handleSpeechStart)
      .on("speech-end", handleSpeechEnd)
      .on("message", handleMessage)
      .on("error", handleError);

    // cleanup event listeners on unmount
    return () => {
      if (mockCallIntervalRef.current) clearInterval(mockCallIntervalRef.current);
      vapi
        .off("call-start", handleCallStart)
        .off("call-end", handleCallEnd)
        .off("speech-start", handleSpeechStart)
        .off("speech-end", handleSpeechEnd)
        .off("message", handleMessage)
        .off("error", handleError);
    };
  }, []);

  const toggleCall = async () => {
    if (IS_MOCK_MODE) {
      if (callActive) {
        console.log("Mock Call stopped by user.");
        if (mockCallIntervalRef.current) clearInterval(mockCallIntervalRef.current);
        setCallActive(false);
        setConnecting(false);
        setIsSpeaking(false);
        return;
      }

      setConnecting(true);
      setMessages([]);
      setCallEnded(false);
      setMicError(null);

      // Simulate connection delay
      setTimeout(() => {
        setConnecting(false);
        setCallActive(true);
        setIsSpeaking(true);

        const conversation = [
          { role: "assistant", content: "Hello Alex! I am your AI fitness trainer. Let's design your custom program. What is your primary fitness goal?" },
          { role: "user", content: "Build muscle, gain strength, and improve core stability." },
          { role: "assistant", content: "Excellent! Let's build a strength plan. How many days per week can you dedicate to working out?" },
          { role: "user", content: "I can train 3 days per week, preferably Monday, Wednesday, and Friday." },
          { role: "assistant", content: "Perfect, a classic 3-day split. What is your current fitness level (beginner, intermediate, or advanced)?" },
          { role: "user", content: "I'd say intermediate. I know the basic compound lifts." },
          { role: "assistant", content: "Great! Finally, do you have any injuries, limitations, or dietary restrictions I should know about?" },
          { role: "user", content: "No injuries, and no dietary restrictions. Ready to go!" },
          { role: "assistant", content: "Wonderful. Generating your Muscle Gain program now... It has been successfully saved to your profile! Redirecting you there now." }
        ];

        let index = 0;
        setMessages([conversation[0]]);

        const interval = setInterval(() => {
          index++;
          if (index < conversation.length) {
            setMessages((prev) => [...prev, conversation[index]]);
            setIsSpeaking(conversation[index].role === "assistant");
          } else {
            clearInterval(interval);
            setIsSpeaking(false);
            setCallActive(false);
            setCallEnded(true);

            // Generate and save the plan to Mock Store
            generateAndSavePlan(user?.id || "user_mock123", "Muscle Gain", 3, "Intermediate");
          }
        }, 2200);

        mockCallIntervalRef.current = interval;
      }, 1500);

      return;
    }

    if (callActive) {
      console.log("[Vapi] Stopping active call...");
      vapi.stop();
      return;
    }

    // Reset state
    setConnecting(true);
    setMessages([]);
    setCallEnded(false);
    setMicError(null);

    // --- Environment Validation (fail-fast) ---
    if (!vapiWorkflowId) {
      console.error(
        "[Vapi] ❌ Cannot start call: NEXT_PUBLIC_VAPI_WORKFLOW_ID is not defined in .env.local"
      );
      setConnecting(false);
      setMicError("Configuration error: Assistant ID is missing.");
      return;
    }

    // --- Microphone Gatekeeper ---
    try {
      console.log("[Vapi] 🎤 Requesting microphone access...");
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      // Immediately release the mic — Vapi will acquire its own stream
      stream.getTracks().forEach((track) => track.stop());
      console.log("[Vapi] 🎤 Microphone access granted.");
    } catch (micErr: any) {
      console.error("[Vapi] 🎤 Microphone access denied or unavailable:", micErr);

      let userMessage = "Microphone access denied.";
      if (micErr.name === "NotFoundError" || micErr.name === "DevicesNotFoundError") {
        userMessage = "No microphone found. Please connect a microphone and try again.";
      } else if (micErr.name === "NotAllowedError" || micErr.name === "PermissionDeniedError") {
        userMessage = "Microphone access denied. Please allow microphone access in your browser settings.";
      } else if (micErr.name === "NotReadableError" || micErr.name === "TrackStartError") {
        userMessage = "Microphone is in use by another application.";
      }

      setMicError(userMessage);
      setConnecting(false);
      return;
    }

    // --- Start Vapi Call ---
    try {
      const fullName = user?.firstName
        ? `${user.firstName} ${user.lastName || ""}`.trim()
        : "There";

      console.log(`[Vapi] 📞 Starting call with workflow ID: ${vapiWorkflowId}`);

      await vapi.start(vapiWorkflowId, {
        variableValues: {
          full_name: fullName,
          user_id: user?.id,
        },
      });

      console.log("[Vapi] 📞 vapi.start() resolved — waiting for call-start event.");
    } catch (error: any) {
      console.error("[Vapi] ❌ Failed to start call:", error);
      const errorMsg = error?.message || "Please check your Vapi configuration.";
      setMicError(`Start failed: ${errorMsg}`);
      setConnecting(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen text-foreground overflow-hidden  pb-6 pt-24">
      <div className="container mx-auto px-4 h-full max-w-5xl">
        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold font-mono">
            <span>Generate Your </span>
            <span className="text-primary uppercase">Fitness Program</span>
          </h1>
          <p className="text-muted-foreground mt-2">
            Have a voice conversation with our AI assistant to create your personalized plan
          </p>
        </div>

        {/* VIDEO CALL AREA */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* AI ASSISTANT CARD */}
          <Card className="bg-card/90 backdrop-blur-sm border border-border overflow-hidden relative">
            <div className="aspect-video flex flex-col items-center justify-center p-6 relative">
              {/* AI VOICE ANIMATION */}
              <div
                className={`absolute inset-0 ${isSpeaking ? "opacity-30" : "opacity-0"
                  } transition-opacity duration-300`}
              >
                {/* Voice wave animation when speaking */}
                <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 flex justify-center items-center h-20">
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className={`mx-1 h-16 w-1 bg-primary rounded-full ${isSpeaking ? "animate-sound-wave" : ""
                        }`}
                      style={{
                        animationDelay: `${i * 0.1}s`,
                        height: isSpeaking ? `${Math.random() * 50 + 20}%` : "5%",
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* AI IMAGE */}
              <div className="relative size-32 mb-4">
                <div
                  className={`absolute inset-0 bg-primary opacity-10 rounded-full blur-lg ${isSpeaking ? "animate-pulse" : ""
                    }`}
                />

                <div className="relative w-full h-full rounded-full bg-card flex items-center justify-center border border-border overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-secondary/10"></div>
                  <img
                    src="/ai-avatar.png"
                    alt="AI Assistant"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              <h2 className="text-xl font-bold text-foreground">Power House</h2>
              <p className="text-sm text-muted-foreground mt-1">Fitness & Diet Coach</p>

              {/* SPEAKING INDICATOR */}

              <div
                className={`mt-4 flex items-center gap-2 px-3 py-1 rounded-full bg-card border border-border ${isSpeaking ? "border-primary" : ""
                  }`}
              >
                <div
                  className={`w-2 h-2 rounded-full ${isSpeaking ? "bg-primary animate-pulse" : "bg-muted"
                    }`}
                />

                <span className="text-xs text-muted-foreground">
                  {micError
                    ? micError
                    : isSpeaking
                      ? "Speaking..."
                      : callActive
                        ? "Listening..."
                        : connecting
                          ? "Connecting..."
                          : callEnded
                            ? "Redirecting to profile..."
                            : "Waiting..."}
                </span>
              </div>
            </div>
          </Card>

          {/* USER CARD */}
          <Card className={`bg-card/90 backdrop-blur-sm border overflow-hidden relative`}>
            <div className="aspect-video flex flex-col items-center justify-center p-6 relative">
              {/* User Image */}
              <div className="relative size-32 mb-4">
                <img
                  src={user?.imageUrl}
                  alt="User"
                  // ADD THIS "size-full" class to make it rounded on all images
                  className="size-full object-cover rounded-full"
                />
              </div>

              <h2 className="text-xl font-bold text-foreground">You</h2>
              <p className="text-sm text-muted-foreground mt-1">
                {user ? (user.firstName + " " + (user.lastName || "")).trim() : "Guest"}
              </p>

              {/* User Ready Text */}
              <div className={`mt-4 flex items-center gap-2 px-3 py-1 rounded-full bg-card border`}>
                <div className={`w-2 h-2 rounded-full bg-muted`} />
                <span className="text-xs text-muted-foreground">Ready</span>
              </div>
            </div>
          </Card>
        </div>

        {/* MESSAGE COINTER  */}
        {messages.length > 0 && (
          <div
            ref={messageContainerRef}
            className="w-full bg-card/90 backdrop-blur-sm border border-border rounded-xl p-4 mb-8 h-64 overflow-y-auto transition-all duration-300 scroll-smooth"
          >
            <div className="space-y-3">
              {messages.map((msg, index) => (
                <div key={index} className="message-item animate-fadeIn">
                  <div className="font-semibold text-xs text-muted-foreground mb-1">
                    {msg.role === "assistant" ? "Personal Fitness Trainer AI" : "You"}:
                  </div>
                  <p className="text-foreground">{msg.content}</p>
                </div>
              ))}

              {callEnded && (
                <div className="message-item animate-fadeIn">
                  <div className="font-semibold text-xs text-primary mb-1">System:</div>
                  <p className="text-foreground">
                    Your fitness program has been created! Redirecting to your profile...
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* CALL CONTROLS */}
        <div className="w-full flex justify-center gap-4">
          <Button
            className={`w-40 text-xl rounded-3xl ${callActive
                ? "bg-destructive hover:bg-destructive/90"
                : callEnded
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-primary hover:bg-primary/90"
              } text-white relative`}
            onClick={toggleCall}
            disabled={connecting || callEnded}
          >
            {connecting && (
              <span className="absolute inset-0 rounded-full animate-ping bg-primary/50 opacity-75"></span>
            )}

            <span>
              {callActive
                ? "End Call"
                : connecting
                  ? "Connecting..."
                  : callEnded
                    ? "View Profile"
                    : "Start Call"}
            </span>
          </Button>
        </div>

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
