import { NextRequest, NextResponse } from "next/server";
import { VideoAnalysisSchema } from "@/types/pose";
import { analyzeVideoWithPoseDetection } from "@/lib/pose/realAnalysis";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60; // Allow up to 60 seconds for video processing

/**
 * POST /api/analyze
 * Analyzes a video file and returns pose landmarks and biomechanical data
 * Uses MoveNet for real-time pose detection
 */
export async function POST(request: NextRequest) {
  try {
    // Get form data
    const formData = await request.formData();
    const videoFile = formData.get("video") as File | null;

    if (!videoFile) {
      return NextResponse.json({ error: "No video file provided" }, { status: 400 });
    }

    // Validate file type
    if (!videoFile.type.startsWith("video/")) {
      return NextResponse.json({ error: "Invalid file type. Must be a video." }, { status: 400 });
    }

    // Validate file size (max 20MB)
    const maxSizeBytes = 20 * 1024 * 1024;
    if (videoFile.size > maxSizeBytes) {
      return NextResponse.json({ error: "File too large. Maximum size is 20MB." }, { status: 400 });
    }

    // Convert file to buffer
    const arrayBuffer = await videoFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Analyze video with real pose detection
    const analysis = await analyzeVideoWithPoseDetection(buffer, 10);

    // Validate response schema
    const validatedAnalysis = VideoAnalysisSchema.parse(analysis);

    return NextResponse.json({
      success: true,
      data: validatedAnalysis,
      message: "Video analyzed successfully with MoveNet pose detection",
    });
  } catch (error) {
    console.error("Error analyzing video:", error);

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ error: "Failed to analyze video" }, { status: 500 });
  }
}
