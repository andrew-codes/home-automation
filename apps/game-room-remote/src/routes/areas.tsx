import { gql } from "@ha/graph-types"
import { useQuery } from "@apollo/client"
import Layout from "../components/Layout"
import Text from "../components/Text"

const query = gql(/* GraphQL */ `
  query areas {
    completionStates {
      id
      name
    }

    areas {
      id
      name

      activity {
        id
        isLaunching
        isRunning
        release {
          game {
            id
            name
            coverImage
          }
        }
      }

      platforms {
        releases {
          game {
            id
            name
            coverImage
            backgroundImage
          }
          description
          id
          lastActivity
          platform {
            name
            id
          }
          playTime
          releaseDate
          releaseYear
          playCount
          criticScore
          communityScore
          completionState {
            name
            id
          }
        }
      }
    }
  }
`)

const Areas = () => {
  const { loading, data } = useQuery(query)

  console.log(loading, data)

  return <h1>Hello</h1>
}

export default Areas
