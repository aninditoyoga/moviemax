import { NextRequest, NextResponse } from "next/server";
import { resolveTvStreamSource } from "@/lib/streamProviders";

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
  const season = request.nextUrl.searchParams.get("season");
  const episode = request.nextUrl.searchParams.get("episode");

  if (!season || !episode) {
    return NextResponse.json(
      {
        error: "Missing season or episode",
      },
      { status: 400 }
    );
  }

  const source = await resolveTvStreamSource({
    tmdbId: id,
    imdbId,
    season,
    episode,
  });

  if (!source) {
    console.error(
      `[SourceService] No streaming sources found for TMDB ID: ${id}, season: ${season}, episode: ${episode}`
    );

    return NextResponse.json(
      {
        error: `No streaming sources found for TMDB ID: ${id}, season: ${season}, episode: ${episode}`,
      },
      { status: 404 }
    );
  }

  return NextResponse.redirect(source.url);
}
