"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Video, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

interface VideoUploaderProps {
  onVideoSelect: (file: File) => void;
  onAnalyze: () => void;
  isAnalyzing?: boolean;
  progress?: number;
}

export function VideoUploader({
  onVideoSelect,
  onAnalyze,
  isAnalyzing = false,
  progress = 0,
}: VideoUploaderProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (file) {
        setSelectedFile(file);
        setPreviewUrl(URL.createObjectURL(file));
        onVideoSelect(file);
      }
    },
    [onVideoSelect]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "video/*": [".mp4", ".mov", ".avi", ".webm"],
    },
    maxFiles: 1,
    maxSize: 20 * 1024 * 1024, // 20MB
  });

  const handleRemove = () => {
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-4">
      {!selectedFile ? (
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors ${
            isDragActive
              ? "border-primary bg-primary/5"
              : "border-gray-300 hover:border-primary hover:bg-gray-50"
          }`}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center space-y-4">
            <Upload className="w-16 h-16 text-gray-400" />
            <div>
              <p className="text-lg font-medium text-gray-700">
                {isDragActive ? "Suelta el video aquí" : "Arrastra tu video aquí"}
              </p>
              <p className="text-sm text-gray-500 mt-2">o haz click para seleccionar</p>
            </div>
            <div className="text-xs text-gray-400">MP4, MOV, AVI, WebM (máx. 15s, 20MB)</div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="relative rounded-lg border border-gray-200 overflow-hidden bg-black">
            <video src={previewUrl || ""} controls className="w-full h-auto max-h-96" />
            <button
              onClick={handleRemove}
              className="absolute top-2 right-2 p-2 bg-black/50 rounded-full hover:bg-black/70 transition-colors"
              disabled={isAnalyzing}
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>

          <div className="flex items-center space-x-3 text-sm text-gray-600">
            <Video className="w-5 h-5" />
            <span className="font-medium">{selectedFile.name}</span>
            <span className="text-gray-400">
              ({(selectedFile.size / (1024 * 1024)).toFixed(2)} MB)
            </span>
          </div>

          {isAnalyzing && (
            <div className="space-y-2">
              <Progress value={progress} />
              <p className="text-sm text-center text-gray-600">Analizando video... {progress}%</p>
            </div>
          )}

          <Button onClick={onAnalyze} disabled={isAnalyzing} className="w-full" size="lg">
            {isAnalyzing ? "Analizando..." : "Analizar golpe"}
          </Button>
        </div>
      )}
    </div>
  );
}
