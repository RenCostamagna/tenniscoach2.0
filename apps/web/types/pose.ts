import { z } from "zod";

// Keypoint schema
export const KeypointSchema = z.object({
  x: z.number(),
  y: z.number(),
  score: z.number().min(0).max(1).optional(),
  name: z.string().optional(),
});

export type Keypoint = z.infer<typeof KeypointSchema>;

// Pose landmarks (MediaPipe style)
export const PoseLandmarksSchema = z.object({
  nose: KeypointSchema,
  leftEye: KeypointSchema,
  rightEye: KeypointSchema,
  leftEar: KeypointSchema,
  rightEar: KeypointSchema,
  leftShoulder: KeypointSchema,
  rightShoulder: KeypointSchema,
  leftElbow: KeypointSchema,
  rightElbow: KeypointSchema,
  leftWrist: KeypointSchema,
  rightWrist: KeypointSchema,
  leftHip: KeypointSchema,
  rightHip: KeypointSchema,
  leftKnee: KeypointSchema,
  rightKnee: KeypointSchema,
  leftAnkle: KeypointSchema,
  rightAnkle: KeypointSchema,
});

export type PoseLandmarks = z.infer<typeof PoseLandmarksSchema>;

// Biomechanical angles
export const BiomechanicalAnglesSchema = z.object({
  // Arm angles
  leftArmAngle: z.number().min(0).max(180),
  rightArmAngle: z.number().min(0).max(180),
  // Leg angles
  leftLegAngle: z.number().min(0).max(180),
  rightLegAngle: z.number().min(0).max(180),
  // Torso rotation
  torsoRotation: z.number().min(-180).max(180),
  // Knee flexion
  leftKneeFlex: z.number().min(0).max(180),
  rightKneeFlex: z.number().min(0).max(180),
});

export type BiomechanicalAngles = z.infer<typeof BiomechanicalAnglesSchema>;

// Frame analysis
export const FrameAnalysisSchema = z.object({
  frameIndex: z.number().int().nonnegative(),
  timestamp: z.number().nonnegative(),
  landmarks: PoseLandmarksSchema,
  angles: BiomechanicalAnglesSchema,
});

export type FrameAnalysis = z.infer<typeof FrameAnalysisSchema>;

// Video analysis result
export const VideoAnalysisSchema = z.object({
  frames: z.array(FrameAnalysisSchema),
  summary: z.object({
    avgAngles: BiomechanicalAnglesSchema,
    rangeOfMotion: z.object({
      leftArmRange: z.tuple([z.number(), z.number()]),
      rightArmRange: z.tuple([z.number(), z.number()]),
      leftLegRange: z.tuple([z.number(), z.number()]),
      rightLegRange: z.tuple([z.number(), z.number()]),
      torsoRotationRange: z.tuple([z.number(), z.number()]),
    }),
  }),
  metadata: z.object({
    duration: z.number(),
    fps: z.number(),
    totalFrames: z.number(),
  }),
});

export type VideoAnalysis = z.infer<typeof VideoAnalysisSchema>;

// Coach feedback
export const CoachFeedbackSchema = z.object({
  summary: z.string(),
  tips: z.array(
    z.object({
      title: z.string(),
      description: z.string(),
      priority: z.enum(["high", "medium", "low"]),
    })
  ),
  drills: z.array(
    z.object({
      name: z.string(),
      description: z.string(),
      repetitions: z.string().optional(),
    })
  ),
});

export type CoachFeedback = z.infer<typeof CoachFeedbackSchema>;

// Chat message
export const ChatMessageSchema = z.object({
  id: z.string(),
  role: z.enum(["user", "assistant"]),
  content: z.string(),
  timestamp: z.number(),
});

export type ChatMessage = z.infer<typeof ChatMessageSchema>;

// Chat session
export const ChatSessionSchema = z.object({
  sessionId: z.string(),
  messages: z.array(ChatMessageSchema),
  context: z
    .object({
      lastAnalysis: VideoAnalysisSchema.optional(),
      lastFeedback: CoachFeedbackSchema.optional(),
    })
    .optional(),
});

export type ChatSession = z.infer<typeof ChatSessionSchema>;
