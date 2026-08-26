"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Webcam from "react-webcam";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CameraIcon, CameraOffIcon, LoaderIcon } from "lucide-react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
type PermissionState = "checking" | "granted" | "denied" | "unavailable";

interface Landmark {
  x: number;
  y: number;
  z?: number;
  visibility?: number;
}

interface PostureStatus {
  label: string;
  color: string;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------
const VIDEO_CONSTRAINTS: MediaTrackConstraints = {
  width: { ideal: 1280 },
  height: { ideal: 720 },
  facingMode: "user",
};

// MediaPipe landmark indices (Pose)
const POSE_LANDMARKS = {
  LEFT_SHOULDER: 11,
  RIGHT_SHOULDER: 12,
  LEFT_HIP: 23,
  RIGHT_HIP: 24,
  LEFT_KNEE: 25,
  RIGHT_KNEE: 26,
  LEFT_ANKLE: 27,
  RIGHT_ANKLE: 28,
};

// ---------------------------------------------------------------------------
// Pure Math Helper — calculates angle (°) at joint B given points A, B, C
// Insert your custom posture thresholds using this function's return value.
// ---------------------------------------------------------------------------
export function calculateAngle(a: Landmark, b: Landmark, c: Landmark): number {
  const radians =
    Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x);
  let angle = Math.abs((radians * 180) / Math.PI);
  if (angle > 180) angle = 360 - angle;
  return Math.round(angle);
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
const LiveFormCheck = () => {
  const webcamRef = useRef<Webcam>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // Store the MediaPipe Camera instance so we can stop it on unmount
  const mediapipeCameraRef = useRef<any>(null);

  const [permission, setPermission] = useState<PermissionState>("checking");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [postureStatus, setPostureStatus] = useState<PostureStatus>({
    label: "Awaiting pose data…",
    color: "text-muted-foreground",
  });

  // ── Permission probe ──────────────────────────────────────────────────────
  useEffect(() => {
    let stream: MediaStream | null = null;

    const probeCamera = async () => {
      if (
        typeof navigator === "undefined" ||
        !navigator.mediaDevices?.getUserMedia
      ) {
        setPermission("unavailable");
        setErrorMessage(
          "Camera API is not available. Make sure the page is served over HTTPS."
        );
        return;
      }

      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
        stream.getTracks().forEach((t) => t.stop());
        setPermission("granted");
      } catch (err: any) {
        console.error("[LiveFormCheck] Camera permission error:", err);

        if (
          err.name === "NotAllowedError" ||
          err.name === "PermissionDeniedError"
        ) {
          setPermission("denied");
          setErrorMessage(
            "Camera access was denied. Please allow camera access in your browser settings and reload the page."
          );
        } else if (
          err.name === "NotFoundError" ||
          err.name === "DevicesNotFoundError"
        ) {
          setPermission("unavailable");
          setErrorMessage(
            "No camera found. Please connect a camera and reload the page."
          );
        } else if (
          err.name === "NotReadableError" ||
          err.name === "TrackStartError"
        ) {
          setPermission("unavailable");
          setErrorMessage(
            "Your camera is in use by another application. Please close it and reload."
          );
        } else {
          setPermission("denied");
          setErrorMessage(`Unexpected camera error: ${err.message}`);
        }
      }
    };

    probeCamera();
    return () => { stream?.getTracks().forEach((t) => t.stop()); };
  }, []);

