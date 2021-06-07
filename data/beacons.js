import useSWR from 'swr'
import Client, { Network } from '@helium/http'

export const fetchLatestBeacons = (count = 100) => async () => {
  const client = new Client(Network.staging)
  const beacons = await (await client.challenges.list()).take(count)

  return JSON.parse(JSON.stringify(beacons))
}

export const fetchBeacon = async (hash) => {
  const client = new Client(new Network({baseURL: 'http://api.cfidev.org', version: 1}))
  const beacon = await client.transactions.get(hash)

  return JSON.parse(JSON.stringify(beacon))
}

export const useLatestBeacons = (initialData, count = 100) => {
  const { data, error } = useSWR('latestBeacons', fetchLatestBeacons(count), {
    initialData,
    refreshInterval: 10000,
  })
  return {
    latestBeacons: data,
    isLoading: !error && !data,
    isError: error,
  }
}
