import { Descriptions } from 'antd'
import AccountIcon from '../AccountIcon'

import Link from 'next/link'
import dynamic from 'next/dynamic'
import animalHash from 'angry-purple-tiger'
import Client, { Network } from '@helium/http'

import { formatLocation } from '../Hotspots/utils'
import { Balance, CurrencyType } from '@helium/currency'

const AssertLocationMapbox = dynamic(() => import('../AssertLocationMapbox'), {
  ssr: false,
  loading: () => <span style={{ height: '600px' }} />,
})

const AssertLocationV1 = ({ txn }) => {
  const stakingFeeObject = new Balance(
    txn.stakingFee.integerBalance,
    CurrencyType.dataCredit,
  )
  const stakingFeePayer =
    txn.payer === txn.owner || txn.payer === null ? txn.owner : txn.payer

  const feeObject = new Balance(txn.fee.integerBalance, CurrencyType.dataCredit)

  const makerName = txn.makerInfo

  return (
    <>
      <AssertLocationMapbox txn={txn} />
      <Descriptions bordered>
        <Descriptions.Item label="Hotspot" span={3}>
          <Link href={`/hotspots/${txn.gateway}`}>
            <a>{animalHash(txn.gateway)}</a>
          </Link>
        </Descriptions.Item>
        <Descriptions.Item label="Owner" span={3}>
          <div className="flex flex-row items-center justify-start">
            <AccountIcon address={txn.owner} className="mr-2" />
            <Link href={`/accounts/${txn.owner}`}>
              <a>{txn.owner}</a>
            </Link>
          </div>
        </Descriptions.Item>
        <Descriptions.Item label="Location" span={3}>
          {formatLocation(txn.geocode)}
        </Descriptions.Item>
        <Descriptions.Item label="Latitude" span={3}>
          {txn.lat}
        </Descriptions.Item>
        <Descriptions.Item label="Longitude" span={3}>
          {txn.lng}
        </Descriptions.Item>
        <Descriptions.Item label="Nonce" span={3}>
          {txn.nonce}
        </Descriptions.Item>
        <Descriptions.Item label="Fee" span={3}>
          {feeObject.toString()}
        </Descriptions.Item>
        <Descriptions.Item label="Staking Fee" span={3}>
          {stakingFeeObject.toString()}
        </Descriptions.Item>
        <Descriptions.Item label="Staking Fee Payer Address" span={3}>
          <span className="flex flex-col items-start justify-center">
            <span className="flex flex-row items-center justify-start">
              <AccountIcon className="mr-2" address={stakingFeePayer} />
              <Link href={`/accounts/${stakingFeePayer}`}>
                <a>{stakingFeePayer}</a>
              </Link>
            </span>
          </span>
        </Descriptions.Item>
        <Descriptions.Item label="Staking Fee Payer" span={6}>
          {makerName}
        </Descriptions.Item>
      </Descriptions>
    </>
  )
}

export default AssertLocationV1
