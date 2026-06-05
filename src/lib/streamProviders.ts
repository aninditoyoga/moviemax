type MediaIds = {
  tmdbId: string;
  imdbId?: string | null;
};

type StreamProvider = {
  id: string;
  name: string;
  baseUrl: string;
  buildMovieUrl: (ids: MediaIds) => string | null;
};

const withImdbFallback = (
  ids: MediaIds,
  build: (id: string) => string,
  preferImdb = false
) => {
  const id = preferImdb ? ids.imdbId || ids.tmdbId : ids.tmdbId || ids.imdbId;

  return id ? build(id) : null;
};

export const movieStreamProviders: StreamProvider[] = [
  {
    id: "02moviedownloader",
    name: "02MovieDownloader",
    baseUrl: "https://02moviedownloader.com",
    buildMovieUrl: ({ tmdbId }) => `https://02moviedownloader.com/movie/${tmdbId}`,
  },
  {
    id: "anyembed",
    name: "AnyEmbed",
    baseUrl: "https://player.anyembed.com",
    buildMovieUrl: ({ tmdbId }) => `https://player.anyembed.com/movie/${tmdbId}`,
  },
  {
    id: "cinesu",
    name: "CineSu",
    baseUrl: "https://embed.su",
    buildMovieUrl: ({ tmdbId }) => `https://embed.su/embed/movie/${tmdbId}`,
  },
  {
    id: "fmovies4u",
    name: "FMovies4U",
    baseUrl: "https://fmovies4u.com",
    buildMovieUrl: ({ tmdbId }) => `https://fmovies4u.com/watch/movie/${tmdbId}`,
  },
  {
    id: "fshare",
    name: "FshareTV",
    baseUrl: "https://fsharetv.co",
    buildMovieUrl: ({ tmdbId }) => `https://fsharetv.co/movie/${tmdbId}`,
  },
  {
    id: "icefy",
    name: "Icefy",
    baseUrl: "https://icefy.tv",
    buildMovieUrl: ({ tmdbId }) => `https://icefy.tv/movie/${tmdbId}`,
  },
  {
    id: "peachify",
    name: "Peachify",
    baseUrl: "https://peachify.net",
    buildMovieUrl: ({ tmdbId }) => `https://peachify.net/embed/movie/${tmdbId}`,
  },
  {
    id: "popr",
    name: "Popr",
    baseUrl: "https://popr.tv",
    buildMovieUrl: ({ tmdbId }) => `https://popr.tv/movie/${tmdbId}`,
  },
  {
    id: "streammafia",
    name: "MafiaEmbed",
    baseUrl: "https://streammafia.com",
    buildMovieUrl: ({ tmdbId }) => `https://streammafia.com/embed/movie/${tmdbId}`,
  },
  {
    id: "tulnex",
    name: "Tulnex",
    baseUrl: "https://tulnex.com",
    buildMovieUrl: ({ tmdbId }) => `https://tulnex.com/embed/movie/${tmdbId}`,
  },
  {
    id: "vidapi",
    name: "VidApi",
    baseUrl: "https://vidapi.ru",
    buildMovieUrl: ({ tmdbId }) => `https://vidapi.ru/movie/${tmdbId}`,
  },
  {
    id: "videasy",
    name: "Videasy",
    baseUrl: "https://player.videasy.net",
    buildMovieUrl: ({ tmdbId }) => `https://player.videasy.net/movie/${tmdbId}`,
  },
  {
    id: "vidnest",
    name: "VidNest",
    baseUrl: "https://vidnest.fun",
    buildMovieUrl: ({ tmdbId }) => `https://vidnest.fun/movie/${tmdbId}`,
  },
  {
    id: "vidrock",
    name: "VidRock",
    baseUrl: "https://vidrock.net",
    buildMovieUrl: ({ tmdbId }) => `https://vidrock.net/movie/${tmdbId}`,
  },
  {
    id: "vidsrc",
    name: "VidSrc",
    baseUrl: "https://vsembed.ru",
    buildMovieUrl: ({ tmdbId }) => `https://vsembed.ru/embed/movie?tmdb=${tmdbId}`,
  },
  {
    id: "vidzee",
    name: "VidZee",
    baseUrl: "https://vidzee.wtf",
    buildMovieUrl: ({ tmdbId }) => `https://vidzee.wtf/movie/${tmdbId}`,
  },
  {
    id: "vixsrc",
    name: "VixSrc",
    baseUrl: "https://vixsrc.to",
    buildMovieUrl: (ids) => withImdbFallback(ids, (id) => `https://vixsrc.to/movie/${id}`),
  },
];

export type ResolvedStreamSource = {
  provider: string;
  url: string;
  responseTime: number;
};

const PROVIDER_TIMEOUT_MS = 4500;

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
  const checks = movieStreamProviders
    .map((provider) => ({
      provider,
      url: provider.buildMovieUrl(ids),
    }))
    .filter((item): item is { provider: StreamProvider; url: string } => Boolean(item.url))
    .map(async ({ provider, url }) => {
      const startedAt = Date.now();
      const reachable = await isReachable(url);
      const responseTime = Date.now() - startedAt;

      console.log(
        `[SourceService] Provider '${provider.name}' returned ${reachable ? 1 : 0} source(s) in ${responseTime}ms`
      );

      return reachable
        ? {
            provider: provider.name,
            url,
            responseTime,
          }
        : null;
    });

  console.log(`[SourceService] Fetching from ${checks.length} provider(s)`);

  const results = await Promise.all(checks);

  return results
    .filter((source): source is ResolvedStreamSource => Boolean(source))
    .sort((a, b) => a.responseTime - b.responseTime)[0];
}
