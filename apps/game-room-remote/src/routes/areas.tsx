import { gql } from "../generated"
import { useQuery } from "@apollo/client"
import styled from "styled-components"
import { Outlet } from "@remix-run/react"
import Layout from "../components/Layout"
import Text from "../components/Text"
import NavigationLink from "../components/NavigationLink"
import Navigation from "../components/Navigation"
import { json, LoaderArgs } from "@remix-run/node"
import useLoaderData from "../useLoaderData"

const query = gql(/* GraphQL */ `
  query Areas {
    areas {
      id
      name
    }
  }
`)

const Main = styled.div`
  margin: 24px;
`

const loader = async (args: LoaderArgs) => {
  const areaId = args.params.areaId

  return json({ cdnHost: process.env.GAMING_ASSETS_WEB_HOST ?? "" })
}

const Areas = () => {
  const { cdnHost } = useLoaderData()

  const { loading, data } = useQuery(query)

  return (
    <Layout>
      <Navigation cdnHost={cdnHost}>
        {data?.areas.map((area) => (
          <NavigationLink key={area.id} href={`/areas/${area.id}`}>
            <Text>{area.name}</Text>
          </NavigationLink>
        ))}
      </Navigation>
      <Main>
        <Outlet />
      </Main>
    </Layout>
  )
}

export default Areas
export { loader }
