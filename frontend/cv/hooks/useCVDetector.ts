/**
 * React Hook for CV Detector
 * 
 * A simple hook wrapper that makes it easy to use the CV detector in React components.
 * Your frontend developer can use this hook in their own UI components.
 * 
 * Usage:
 *   const { detector, isReady, error } = useCVDetector(videoRef, canvasRef);
 *   detector?.setRepCallback((count) => setRepCount(count));
 *   detector?.startDetection();
 */

import { useEffect, useRef, useState } from "react";
import { CVDetector } from "../services/cv-detector";
import type { FormRules } from "../types/cv";

interface UseCVDetectorOptions {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  canvasRef?: React.RefObject<HTMLCanvasElement | null>;
  formRules?: FormRules;
  exerciseName?: string;
  onRepDetected?: (count: number) => void;
  onFormError?: (errors: string[]) => void;
}

export const useCVDetector = ({
  videoRef,
  canvasRef,
  formRules,
  exerciseName,
  onRepDetected,
  onFormError,
}: UseCVDetectorOptions) => {
  const detectorRef = useRef<CVDetector | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!videoRef.current) {
      return;
    }

    const video = videoRef.current;
    let cancelled = false;

    // Wait for video to be ready before initializing
    const initDetector = async () => {
      try {
        console.log("🎥 Starting CV detector initialization...");
        console.log("Video element:", video);
        console.log("Video readyState:", video.readyState);
        console.log("Video dimensions:", video.videoWidth, "x", video.videoHeight);
        
        // Wait for video to be ready (has metadata and dimensions)
        const waitForVideoReady = async () => {
          // Wait for metadata
          if (video.readyState < 2) {
            console.log("⏳ Waiting for video metadata...");
            await new Promise<void>((resolve, reject) => {
              const timeout = setTimeout(() => {
                video.removeEventListener('loadedmetadata', handleLoadedMetadata);
                reject(new Error("Timeout waiting for video metadata"));
              }, 8000);
              
              const handleLoadedMetadata = () => {
                clearTimeout(timeout);
                video.removeEventListener('loadedmetadata', handleLoadedMetadata);
                console.log("✅ Video metadata loaded");
                resolve();
              };
              video.addEventListener('loadedmetadata', handleLoadedMetadata);
            });
          }
          
          if (cancelled) return;

          // Wait for video to have valid dimensions (with timeout)
          let attempts = 0;
          const maxAttempts = 30; // 3 seconds max
          console.log("⏳ Waiting for video dimensions...");
          while ((!video.videoWidth || !video.videoHeight || video.videoWidth <= 0 || video.videoHeight <= 0) && attempts < maxAttempts) {
            if (cancelled) return;
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
          }
          
          if (cancelled) return;
          
          console.log("✅ Video dimensions:", video.videoWidth, "x", video.videoHeight);
        };

        await waitForVideoReady();
        
        if (cancelled) {
          console.log("❌ Initialization cancelled");
          return;
        }

        console.log("🤖 Initializing MediaPipe Pose Landmarker...");
        const detector = new CVDetector();
        await detector.initialize(
          video,
          canvasRef?.current || undefined
        );
        console.log("✅ MediaPipe initialized successfully");

        if (cancelled) {
          detector.stopDetection();
          return;
        }

        if (formRules) {
          detector.setFormRules(formRules, exerciseName);
        }

        if (onRepDetected) {
          detector.setRepCallback(onRepDetected);
        }

        if (onFormError) {
          detector.setFormErrorCallback(onFormError);
        }

        detectorRef.current = detector;
        setIsReady(true);
        setError(null);
        console.log("🎉 CV Detector ready!");
      } catch (err) {
        if (cancelled) {
          console.log("❌ Initialization cancelled during error handling");
          return;
        }
        const errorMessage = err instanceof Error ? err.message : "Failed to initialize CV detector";
        console.error("❌ CV Detector initialization error:", err);
        setError(errorMessage);
        setIsReady(false);
      }
    };

    initDetector();

    return () => {
      cancelled = true;
      if (detectorRef.current) {
        detectorRef.current.stopDetection();
        detectorRef.current = null;
      }
    };
  }, [videoRef, canvasRef, formRules, exerciseName, onRepDetected, onFormError]);

  // Update form rules when they change
  useEffect(() => {
    if (detectorRef.current && formRules) {
      detectorRef.current.setFormRules(formRules, exerciseName);
    }
  }, [formRules, exerciseName]);

  // Update callbacks when they change
  useEffect(() => {
    if (detectorRef.current && onRepDetected) {
      detectorRef.current.setRepCallback(onRepDetected);
    }
  }, [onRepDetected]);

  useEffect(() => {
    if (detectorRef.current && onFormError) {
      detectorRef.current.setFormErrorCallback(onFormError);
    }
  }, [onFormError]);

  return {
    detector: detectorRef.current,
    isReady,
    error,
  };
};

