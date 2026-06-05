type MediaIds = {
  tmdbId: string;
  imdbId?: string | null;
};

type StreamProvider = {
  id: string;
  name: string;
  baseUrl: string;
  buildMovieUrl: (ids: Required<MediaIds>) => string | null;
};

export type ResolvedStreamSource = {
  provider: string;
  url: string;
  responseTime: number;
};

const PROVIDER_TIMEOUT_MS = 4500;

const streamImdbProvider: StreamProvider = {
  id: "streamimdb",
  name: "StreamIMDb",
  baseUrl: "https://streamimdb.ru",
  buildMovieUrl: ({ imdbId }) =>
    imdbId ? `https://streamimdb.ru/embed/movie/${imdbId}` : null,
};

async function getMovieImdbId(tmdbId: string) {
  const apiKey = process.env.TMDB_API_KEY || process.env.NEXT_PUBLIC_TMDB_API_KEY;

  if (!apiKey) {
    console.warn("[SourceService] TMDB API key is missing, cannot convert TMDB ID to IMDb ID");
    return null;
  }

  try {
    const response = await fetch(
      `https://api.themoviedb.org/3/movie/${tmdbId}/external_ids?api_key=${apiKey}`,
      {
        cache: "no-store",
      }
    );

    if (!response.ok) {
      console.warn(
        `[SourceService] Failed to convert TMDB ID ${tmdbId} to IMDb ID: ${response.status}`
      );
      return null;
    }

    const data = (await response.json()) as { imdb_id?: string | null };

    return data.imdb_id || null;
  } catch {
    console.warn(`[SourceService] Failed to convert TMDB ID ${tmdbId} to IMDb ID`);
    return null;
  }
}

async function isReachable(url: string) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), PROVIDER_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      method: "GET",
      redirect: "follow",
      signal: controller.signal,
      cache: "no-store",
      headers: {
        "User-Agent": "Mozilla/5.0 MovieMax SourceResolver",
      },
    });

    return response.ok;
  } catch {
    return false;
  } finally {
    clearTimeout(timeout);
  }
}

export async function resolveMovieStreamSource(ids: MediaIds) {
  const imdbId = ids.imdbId || (await getMovieImdbId(ids.tmdbId));
  const providerIds: Required<MediaIds> = {
    tmdbId: ids.tmdbId,
    imdbId: imdbId || "",
  };
  const url = streamImdbProvider.buildMovieUrl(providerIds);

  console.log("[SourceService] Fetching from 1 provider(s)");

  if (!url) {
    console.log(`[SourceService] Provider '${streamImdbProvider.name}' returned 0 source(s) in 0ms`);
    return null;
  }

  const startedAt = Date.now();
  const reachable = await isReachable(url);
  const responseTime = Date.now() - startedAt;

  console.log(
    `[SourceService] Provider '${streamImdbProvider.name}' returned ${reachable ? 1 : 0} source(s) in ${responseTime}ms`
  );

  return reachable
    ? {
        provider: streamImdbProvider.name,
        url,
        responseTime,
      }
    : null;
}
