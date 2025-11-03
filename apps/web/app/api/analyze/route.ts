import { NextRequest, NextResponse } from "next/server";
import { VideoAnalysisSchema } from "@/types/pose";
import { generateMockVideoAnalysis } from "@/lib/pose/mockAnalysis";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/analyze
 * Analyzes a video file and returns pose landmarks and biomechanical data
 *
 * TODO: Implement actual video processing with MediaPipe/MoveNet
 * Current implementation returns mock data for testing
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

    // TODO: Implement actual video processing
    // 1. Save video temporarily
    // 2. Extract frames with ffmpeg (every 100ms)
    // 3. Run MediaPipe Pose or MoveNet on each frame
    // 4. Calculate biomechanical angles
    // 5. Return analysis data

    // For now, return mock data

    // Simulate processing delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Generate mock analysis
    const analysis = generateMockVideoAnalysis(3);

    // Validate response schema
    const validatedAnalysis = VideoAnalysisSchema.parse(analysis);

    return NextResponse.json({
      success: true,
      data: validatedAnalysis,
      message: "Video analyzed successfully (mock data)",
    });
  } catch (error) {
    console.error("Error analyzing video:", error);

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ error: "Failed to analyze video" }, { status: 500 });
  }
}
