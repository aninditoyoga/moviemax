import { ShowDetails } from '@/app/show/[id]/page'
import { ArrowRight } from 'lucide-react'
import React, { useState } from 'react'
import Image from 'next/image'

export default function ShowEp({showDetails }: {showDetails: ShowDetails}) {
  const [openSeasonIndex, setOpenSeasonIndex] = useState<number | null>(null);
  
  return (
    <div className="mt-6 max-h-[500px] overflow-y-auto mb-5">
    {showDetails.seasons?.map((season, index) => (
      <div key={index} className="flex flex-col justify-between mb-4 w-full">
        <a
          onClick={() => setOpenSeasonIndex(openSeasonIndex === index ? null : index)}
          className="flex justify-between items-center group w-full lg:w-1/2 hover:bg-gray-800 rounded-md p-4 transition duration-300 ease-in-out cursor-pointer"
        >
          <div className="flex items-center gap-3">
          <div
            className="relative w-16 h-9 mr-4 bg-gray-800 rounded-md overflow-hidden"
          >
            <Image
              src={`https://image.tmdb.org/t/p/w500${season.poster_path}`}
              alt={season.name}
              className="absolute inset-0 object-cover opacity-50 group-hover:opacity-100"
              fill
            />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-semibold group-hover:text-blue-500">
              {season.name}
            </span>
            <span className="text-sm text-gray-500">
              {season.episode_count} Episode
              {season.episode_count !== 1 ? "s" : ""}
            </span>
          </div>
          </div>
          <div>
            <ArrowRight size={20} className={`transform transition-transform duration-300 ${openSeasonIndex === index ? 'rotate-90' : ''}`}/>
          </div>
        </a>
        <div className={`flex justify-center flex-wrap gap-2 mt-4 transition-all duration-300 ${openSeasonIndex === index ? 'flex' : 'hidden'}`}>
          {
            [...new Array(season.episode_count)].map((_, episodeIndex) => (
              <button
                key={episodeIndex}
                className="bg-gray-800 hover:bg-gray-500 py-2 px-4 rounded-full m-2 transition duration-300 ease-in-out"
                onClick={() =>
                  window.open(
                    `/api/watch/tv/${showDetails.id}?imdbId=${showDetails.imdb_id}&season=${season?.season_number}&episode=${episodeIndex + 1}`,
                    "_blank"
                  )
                }
              >
                Episode {episodeIndex + 1}
              </button>
            ))
          }
        </div>
      </div>
    ))}
  </div>

  )
}
