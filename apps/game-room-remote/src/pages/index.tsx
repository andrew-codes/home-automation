import React, { useEffect } from "react"
import Layout from "../components/Layout"

// export const getStaticProps = wrapper.getStaticProps(store => ({ preview }) => {
//   console.log('2. Page.getStaticProps uses the store to dispatch things');
//   store.dispatch({
//     type: 'TICK',
//     payload: 'was set in other page ' + preview,
//   });
// });

// const getInitialProps = async ({
//   store,
//   pathname,
//   query,
//   req
// }: NextPageContext) => {
//   console.log("2. Page.getInitialProps uses the store to dispatch things", {
//     pathname,
//     query
//   });

// if (req) {
//   // All async actions must be await'ed
//   await store.dispatch({ type: "PAGE", payload: "server" });

//   // Some custom thing for this particular page
//   return { pageProp: "server" };
// }

// // await is not needed if action is synchronous
// store.dispatch({ type: "PAGE", payload: "client" });

// // Some custom thing for this particular page
// return { pageProp: "client" };
// }

function Index() {
  // const s = useSelector<State, State>(state => state);
  // console.log(s)
  // const dispatch = useDispatch()

  // useEffect(() => {
  //   dispatch({
  //     type: "SOCKET/CONNECT", payload: {
  //       socketUrl: "ws://localhost:53924/api/socket",
  //       eventHandlers: {
  //         onError: (...args) => {
  //           console.log(args)
  //           return { type: "SOCKET/ERROR", payload: args.toString() }
  //         },
  //         onMessage: (...args) => {
  //           console.log(args)
  //           return { type: "SOCKET/MESSAGE", payload: args.toString() }
  //         },
  //         onClose: (...args) => {
  //           console.log(args)
  //         },
  //         onOpen: (...args) => {
  //           console.log(args)
  //         },
  //       }
  //     }
  //   })
  // }, [dispatch])

  return (
    <Layout>
      <h1>Welcome</h1>
    </Layout>
  )
}

export default Index