"use client";

import React, { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { useAppContext } from "@/context/AppContext";
import {
  Bookmark,
  Star,
  Clock,
  Calendar,
  ArrowLeft,
  Tv,
  Film,
} from "lucide-react";
import Image from "next/image";
import axios from "axios";
import ShowEp from "@/components/ShowEp";
export interface ShowDetails {
  id: number;
  imdb_id: string;
  name: string;
  original_name: string;
  title: string;
  overview: string;
  poster_path: string;
  backdrop_path: string;
  vote_average: number;
  first_air_date: string;
  release_date: string;
  episode_run_time: number[];
  runtime: number;
  genres: { id: number; name: string }[];
  number_of_episodes: number;
  number_of_seasons: number;
  media_type: "movie" | "tv";
  status: string;
  tagline: string;
  seasons: {
    id: number;
    name: string;
    poster_path: string;
    air_date: string;
    episode_count: number;
    season_number: number;
    overview: string;
  }[];
  crew: { id: number; name: string; job: string }[];
  credits: {
    cast: {
      id: number;
      name: string;
      character: string;
      profile_path: string;
    }[];
  };
  cast: { id: number; name: string; character: string; profile_path: string }[];
  networks: { id: number; name: string; logo_path: string }[];
  production_companies: { id: number; name: string; logo_path: string }[];
}

function mapShowDetailsToShow(showDetails: ShowDetails) {
  return {
    id: showDetails.id,
    title: showDetails.title,
    name: showDetails.name,
    original_name: showDetails.original_name,
    poster_path: showDetails.poster_path,
    vote_average: showDetails.vote_average,
    media_type: showDetails.media_type,
  };
}

const ShowPage = () => {
  const { id } = useParams();
  const searchParams = useSearchParams();
  const type = searchParams.get("type");
  const { bookmarkedShows, toggleBookmark } = useAppContext();
  const [showDetails, setShowDetails] = useState<ShowDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchShowDetails = async () => {
      if (id && type) {
        try {
          setIsLoading(true);
          const response = await axios.get(
            `https://api.themoviedb.org/3/${type}/${id}`,
            {
              params: {
                api_key: process.env.NEXT_PUBLIC_API_KEY,
                language: "en-US",
                append_to_response: "credits",
              },
            }
          );
          setShowDetails(response.data);
        } catch (error) {
          console.error("Error fetching show details:", error);
        } finally {
          setIsLoading(false);
        }
      }
    };
    fetchShowDetails();
  }, [id, type]);

  const handleBack = () => {
    window.history.back();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-950">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!showDetails) {
    return <div className="text-white text-center mt-10">Show not found</div>;
  }

  const isMovie = type === "movie";

  return (
    <div className="min-h-screen w-full bg-gray-950">
      <div className="min-h-screen bg-gray-950 text-white w-full lg:px-5 lg:w-4/5 mx-auto relative">
        <button
          onClick={handleBack}
          className="fixed top-6 left-6 bg-zinc-700/40 backdrop-blur hover:bg-gray-500 p-2.5 size-11 rounded-full z-20 transition duration-300 ease-in-out group"
        >
          <ArrowLeft className="text-white group-hover:-translate-x-0.5 transition-transform" size={24} />
        </button>
        <div className="relative h-[40vh] sm:h-[45vh] md:h-[55vh] lg:h-[70vh]">
          <Image
            src={`https://image.tmdb.org/t/p/original${showDetails.backdrop_path}`}
            alt={showDetails.name || showDetails.title}
            layout="fill"
            objectFit="cover"
            className="opacity-40"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/80 to-gray-950/20" />
        </div>
        <div className="container mx-auto px-4 pb-8 -mt-32 relative z-10">
          <div className="flex flex-col md:flex-row gap-8">
            <div className="w-full md:w-1/3 lg:w-1/4">
              <div className="relative group">
                <Image
                  src={`https://image.tmdb.org/t/p/w500${showDetails.poster_path}`}
                  alt={showDetails.name || showDetails.title}
                  width={300}
                  height={550}
                  className="rounded-xl shadow-2xl mx-auto transition duration-300 group-hover:shadow-blue-500/20 group-hover:shadow-2xl"
                  priority
                />
                <div className="absolute inset-0 rounded-xl bg-gradient-to-t from-gray-950/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition duration-300" />
              </div>
            </div>
            <div className="w-full md:w-2/3 lg:w-3/4">
              <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                {showDetails.name || showDetails.title}
              </h1>
              {showDetails.tagline && (
                <p className="text-xl text-gray-400 mb-4 italic">
                  &quot;{showDetails.tagline}&quot;
                </p>
              )}
              <div className="flex flex-wrap items-center gap-4 mb-6">
                <div className="flex items-center bg-gray-800/60 backdrop-blur rounded-full px-4 py-1.5 hover:bg-gray-700 transition duration-300">
                  <Star className="text-yellow-400 mr-2" size={18} />
                  <span>{showDetails.vote_average.toFixed(1)}</span>
                </div>
                <div className="flex items-center bg-gray-800/60 backdrop-blur rounded-full px-4 py-1.5 hover:bg-gray-700 transition duration-300">
                  <Clock className="mr-2" size={18} />
                  <span>
                    {isMovie
                      ? `${showDetails.runtime} min`
                      : `${showDetails.episode_run_time?.[0] || "N/A"} min/ep`}
                  </span>
                </div>
                <div className="flex items-center bg-gray-800/60 backdrop-blur rounded-full px-4 py-1.5 hover:bg-gray-700 transition duration-300">
                  <Calendar className="mr-2" size={18} />
                  <span>
                    {new Date(
                      showDetails.first_air_date || showDetails.release_date
                    ).getFullYear()}
                  </span>
                </div>
                {!isMovie && (
                  <div className="flex items-center bg-gray-800/60 backdrop-blur rounded-full px-4 py-1.5 hover:bg-gray-700 transition duration-300">
                    <Tv className="mr-2" size={18} />
                    <span>
                      {showDetails.number_of_seasons} Season
                      {showDetails.number_of_seasons !== 1 ? "s" : ""}
                    </span>
                  </div>
                )}
                {!isMovie && (
                  <div className="flex items-center bg-gray-800/60 backdrop-blur rounded-full px-4 py-1.5 hover:bg-gray-700 transition duration-300">
                    <Film className="mr-2" size={18} />
                    <span>
                      {showDetails.number_of_episodes} Episode
                      {showDetails.number_of_episodes !== 1 ? "s" : ""}
                    </span>
                  </div>
                )}
              </div>
              <div className="w-full my-6 max-w-64 flex gap-4">
                {type === "movie" && (
                  <div className="flex flex-wrap items-center gap-3">
                    {[
                      {
                        label: "Watch Now",
                        url: `https://vidsrc.online/embed/movie/${showDetails.imdb_id}`,
                        primary: true,
                      },
                      {
                        label: "Server 2",
                        url: `https://vidsrc.fyi/embed/movie/${showDetails.imdb_id}`,
                      },
                      {
                        label: "Server 3",
                        url: `https://vidsrc.cc/v2/embed/movie/${showDetails.imdb_id}`,
                      },
                      {
                        label: "Server 4",
                        url: `https://vidsrc.wiki/embed/movie/${showDetails.id}`,
                      },
                    ].map((server) => (
                      <a
                        key={server.label}
                        href={server.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={
                          server.primary
                            ? "bg-red-600 hover:bg-red-700 text-white px-8 py-2.5 rounded-full flex items-center gap-3 transition duration-300 ease-in-out shadow-lg hover:shadow-red-500/20 group"
                            : "bg-white/10 hover:bg-white/20 text-white px-5 py-2.5 rounded-full flex items-center gap-2 transition duration-300 ease-in-out border border-white/10"
                        }
                      >
                        <Film
                          size={server.primary ? 20 : 18}
                          className={server.primary ? "group-hover:scale-110 transition-transform" : ""}
                        />
                        {server.label}
                      </a>
                    ))}
                  </div>
                )}
                <button
                  onClick={() => toggleBookmark(mapShowDetailsToShow(showDetails))}
                  className="bg-blue-600 hover:bg-blue-700 rounded-full p-2.5 transition duration-300 ease-in-out shadow-lg hover:shadow-blue-500/20 group"
                >
                  <Bookmark
                    size={20}
                    className={`${
                      bookmarkedShows.some((show) => show.id === showDetails.id)
                        ? "fill-current text-white"
                        : "text-white"
                    } group-hover:scale-110 transition-transform`}
                  />
                </button>
              </div>
              <p className="text-lg mb-8 text-gray-300 leading-relaxed">{showDetails.overview}</p>
              <div>
               <ShowEp showDetails={showDetails} />
              </div>
              <div className="mb-8">
                <h2 className="text-2xl font-semibold mb-4 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">Cast</h2>
                <div className="flex overflow-x-auto gap-4 pb-4 scrollbar-hide">
                  {showDetails.credits.cast
                    .slice(0, 10)
                    .map((actor) => (
                      <div key={actor.id} className="flex-shrink-0 w-28 group">
                        <div className="relative">
                          <Image
                            src={
                              actor.profile_path
                                ? `https://image.tmdb.org/t/p/w185${actor.profile_path}`
                                : "/placeholder.png"
                            }
                            alt={actor.name}
                            width={112}
                            height={168}
                            className="rounded-lg mb-2 transition duration-300 group-hover:scale-105"
                          />
                          <div className="absolute inset-0 rounded-lg bg-gradient-to-t from-gray-950/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition duration-300" />
                        </div>
                        <p className="text-sm font-medium truncate">{actor.name}</p>
                        <p className="text-xs text-gray-400 truncate">
                          {actor.character}
                        </p>
                      </div>
                    ))}
                </div>
              </div>
              <div className="mb-8">
                <h2 className="text-2xl font-semibold mb-4 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">Genres</h2>
                <div className="flex flex-wrap gap-2">
                  {showDetails.genres.map((genre) => (
                    <span
                      key={genre.id}
                      className="bg-gray-800/60 backdrop-blur hover:bg-gray-700 rounded-full px-4 py-1.5 text-sm transition duration-300"
                    >
                      {genre.name}
                    </span>
                  ))}
                </div>
              </div>
              {showDetails.networks && showDetails.networks.length > 0 && (
                <div className="mb-6">
                  <h2 className="text-2xl font-semibold mb-2">Network</h2>
                  <div className="flex items-center gap-4">
                    {showDetails.networks.map((network) => (
                      <div key={network.id} className="bg-white rounded-lg p-2">
                        <Image
                          src={`https://image.tmdb.org/t/p/w92${network.logo_path}`}
                          alt={network.name}
                          width={92}
                          height={46}
                          objectFit="contain"
                          style={{ width: "auto", height: "auto" }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div>
                <h2 className="text-2xl font-semibold mb-2">
                  Production Companies
                </h2>
                <div className="flex flex-wrap items-center gap-4">
                  {showDetails.production_companies.map((company) =>
                    company.logo_path ? (
                      <div key={company.id} className="bg-white rounded-lg p-2">
                        <Image
                          src={`https://image.tmdb.org/t/p/w92${company.logo_path}`}
                          alt={company.name}
                          width={92}
                          height={46}
                          objectFit="contain"
                          style={{ width: "auto", height: "auto" }}
                        />
                      </div>
                    ) : (
                      <span
                        key={company.id}
                        className="bg-gray-700 rounded-full px-3 py-1 text-sm"
                      >
                        {company.name}
                      </span>
                    )
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShowPage;
