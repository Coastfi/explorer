import animalHash from 'angry-purple-tiger'
import Client, { Network } from '@helium/http'
import { Balance, CurrencyType } from '@helium/currency'
import { fromUnixTime } from 'date-fns'
import { getMakerName } from '../../components/Makers/utils'

const getFee = async ({ height, fee }, convertFee) => {
  if (!fee) {
    return 0
  }

  if (convertFee) {
    const client = new Client(new Network({baseURL: 'https://api.cfidev.org', version: 1}))
    const { price: oraclePrice } = await client.oracle.getPriceAtBlock(height)
    const dcBalance = new Balance(fee.integerBalance, CurrencyType.dataCredit)
    const output = dcBalance
      .toNetworkTokens(oraclePrice)
      .toString(8)
      .slice(0, -4)
    return output
  }

  return fee.integerBalance
}

const formatMultiplePayeesString = (payments) => {
  return payments.map((p) => p.payee).join(', ')
}

const parse = async (ownerAddress, txn, opts = { convertFee: true }) => {
  switch (txn.type) {
    case 'rewards_v1': {
      return txn.rewards.map(({ type, gateway, amount }) => {
        const amountObject = new Balance(
          amount.integerBalance,
          CurrencyType.networkToken,
        )
        return {
          'Received Quantity': amountObject.toString(8).slice(0, -4),
          'Received From': 'Helium Network',
          'Received Currency': 'HNT',
          Tag: 'mined',
          Hotspot: gateway ? animalHash(gateway) : '',
          'Reward Type': type,
        }
      })
    }
    case 'rewards_v2': {
      return txn.rewards.map(({ type, gateway, amount }) => {
        const amountObject = new Balance(
          amount.integerBalance,
          CurrencyType.networkToken,
        )
        return {
          'Received Quantity': amountObject.toString(8).slice(0, -4),
          'Received From': 'Helium Network',
          'Received Currency': 'HNT',
          Tag: 'mined',
          Hotspot: gateway ? animalHash(gateway) : '',
          'Reward Type': type,
        }
      })
    }
    case 'payment_v1': {
      const amountObject = new Balance(
        txn.amount.integerBalance,
        CurrencyType.networkToken,
      )
      const fromMe = ownerAddress === txn.payer
      const type = fromMe ? 'Sent' : 'Received'
      return {
        [`${type} Quantity`]: amountObject.toString(8).slice(0, -4),
        [`${type} ${fromMe ? 'To' : 'From'}`]: txn.payee,
        [`${type} Currency`]: 'HNT',
        Tag: 'payment',
        feePaid: fromMe,
      }
    }
    case 'payment_v2': {
      if (ownerAddress === txn.payer) {
        const amountObject = new Balance(
          txn.totalAmount.integerBalance,
          CurrencyType.networkToken,
        )
        return {
          'Sent Quantity': amountObject.toString(8).slice(0, -4),
          'Sent To':
            txn.payments.length === 1
              ? txn.payments[0].payee
              : formatMultiplePayeesString(txn.payments),
          'Sent Currency': 'HNT',
          Tag: 'payment',
          feePaid: true,
        }
      } else {
        const amountObject = new Balance(
          txn.payments.find(
            (p) => p.payee === ownerAddress,
          ).amount.integerBalance,
          CurrencyType.networkToken,
        )
        return {
          'Received Quantity': amountObject.toString(8).slice(0, -4),
          'Received From': txn.payer,
          'Received Currency': 'HNT',
          Tag: 'payment',
        }
      }
    }
    case 'transfer_hotspot_v1': {
      const amountToSellerObject = new Balance(
        txn.amountToSeller.integerBalance,
        CurrencyType.networkToken,
      )
      if (ownerAddress === txn.buyer) {
        return {
          'Sent Quantity': amountToSellerObject.toString().slice(0, -4),
          'Sent To': txn.seller,
          'Sent Currency': 'HNT',
          Tag: 'payment',
          Note: 'gateway transfer payment',
          feePaid: true,
        }
      } else {
        return {
          'Received Quantity': amountToSellerObject.toString().slice(0, -4),
          'Received From': txn.buyer,
          'Received Currency': 'HNT',
          Tag: 'payment',
          Note: 'gateway transfer payment',
        }
      }
    }
    case 'add_gateway_v1': {
      const paidByHotspotOwner = txn.owner === txn.payer
      // the above logic check could also be done by using:
      // !(await isMakerAddress(txn.payer))
      // but this seems more efficient for now
      return {
        'Sent Quantity': paidByHotspotOwner
          ? await getFee(
              {
                height: txn.height,
                fee: txn.stakingFee,
              },
              opts.convertFee,
            )
          : 0,
        'Sent To': paidByHotspotOwner ? 'Helium Network' : '',
        'Sent Currency': opts.convertFee ? 'HNT' : 'DC',
        Tag: 'payment',
        Note: `assert location payment (paid by ${
          paidByHotspotOwner ? 'Hotspot owner' : await getMakerName(txn.payer)
        })`,
        feePaid: paidByHotspotOwner,
      }
    }
    case 'assert_location_v1': {
      const paidByHotspotOwner = txn.owner === txn.payer
      return {
        'Sent Quantity': paidByHotspotOwner
          ? await getFee(
              {
                height: txn.height,
                fee: txn.stakingFee,
              },
              opts.convertFee,
            )
          : 0,
        'Sent To': paidByHotspotOwner ? 'Helium Network' : '',
        'Sent Currency': opts.convertFee ? 'HNT' : 'DC',
        Tag: 'payment',
        Note: `assert location payment (paid by ${
          paidByHotspotOwner ? 'Hotspot owner' : await getMakerName(txn.payer)
        })`,
        feePaid: paidByHotspotOwner,
      }
    }
    case 'assert_location_v2': {
      const paidByHotspotOwner = txn.owner === txn.payer
      return {
        'Sent Quantity': paidByHotspotOwner
          ? await getFee(
              {
                height: txn.height,
                fee: txn.stakingFee,
              },
              opts.convertFee,
            )
          : 0,
        'Sent To': paidByHotspotOwner ? 'Helium Network' : '',
        'Sent Currency': opts.convertFee ? 'HNT' : 'DC',
        Tag: 'payment',
        Note: `assert location payment (paid by ${
          paidByHotspotOwner ? 'Hotspot owner' : await getMakerName(txn.payer)
        })`,
        feePaid: paidByHotspotOwner,
      }
    }
    default: {
      return null
    }
  }
}

export const parseTxn = async (
  ownerAddress,
  txn,
  opts = { convertFee: true },
) => {
  const data = await parse(ownerAddress, txn, opts)
  if (!data) {
    return data
  }

  const timestamp = fromUnixTime(txn.time).toISOString()
  const addDefaults = async ({ feePaid = false, ...parsed }) => ({
    Date: timestamp,
    'Received Quantity': '',
    'Received From': '',
    'Received Currency': '',
    'Sent Quantity': '',
    'Sent To': '',
    'Sent Currency': '',
    'Fee Amount': feePaid ? await getFee(txn, opts.convertFee) : 0,
    'Fee Currency': opts.convertFee ? 'HNT' : 'DC',
    Tag: '',
    Note: '',
    Hotspot: txn.gateway ? animalHash(txn.gateway) : '',
    'Reward Type': '',
    Block: txn.height,
    Hash: txn.hash,
    ...parsed,
  })

  return Array.isArray(data)
    ? Promise.all(data.map(addDefaults))
    : addDefaults(data)
}