  // ── MediaPipe Pose initialization ─────────────────────────────────────────
  useEffect(() => {
    // Only initialise once the webcam is streaming
    if (permission !== "granted") return;

    let cancelled = false;

    const initMediaPipe = async () => {
      // Dynamically import so the heavy WASM is never loaded on the server
      const { Pose, POSE_CONNECTIONS } = await import("@mediapipe/pose");
      const { Camera } = await import("@mediapipe/camera_utils");
      const { drawConnectors, drawLandmarks } = await import(
        "@mediapipe/drawing_utils"
      );

      if (cancelled) return;

      // ── onResults callback ──────────────────────────────────────────────
      const onResults = (results: any) => {
        const canvas = canvasRef.current;
        const video = webcamRef.current?.video;
        if (!canvas || !video) return;

        // Match canvas size to the live video dimensions
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        // Clear previous frame
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (!results.poseLandmarks) {
          setPostureStatus({
            label: "No pose detected",
            color: "text-muted-foreground",
          });
          return;
        }

        const lm = results.poseLandmarks as Landmark[];

        // ── Draw skeleton (mirrored to match video feed) ───────────────────
        ctx.save();
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
        
        drawConnectors(ctx, lm, POSE_CONNECTIONS, {
          color: "rgba(45, 212, 191, 0.85)", // ocean-glow teal
          lineWidth: 3,
        });
        drawLandmarks(ctx, lm, {
          color: "rgba(16, 185, 129, 0.9)",  // ocean-emerald
          fillColor: "rgba(20, 184, 166, 0.4)",
          lineWidth: 1,
          radius: 4,
        });
        ctx.restore();

        // ── Side Detection Heuristic ───────────────────────────────────────
        const leftHipVis = lm[POSE_LANDMARKS.LEFT_HIP]?.visibility ?? 0;
        const leftKneeVis = lm[POSE_LANDMARKS.LEFT_KNEE]?.visibility ?? 0;
        const leftAnkleVis = lm[POSE_LANDMARKS.LEFT_ANKLE]?.visibility ?? 0;
        const leftAvgVis = (leftHipVis + leftKneeVis + leftAnkleVis) / 3;

        const rightHipVis = lm[POSE_LANDMARKS.RIGHT_HIP]?.visibility ?? 0;
        const rightKneeVis = lm[POSE_LANDMARKS.RIGHT_KNEE]?.visibility ?? 0;
        const rightAnkleVis = lm[POSE_LANDMARKS.RIGHT_ANKLE]?.visibility ?? 0;
        const rightAvgVis = (rightHipVis + rightKneeVis + rightAnkleVis) / 3;

        // Auto-detect which side of the body is facing the camera
        const activeSide = leftAvgVis >= rightAvgVis ? "left" : "right";

        // Calculate angles for both sides
        const leftHipAngle = calculateAngle(
          lm[POSE_LANDMARKS.LEFT_SHOULDER],
          lm[POSE_LANDMARKS.LEFT_HIP],
          lm[POSE_LANDMARKS.LEFT_KNEE]
        );
        const leftKneeAngle = calculateAngle(
          lm[POSE_LANDMARKS.LEFT_HIP],
          lm[POSE_LANDMARKS.LEFT_KNEE],
          lm[POSE_LANDMARKS.LEFT_ANKLE]
        );

        const rightHipAngle = calculateAngle(
          lm[POSE_LANDMARKS.RIGHT_SHOULDER],
          lm[POSE_LANDMARKS.RIGHT_HIP],
          lm[POSE_LANDMARKS.RIGHT_KNEE]
        );
        const rightKneeAngle = calculateAngle(
          lm[POSE_LANDMARKS.RIGHT_HIP],
          lm[POSE_LANDMARKS.RIGHT_KNEE],
          lm[POSE_LANDMARKS.RIGHT_ANKLE]
        );

        // Active side variables for coaching feedback
        const hipAngle = activeSide === "left" ? leftHipAngle : rightHipAngle;
        const kneeAngle = activeSide === "left" ? leftKneeAngle : rightKneeAngle;
        const activeHipLandmark = activeSide === "left" ? lm[POSE_LANDMARKS.LEFT_HIP] : lm[POSE_LANDMARKS.RIGHT_HIP];
        const activeKneeLandmark = activeSide === "left" ? lm[POSE_LANDMARKS.LEFT_KNEE] : lm[POSE_LANDMARKS.RIGHT_KNEE];

        console.log(
          `[LiveFormCheck] Active side: ${activeSide} | Hip: ${hipAngle}° | Knee: ${kneeAngle}°`
        );

        // ── Annotate angles on canvas (coordinates flipped to match video, text un-flipped) ──
        const drawAngleLabel = (
          landmark: Landmark,
          angle: number,
          label: string
        ) => {
          // Calculate horizontal flipped coordinate
          const x = (1 - landmark.x) * canvas.width;
          const y = landmark.y * canvas.height;
          ctx.save();
          ctx.font = "bold 14px monospace";
          ctx.fillStyle = "rgba(236, 253, 245, 0.95)";
          ctx.strokeStyle = "rgba(0,0,0,0.6)";
          ctx.lineWidth = 3;
          ctx.strokeText(`${label}: ${angle}°`, x + 6, y - 6);
          ctx.fillText(`${label}: ${angle}°`, x + 6, y - 6);
          ctx.restore();
        };

        const prefix = activeSide === "left" ? "L" : "R";
        drawAngleLabel(activeHipLandmark, hipAngle, `${prefix}-Hip`);
        drawAngleLabel(activeKneeLandmark, kneeAngle, `${prefix}-Knee`);

        // Posture coaching heuristics
        const sideLabel = activeSide === "left" ? "Left Profile" : "Right Profile";
        
        if (hipAngle < 85 && kneeAngle > 110) {
          setPostureStatus({ 
            label: `⚠️ Back strain / Poor hinge (${sideLabel})`, 
            color: "text-destructive" 
          });
        } else if (kneeAngle < 90) {
          setPostureStatus({ 
            label: `✅ Deep squat depth (${sideLabel})`, 
            color: "text-teal-400" 
          });
        } else if (hipAngle < 80) {
          setPostureStatus({ 
            label: `⚠️ Hunching forward (${sideLabel})`, 
            color: "text-yellow-400" 
          });
        } else {
          setPostureStatus({ 
            label: `✅ Active: ${sideLabel}`, 
            color: "text-primary" 
          });
        }
      };

// ── Initialise Pose model ───────────────────────────────────────────
const pose = new Pose({
  locateFile: (file: string) =>
    `https://cdn.jsdelivr.net/npm/@mediapipe/pose@0.5.1675469404/${file}`,
});

pose.setOptions({
  modelComplexity: 1,       // 0 = fast, 1 = balanced, 2 = accurate
  smoothLandmarks: true,
  enableSegmentation: false,
  smoothSegmentation: false,
  minDetectionConfidence: 0.6,
  minTrackingConfidence: 0.6,
});

pose.onResults(onResults);

// ── Start camera loop via MediaPipe Camera util ─────────────────────
const videoEl = webcamRef.current?.video;
if (!videoEl || cancelled) return;

const camera = new Camera(videoEl, {
  onFrame: async () => {
    if (videoEl.readyState >= 2) {
      await pose.send({ image: videoEl });
    }
  },
  width: 1280,
  height: 720,
});

mediapipeCameraRef.current = camera;
camera.start();
console.log("[LiveFormCheck] ✅ MediaPipe Pose camera loop started.");
    };

initMediaPipe().catch((err) => {
  console.error("[LiveFormCheck] Failed to initialise MediaPipe:", err);
});

return () => {
  cancelled = true;
  mediapipeCameraRef.current?.stop();
  mediapipeCameraRef.current = null;
};
  }, [permission]);

// ── Retry ─────────────────────────────────────────────────────────────────
const handleRetry = useCallback(() => {
  window.location.reload();
}, []);

// ── Render ────────────────────────────────────────────────────────────────
return (
  <div className="w-full flex flex-col items-center gap-4">
    {/* ── CHECKING ── */}
    {permission === "checking" && (
      <Card className="w-full max-w-2xl aspect-video flex flex-col items-center justify-center gap-4 bg-card/80 border border-border backdrop-blur-sm">
        <div className="relative">
          <CameraIcon className="w-12 h-12 text-primary opacity-60" />
          <LoaderIcon className="w-5 h-5 text-primary animate-spin absolute -bottom-1 -right-1" />
        </div>
        <div className="text-center">
          <p className="text-sm font-medium text-foreground">
            Requesting camera access…
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Please allow access when your browser prompts you.
          </p>
        </div>
      </Card>
    )}

    {/* ── DENIED / UNAVAILABLE ── */}
    {(permission === "denied" || permission === "unavailable") && (
      <Card className="w-full max-w-2xl aspect-video flex flex-col items-center justify-center gap-6 bg-card/80 border border-destructive/40 backdrop-blur-sm p-8">
        <div className="p-4 rounded-full bg-destructive/10 border border-destructive/30">
          <CameraOffIcon className="w-12 h-12 text-destructive" />
        </div>
        <div className="text-center space-y-2 max-w-sm">
          <h3 className="text-base font-semibold text-foreground">
            {permission === "denied" ? "Camera Access Denied" : "No Camera Detected"}
          </h3>
          <p className="text-sm text-muted-foreground">{errorMessage}</p>
        </div>
        {permission === "denied" && (
          <ol className="text-xs text-muted-foreground space-y-1 text-left list-decimal list-inside">
            <li>Click the 🔒 lock icon in your browser&apos;s address bar</li>
            <li>Find <strong>Camera</strong> and set it to <strong>Allow</strong></li>
            <li>Reload this page</li>
          </ol>
        )}
        <Button
          variant="outline"
          className="border-primary/50 text-primary hover:bg-primary/10"
          onClick={handleRetry}
        >
          Try Again
        </Button>
      </Card>
    )}

    {/* ── GRANTED — Live feed + skeleton overlay ── */}
    {permission === "granted" && (
      <div className="relative w-full max-w-2xl rounded-xl overflow-hidden border border-border shadow-lg">
        {/* Webcam feed */}
        <Webcam
          ref={webcamRef}
          audio={false}
          mirrored
          videoConstraints={VIDEO_CONSTRAINTS}
          className="w-full aspect-video object-cover bg-black"
          screenshotFormat="image/jpeg"
        />

        {/* Canvas — absolutely overlaid, matches video dimensions exactly */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full"
          style={{ pointerEvents: "none" }}
        />

        {/* LIVE badge */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2 py-1 rounded-full bg-black/50 backdrop-blur-sm border border-border">
          <span className="w-2 h-2 rounded-full bg-destructive animate-pulse" />
          <span className="text-xs font-mono text-foreground">LIVE</span>
        </div>

        {/* Posture status badge — updates in real time */}
        <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-black/50 backdrop-blur-sm border border-border">
          <span className={`text-xs font-mono ${postureStatus.color}`}>
            {postureStatus.label}
          </span>
        </div>
      </div>
    )}
  </div>
);
};

export default LiveFormCheck;
