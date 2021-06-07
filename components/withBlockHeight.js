import React from 'react'
import Client, { Network } from '@helium/http'

const withBlockHeight = (WrappedComponent) => {
  class BlockHeight extends React.Component {
    state = {
      height: 0,
      heightLoading: true,
    }

    componentDidMount() {
      this.client = new Client(new Network({baseURL: 'https://api.cfidev.org', version: 1}))
      this.loadBlockHeight()
      window.setInterval(this.loadBlockHeight, 25000)
    }

    loadBlockHeight = async () => {
      try {
        const blockHeight = await this.client.blocks.getHeight()
        this.setState({ height: blockHeight, heightLoading: false })
      } catch (err) {
        console.log(err)
      }
    }

    render() {
      const { height, heightLoading } = this.state

      return (
        <WrappedComponent
          {...this.props}
          height={height}
          heightLoading={heightLoading}
        />
      )
    }
  }

  return BlockHeight
}

export default withBlockHeight
