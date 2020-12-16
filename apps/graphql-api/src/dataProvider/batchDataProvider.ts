import createDebugger from "debug"
import DataLoader from "dataloader"
import { isEmpty } from "lodash"
import { get } from "lodash/fp"
import { Domain, DomainQuery, DomainResults } from "../Domain"
import { equality } from "../filter"
import { IProvideData } from "./DataProvider"

const debug = createDebugger("@ha/graphql-api/batchDataProvider")

const createDataProvider = (dataProvider: IProvideData): IProvideData => {
  const createBatchFn = (q: DomainQuery<Domain>) => {
    const batchIds = async (
      ids: readonly string[]
    ): Promise<DomainResults[Domain][]> => {
      try {
        const results = await dataProvider.query({
          from: q.from,
          filters: ids.map((id) => equality("id", id)),
        })
        return results
      } catch (e) {
        console.log(e)
        return []
      }
    }
    return new DataLoader(batchIds)
  }
  const query = async (
    q: DomainQuery<Domain>
  ): Promise<DomainResults[Domain][]> => {
    const batch = createBatchFn(q)
    try {
      if (
        !isEmpty(q.filters) &&
        q.filters?.reduce(
          (acc, filter) => acc && filter.attribute === "id",
          true
        )
      ) {
        if (q.filters.length > 1) {
          return batch.loadMany(q.filters.map(get("value")))
        }
        const results = await batch.load(q.filters[0].value)
        return [results]
      }

      return dataProvider.query(q)
    } catch (e) {
      // debug(e)
      return [{ id: "Null", name: "Null" }]
    }
  }
  return {
    query,
  }
}

export { createDataProvider }
