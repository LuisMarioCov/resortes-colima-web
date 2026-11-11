import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/admin";
import { clientIp, rateLimit } from "@/lib/rate-limit";

const SPRING_TYPES = new Set(["tension", "compression", "torsion"]);
const UNITS = new Set(["in", "mm"]);

function normalizePhone(phone: string): string {
  return phone.replace(/\D/g, "");
}

export async function POST(request: Request) {
  const ip = clientIp(request);
  const ipRl = rateLimit(`personalizados:ip:${ip}`, 5, 15 * 60 * 1000);
  if (!ipRl.ok) {
    return NextResponse.json(
      { error: "Demasiados envíos. Intenta más tarde." },
      { status: 429, headers: { "Retry-After": String(ipRl.retryAfterSec ?? 60) } }
    );
  }

  const admin = createServiceClient();
  if (!admin) {
    return NextResponse.json({ error: "Servicio no disponible" }, { status: 503 });
  }

  let payload: Record<string, unknown>;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const phone = String(payload.contact_phone ?? "");
  const phoneRl = rateLimit(
    `personalizados:phone:${normalizePhone(phone)}`,
    3,
    60 * 60 * 1000
  );
  if (!phoneRl.ok) {
    return NextResponse.json(
      { error: "Límite por teléfono alcanzado." },
      { status: 429 }
    );
  }

  const springType = String(payload.spring_type ?? "");
  const unit = String(payload.unit ?? "");
  if (!SPRING_TYPES.has(springType) || !UNITS.has(unit)) {
    return NextResponse.json({ error: "Tipo o unidad inválidos" }, { status: 400 });
  }

  if (!payload.sample_image_path) {
    return NextResponse.json({ error: "La foto de muestra es obligatoria" }, { status: 400 });
  }

  const row = {
    inner_diameter: Number(payload.inner_diameter),
    outer_diameter: Number(payload.outer_diameter),
    turns: Number(payload.turns),
    wire_gauge: String(payload.wire_gauge ?? "").slice(0, 80),
    length_desired: Number(payload.length_desired),
    spring_type: springType,
    unit,
    coil_spacing:
      payload.coil_spacing === undefined || payload.coil_spacing === null
        ? null
        : Number(payload.coil_spacing),
    quantity: Number(payload.quantity),
    sample_image_path: String(payload.sample_image_path),
    measurement_image_path: payload.measurement_image_path
      ? String(payload.measurement_image_path)
      : null,
    contact_name: String(payload.contact_name ?? "").slice(0, 120),
    contact_phone: phone.slice(0, 40),
    contact_notes: payload.contact_notes
      ? String(payload.contact_notes).slice(0, 2000)
      : null,
    status: "received" as const,
    order_id: null,
  };

  const { data, error } = await admin
    .from("custom_requests")
    .insert(row)
    .select("id")
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "No se pudo registrar la solicitud" }, { status: 500 });
  }

  const folio = data.id.replace(/-/g, "").slice(0, 8).toUpperCase();
  return NextResponse.json({ folio, id: data.id });
}
