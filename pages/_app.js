import Router from 'next/router'
import withGA from 'next-ga'

import '../styles/index.css'
import '../styles/Explorer.css'

import NProgress from 'nprogress' //nprogress module
import 'nprogress/nprogress.css' //styles of nprogress

//Binding events.
Router.events.on('routeChangeStart', () => NProgress.start())
Router.events.on('routeChangeComplete', () => NProgress.done())
Router.events.on('routeChangeError', () => NProgress.done())

import { useEffect, useState } from 'react'
import { Container } from 'next/app'
import BetaBannerContext from '../components/BetaBanner/BannerContext'

function MyApp({ Component, pageProps }) {
  const [showBetaBanner, setBetaBanner] = useState(false)
  const toggleBetaBanner = () => setBetaBanner((prevState) => !prevState)

  useEffect(() => {
    const PERCENT_OF_USERS_TO_SHOW_BANNER_TO = 25
    if (Math.random() * 100 <= PERCENT_OF_USERS_TO_SHOW_BANNER_TO) {
      setBetaBanner(true)
    }
  }, [])
  return (
    // this #app div is used to increase the specificity of Tailwind's utility classes, making it easier to override styles without resorting to !important
    <div id="app">
      <Container>
        <BetaBannerContext.Provider
          value={{ showBetaBanner, toggleBetaBanner }}
        >
          <Component {...pageProps} />
        </BetaBannerContext.Provider>
        <script src="https://0m1ljfvm0g6j.statuspage.io/embed/script.js"></script>
      </Container>
    </div>
  )
}

// Only uncomment this method if you have blocking data requirements for
// every single page in your application. This disables the ability to
// perform automatic static optimization, causing every page in your app to
// be server-side rendered.
//
// MyApp.getInitialProps = async (appContext) => {
//   // calls page's `getInitialProps` and fills `appProps.pageProps`
//   const appProps = await App.getInitialProps(appContext);
//
//   return { ...appProps }
// }

export default withGA('UA-00000000-1', Router)(MyApp)