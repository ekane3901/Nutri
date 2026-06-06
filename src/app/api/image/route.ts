import { NextResponse } from "next/server";
import { getCachedImageBuffer } from "@/lib/image-cache";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const k = searchParams.get("k")?.trim();
  if (!k) {
    return new NextResponse("Missing key", { status: 400 });
  }
  const buffer = getCachedImageBuffer(k);
  if (!buffer) {
    return new NextResponse("Not found", { status: 404 });
  }
  return new NextResponse(buffer as unknown as BodyInit, {
    headers: {
      "Content-Type": "image/jpeg",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}