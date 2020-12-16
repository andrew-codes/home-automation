import { isEmpty } from "lodash"
import { Domain, DomainResults } from "../../Domain"
import { FilterDefinition } from "../../filter/filter"
import { UnSupportedFilters } from "../Errors"

const filterHandlers = {
  equality: <TDomain extends Domain>(
    f: FilterDefinition,
    value: DomainResults[TDomain]
  ): boolean => {
    const assetValue = value[f.attribute]
    if (f.negation) {
      if (Array.isArray(f.value)) {
        return !f.value.includes(assetValue)
      }
      return assetValue !== f.value
    }
    if (Array.isArray(f.value)) {
      return f.value.includes(assetValue)
    }
    return assetValue === f.value
  },
}

const createFilterApplicator = <TDomain extends Domain>(
  filters: Array<FilterDefinition> | undefined
) => (items: Array<DomainResults[TDomain]>) =>
  items.filter((item) => {
    if (!filters || isEmpty(filters)) {
      return true
    }
    const unsupportedFilters = filters.filter((f) => !filterHandlers[f.type])
    if (!isEmpty(unsupportedFilters)) {
      throw new UnSupportedFilters(
        "Filter(s) is not supported by provider",
        unsupportedFilters
      )
    }
    const matchingFilter = filters.find((f) => {
      const handleFilter = filterHandlers[f.type]
      return handleFilter(f, item)
    })
    return Boolean(matchingFilter)
  })

export { createFilterApplicator }
