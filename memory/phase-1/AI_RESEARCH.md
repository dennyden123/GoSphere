# AI Research & Model Selection (Final)

## Selected Strategy: Hybrid Tiered Inference

### Tier 1: Ultra-Edge (Mobile On-Device)
- **Model:** `MobilePlantViT` (2025 Research SOTA)
- **Architecture:** Hybrid Vision Transformer (ViT) / CNN.
- **Specs:** 0.69M parameters, ~2.5MB size (Quantized).
- **Format:** ONNX / TFLite (INT8).
- **Purpose:** Instant, real-time "Quick Scans" for plant identification and basic health monitoring without internet.

### Tier 2: Precision Diagnostic (Cloud/Back-end)
- **Model:** `PlantNet Ensemble` (by prof-freakenstein)
- **Architecture:** Ensemble of ResNet152, EfficientNet-B4, ViT, and Swin Transformer.
- **Accuracy:** 97.0% on 38 disease classes.
- **Purpose:** "Deep Consultations" where high precision and treatment recommendations are required.

### Tier 3: Multi-Modal Assistant (Future Phase 3)
- **Model:** `Gemini 1.5 Flash`
- **Purpose:** Conversational gardening advice, growth stage analysis, and complex multi-symptom diagnostics.

## Preprocessing & Optimization
- **Object Detection:** `YOLOv10n` for real-time leaf localization and cropping.
- **Quantization:** INT8 quantization for all edge models to minimize binary size and maximize NPU utilization on iPhone 15+ and Android flagship devices.

## Roadmap for Phase 2
1. **Model Retrieval:** Fetch `MobilePlantViT` and `PlantNet` weights.
2. **Conversion:** Use `optimum` or `tf2onnx` to generate ONNX artifacts.
3. **Integration:** Embed ONNX Runtime in the Expo application.
