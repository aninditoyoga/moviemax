import { NextRequest, NextResponse } from "next/server";
import { resolveMovieStreamSource } from "@/lib/streamProviders";

type RouteContext = {
  params:
    | {
        id: string;
      }
    | Promise<{
        id: string;
      }>;
};

export async function GET(request: NextRequest, { params }: RouteContext) {
  const { id } = await params;
  const imdbId = request.nextUrl.searchParams.get("imdbId");
  const source = await resolveMovieStreamSource({
    tmdbId: id,
    imdbId,
  });

  if (!source) {
    console.error(`[SourceService] No streaming sources found for TMDB ID: ${id}`);

    return NextResponse.json(
      {
        error: `No streaming sources found for TMDB ID: ${id}`,
      },
      { status: 404 }
    );
  }

  return NextResponse.redirect(source.url);
}
