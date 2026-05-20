import { useState, useCallback } from 'react';
import * as ImageManipulator from 'expo-image-manipulator';
import { hfInference } from '../lib/ai/huggingFace';

export interface ClassificationResult {
  label: string;
  confidence: number;
}

export function usePlantInference() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const classify = useCallback(async (imageUri: string): Promise<ClassificationResult[]> => {
    try {
      setIsLoading(true);
      setError(null);

      // 1. Preprocess: Resize and compress to stay under HF Inference API limits (~2MB)
      const manipulatedImage = await ImageManipulator.manipulateAsync(
        imageUri,
        [{ resize: { width: 512 } }], // Cloud models can handle higher res than mobile ViT
        { base64: true, format: ImageManipulator.SaveFormat.JPEG, compress: 0.8 }
      );

      if (!manipulatedImage.base64) {
        throw new Error('Failed to generate base64 image data');
      }

      // 2. Run Cloud Inference
      const hfResults = await hfInference.identifyPlant(manipulatedImage.base64);

      // 3. Map to local format
      return hfResults
        .map(res => ({
          label: res.label,
          confidence: res.score,
        }))
        .sort((a, b) => b.confidence - a.confidence);
        
    } catch (err: any) {
      const msg = err.message || 'Unknown AI error';
      setError(msg);
      throw new Error(msg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { classify, isLoading, error };
}
