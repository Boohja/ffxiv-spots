import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { zonesByName } from "@/lib/spots/zones";

export const runtime = "nodejs";

const maxDistance = 1.75;

type LandmarkRow = {
  id: number;
  name: string;
  x: number;
  y: number;
};

export async function GET(request: Request) {
  const url = new URL(request.url);
  const zone = url.searchParams.get("zone")?.trim();
  const x = parseCoordinate(url.searchParams.get("x"));
  const y = parseCoordinate(url.searchParams.get("y"));

  if (!zone || !zonesByName.has(zone) || x === undefined || y === undefined) {
    return NextResponse.json({ landmark: null });
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("landmarks")
    .select("id,name,x,y")
    .eq("zone", zone)
    .gte("x", x - maxDistance)
    .lte("x", x + maxDistance)
    .gte("y", y - maxDistance)
    .lte("y", y + maxDistance);

  if (error) {
    console.error(error);
    return NextResponse.json({ error: "Could not look up nearby landmarks." }, { status: 500 });
  }

  const nearest = findNearestLandmark(data ?? [], x, y);

  if (!nearest || nearest.distance > maxDistance) {
    return NextResponse.json({ landmark: null });
  }

  return NextResponse.json({
    landmark: {
      id: nearest.landmark.id,
      name: nearest.landmark.name,
      x: nearest.landmark.x,
      y: nearest.landmark.y,
      distance: Number(nearest.distance.toFixed(2)),
    },
  });
}

function parseCoordinate(value: string | null) {
  if (!value) {
    return undefined;
  }

  const coordinate = Number(value);

  return Number.isFinite(coordinate) ? coordinate : undefined;
}

function findNearestLandmark(landmarks: LandmarkRow[], x: number, y: number) {
  return landmarks
    .map((landmark) => ({
      landmark,
      distance: Math.hypot(landmark.x - x, landmark.y - y),
    }))
    .sort((a, b) => a.distance - b.distance)[0];
}
