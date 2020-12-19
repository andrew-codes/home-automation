import { get, isEmpty } from "lodash"
import { Domain, DomainResults } from "../../Domain"
import { FilterDefinition } from "../../filter/filter"
import { UnSupportedFiltersError } from "../Errors"

const filterHandlers = {
  equality: <TDomain extends Domain>(
    f: FilterDefinition<TDomain>,
    value: DomainResults[TDomain]
  ): boolean => {
    let objPath = f.attribute
    if (!Array.isArray(f.attribute)) {
      objPath = [f.attribute as string]
    } else {
      objPath = f.attribute
    }
    const assetValue = get(value, f.attribute)
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
  filters: FilterDefinition<TDomain>[] | undefined
) => (items: DomainResults[TDomain][]) =>
  items.filter((item) => {
    if (!filters || isEmpty(filters)) {
      return true
    }
    const unsupportedFilters = filters.filter((f) => !filterHandlers[f.type])
    if (!isEmpty(unsupportedFilters)) {
      throw new UnSupportedFiltersError(unsupportedFilters)
    }
    const matchingFilter = filters.find((f) => {
      const handleFilter = filterHandlers[f.type]
      return handleFilter(f, item)
    })
    return Boolean(matchingFilter)
  })

export { createFilterApplicator }
