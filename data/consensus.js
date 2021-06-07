import useSWR from 'swr'
import Client, { Network } from '@helium/http'

export const fetchElections = async () => {
  const client = new Client(new Network({baseURL: 'http://api.cfidev.org', version: 1}))
  const list = await client.elections.list()
  const elections = await list.take(20)

  // TODO: convert this to helium-js
  const res = await fetch(`https://api.cfidev.org/v1/hotspots/elected`)
  const currentConsensusGroup = await res.json()

  return {
    recentElections: elections,
    currentElection: currentConsensusGroup.data,
  }
}

export const useElections = (initialData) => {
  const { data, error } = useSWR('consensusGroups', fetchElections, {
    initialData,
    refreshInterval: 10000,
  })
  return {
    consensusGroups: data,
    isLoading: !error && !data,
    isError: error,
  }
}
