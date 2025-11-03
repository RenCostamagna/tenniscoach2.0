import ffmpeg from "fluent-ffmpeg";
import { promises as fs } from "fs";
import path from "path";
import os from "os";

/**
 * Extract frames from a video file at a given FPS
 */
export async function extractFrames(videoBuffer: Buffer, fps: number = 10): Promise<string[]> {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "tennis-frames-"));
  const videoPath = path.join(tempDir, "input.mp4");

  try {
    // Write video buffer to temp file
    await fs.writeFile(videoPath, videoBuffer);

    // Extract frames
    const framesDir = path.join(tempDir, "frames");
    await fs.mkdir(framesDir);

    await new Promise<void>((resolve, reject) => {
      ffmpeg(videoPath)
        .outputOptions([`-vf fps=${fps}`])
        .output(path.join(framesDir, "frame-%04d.png"))
        .on("end", () => resolve())
        .on("error", (err) => reject(err))
        .run();
    });

    // Get all frame paths
    const frameFiles = await fs.readdir(framesDir);
    const framePaths = frameFiles.sort().map((file) => path.join(framesDir, file));

    return framePaths;
  } catch (error) {
    // Cleanup on error
    await fs.rm(tempDir, { recursive: true, force: true });
    throw error;
  }
}

/**
 * Cleanup temporary frame files
 */
export async function cleanupFrames(framePaths: string[]): Promise<void> {
  if (framePaths.length === 0) return;

  const tempDir = path.dirname(path.dirname(framePaths[0]));

  try {
    await fs.rm(tempDir, { recursive: true, force: true });
  } catch (error) {
    console.error("Failed to cleanup temp files:", error);
  }
}

/**
 * Get video metadata
 */
export async function getVideoMetadata(
  videoBuffer: Buffer
): Promise<{ duration: number; width: number; height: number }> {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "tennis-video-"));
  const videoPath = path.join(tempDir, "input.mp4");

  try {
    await fs.writeFile(videoPath, videoBuffer);

    return await new Promise((resolve, reject) => {
      ffmpeg.ffprobe(videoPath, (err, metadata) => {
        if (err) {
          reject(err);
          return;
        }

        const videoStream = metadata.streams.find((s) => s.codec_type === "video");
        if (!videoStream) {
          reject(new Error("No video stream found"));
          return;
        }

        resolve({
          duration: metadata.format.duration || 0,
          width: videoStream.width || 0,
          height: videoStream.height || 0,
        });
      });
    });
  } finally {
    await fs.rm(tempDir, { recursive: true, force: true });
  }
}
