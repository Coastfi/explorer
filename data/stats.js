import useSWR from 'swr'
import Client, { Network } from '@helium/http'

export const fetchStats = async () => {
  const client = new Client(new Network({baseURL: 'https://api.cfidev.org', version: 1}))
  const stats = await client.stats.get()

  return {
    circulatingSupply: stats.tokenSupply,
    blockTime: stats.blockTimes.lastDay.avg,
    blockTimes: stats.blockTimes,
    challenges: stats.counts.challenges,
    consensusGroups: stats.counts.consensusGroups,
    electionTime: stats.electionTimes.lastDay.avg,
    electionTimes: stats.electionTimes,
    totalHotspots: stats.counts.hotspots,
    totalBlocks: stats.counts.blocks,
    totalCities: stats.counts.cities,
    totalCountries: stats.counts.countries,
  }
}

export const useStats = (initialData) => {
  const { data, error } = useSWR('stats', fetchStats, {
    initialData,
    refreshInterval: 10000,
  })
  return {
    stats: data,
    isLoading: !error && !data,
    isError: error,
  }
}

export const fetchCitiesByOnline = async () => {
  const citiesResOnline = await fetch(
    'https://api.cfidev.org/v1/cities?order=online_count',
  )
  const { data } = await citiesResOnline.json()
  return JSON.parse(JSON.stringify(data))
}

export const fetchCitiesByTotal = async () => {
  const citiesResTotal = await fetch(
    'https://api.cfidev.org/v1/cities?order=hotspot_count',
  )
  const { data } = await citiesResTotal.json()
  return JSON.parse(JSON.stringify(data))
}
