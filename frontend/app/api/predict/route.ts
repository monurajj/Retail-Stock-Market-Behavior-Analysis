import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");
    const periodicity = String(formData.get("periodicity") || "monthly");

    if (!(file instanceof File)) {
      return new NextResponse("CSV file is required", { status: 400 });
    }

    // Forward the request to the Python FastAPI backend
    const backendRes = await fetch("http://localhost:8000/api/predict", {
      method: "POST",
      body: formData
    });

    if (!backendRes.ok) {
      const text = await backendRes.text();
      console.error("Backend error:", text);
      return new NextResponse("Backend prediction failed", { status: 502 });
    }

    const data = await backendRes.json();
    return NextResponse.json(data);
  } catch (err) {
    console.error(err);
    return new NextResponse("Failed to generate prediction", { status: 500 });
  }
}


