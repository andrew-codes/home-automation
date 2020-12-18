import { Domain, DomainResults } from "../Domain"

type SupportedFilters = "equality"
interface FilterDefinition<TDomain extends Domain> {
  type: SupportedFilters
  attribute: keyof DomainResults[TDomain]
  value: any
  negation: boolean
}

const filterCreator = (type: SupportedFilters) => <TDomain extends Domain>(
  attribute: keyof DomainResults[TDomain],
  value: any,
  negation: boolean = false
): FilterDefinition<TDomain> => {
  return {
    type,
    attribute,
    value,
    negation,
  }
}

export default filterCreator
export { FilterDefinition, SupportedFilters }
