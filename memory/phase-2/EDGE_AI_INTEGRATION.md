# AI Integration Guide: Hugging Face Cloud Inference

## Overview
This document outlines the strategy for integrating plant identification and disease detection into the GroSphere mobile application using the Hugging Face Inference API. This replaces the previous Edge AI strategy to ensure higher accuracy and zero on-device model overhead.

## 1. Technical Stack
- **Engine:** Hugging Face Serverless Inference API (Free Tier).
- **Camera:** `expo-camera`.
- **Image Processing:** `expo-image-manipulator`.

## 2. Model Selection
We utilize state-of-the-art models fine-tuned for botanical tasks:
- **Identification:** `Hemant_Kumar/plant-identification` (ViT).
- **Disease:** `imadegunawan/plant-disease-detection-using-vit`.

## 3. Implementation Details

### API Service (`src/lib/ai/huggingFace.ts`)
A lightweight service that performs POST requests to the Hugging Face Inference endpoints. It requires a `Bearer` token for authentication.

### Inference Hook (`src/hooks/usePlantInference.ts`)
- Resizes images to `512px` (optimal for cloud inference without excessive upload time).
- Decodes the Base64 image into a binary `Uint8Array` buffer before transmission to correct vision pipeline formats.
- Handles loading states and error reporting for the UI.

## 4. Usage Limits
The free tier of the Hugging Face Inference API has dynamic rate limits and a monthly credit cap ($0.10 as of 2026). This is suitable for prototyping but may require a PRO subscription for production scaling.
