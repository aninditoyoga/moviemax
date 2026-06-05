type MediaIds = {
  tmdbId: string;
  imdbId?: string | null;
};

type StreamProvider = {
  name: string;
  buildMovieUrl: (ids: MediaIds) => string | null;
};

export const movieStreamProviders: StreamProvider[] = [
  {
    name: "VidSrc Online",
    buildMovieUrl: ({ imdbId }) =>
      imdbId ? `https://vidsrc.online/embed/movie/${imdbId}` : null,
  },
  {
    name: "VidSrc FYI",
    buildMovieUrl: ({ imdbId }) =>
      imdbId ? `https://vidsrc.fyi/embed/movie/${imdbId}` : null,
  },
  {
    name: "VidSrc CC",
    buildMovieUrl: ({ imdbId }) =>
      imdbId ? `https://vidsrc.cc/v2/embed/movie/${imdbId}` : null,
  },
  {
    name: "VidSrc Wiki",
    buildMovieUrl: ({ tmdbId }) => `https://vidsrc.wiki/embed/movie/${tmdbId}`,
  },
  {
    name: "VidSrc SBS",
    buildMovieUrl: ({ tmdbId }) => `https://vidsrc.sbs/embed/movie/${tmdbId}`,
  },
  {
    name: "VixSrc",
    buildMovieUrl: ({ tmdbId }) => `https://vixsrc.to/movie/${tmdbId}`,
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
