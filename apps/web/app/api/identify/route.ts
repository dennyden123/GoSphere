import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const image = formData.get('image') as File;
    
    if (!image) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 });
    }

    const buffer = await image.arrayBuffer();

    // Model optimized for mobile/fast inference of plant diseases
    const API_URL = "https://api-inference.huggingface.co/models/linkanjarad/mobilenet_v2_1.0_224-plant-disease-identification";
    
    const response = await fetch(API_URL, {
      headers: {
        Authorization: `Bearer ${process.env.HUGGING_FACE_API_KEY}`,
        "Content-Type": "application/octet-stream",
      },
      method: "POST",
      body: buffer,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("HF API Error:", errorText);
      
      // Handle model loading state (503 Service Unavailable is common when HF spins up a model)
      if (response.status === 503) {
        return NextResponse.json(
          { error: 'AI Model is currently booting up. Please try again in 30 seconds.' }, 
          { status: 503 }
        );
      }
      
      return NextResponse.json({ error: 'Failed to process image through AI' }, { status: response.status });
    }

    const result = await response.json();
    return NextResponse.json(result);
  } catch (error) {
    console.error("Identify API Error:", error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
