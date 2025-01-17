import React, { Component } from 'react'
import { Table, Typography } from 'antd'
import Timestamp from 'react-timestamp'
import Client, { Network } from '@helium/http'
import LoadMoreButton from './LoadMoreButton'
const { Text } = Typography
import Link from 'next/link'

class BlocksList extends Component {
  state = {
    blocks: [],
    loading: true,
  }

  async componentDidMount() {
    const client = new Client(new Network({baseURL: 'https://api.cfidev.org', version: 1}))
    this.list = await client.blocks.list()
    this.loadBlocks()
  }

  loadBlocks = async () => {
    const { pageSize = 20 } = this.props
    this.setState({ loading: true })
    const { blocks } = this.state
    const newBlocks = await this.list.take(pageSize)
    this.setState({ blocks: [...blocks, ...newBlocks], loading: false })
  }

  render() {
    const { blocks, loading } = this.state
    const { showButton = true } = this.props

    const columns = [
      {
        title: 'Height',
        dataIndex: 'height',
        key: 'height',
        render: (height) => (
          <Link href={`/blocks/${height}`}>
            <a style={{ fontWeight: '600' }}>{height.toLocaleString()}</a>
          </Link>
        ),
      },
      {
        title: 'Timestamp',
        dataIndex: 'time',
        key: 'time',
        render: (time) => <Timestamp date={time} />,
      },
      {
        title: 'Transactions',
        dataIndex: 'transactionCount',
        key: 'transaction_count',
      },
      {
        title: 'Hash',
        dataIndex: 'hash',
        key: 'hash',
        render: (hash) => <Text code>{hash}</Text>,
      },
    ]

    return (
      <>
        <Table
          dataSource={blocks}
          columns={columns}
          rowKey="hash"
          pagination={false}
          loading={loading}
          scroll={{ x: true }}
          size="small"
        />
        {showButton && <LoadMoreButton onClick={this.loadBlocks} />}
      </>
    )
  }
}

export default BlocksList
