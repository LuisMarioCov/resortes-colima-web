import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/admin";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { randomUUID } from "crypto";

const ALLOWED = new Set([
  "image/jpeg",
  "image/png",
  "image/heic",
  "image/webp",
]);
const MAX_BYTES = 8 * 1024 * 1024;

export async function POST(request: Request) {
  const ip = clientIp(request);
  const rl = rateLimit(`personalizados-upload:ip:${ip}`, 5, 15 * 60 * 1000);
  if (!rl.ok) {
    return NextResponse.json({ error: "Límite de subidas alcanzado" }, { status: 429 });
  }

  const admin = createServiceClient();
  if (!admin) {
    return NextResponse.json({ error: "Servicio no disponible" }, { status: 503 });
  }

  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Archivo requerido" }, { status: 400 });
  }
  if (!ALLOWED.has(file.type) || file.size > MAX_BYTES) {
    return NextResponse.json(
      { error: "Solo JPEG, PNG, HEIC o WebP hasta 8 MB" },
      { status: 400 }
    );
  }

  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const objectPath = `${randomUUID()}/${randomUUID()}.${ext}`;

  const buffer = Buffer.from(await file.arrayBuffer());
  const { error } = await admin.storage.from("custom-samples").upload(objectPath, buffer, {
    contentType: file.type,
    upsert: false,
  });

  if (error) {
    return NextResponse.json({ error: "No se pudo subir la imagen" }, { status: 500 });
  }

  return NextResponse.json({ path: objectPath });
}
