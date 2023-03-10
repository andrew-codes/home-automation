import { gql } from "@ha/graph-types"
import { useQuery } from "@apollo/client"
import Layout from "../components/Layout"
import Text from "../components/Text"

const query = gql(/* GraphQL */ `
  query AreasPageQuery {
    areas {
      name
    }
  }
`)

const Areas = () => {
  const { loading, data } = useQuery(query)

  console.log(loading, data)

  return <h1>Hello {data?.areas.map((area) => area.name).join(",")}</h1>
}

export default Areas
