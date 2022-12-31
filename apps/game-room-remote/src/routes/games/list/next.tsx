import { ActionArgs, json } from "@remix-run/node"
import collectionDefinitions from "../../../api/collections.server"
import fetchGameCollections from "../../../api/fetchGameCollection.server"
import type { GameCollectionDefinition } from "../../../GameCollection"

export const action = async (args: ActionArgs) => {
  if (args.request.method === "POST") {
    const formData = await args.request.formData()
    const { collectionName, currentPage } = Object.fromEntries(formData)
    const collectionDefinition = collectionDefinitions.find(
      ({ name }) => name === collectionName.toString(),
    ) as GameCollectionDefinition
    const pageNumber = parseInt(currentPage.toString())
    collectionDefinition.currentViewIndex = pageNumber
    collectionDefinition.countPerView = 7

    const [collection] = await fetchGameCollections([collectionDefinition])

    return json({ games: collection.games })
  }

  return json({ games: [] })
}
