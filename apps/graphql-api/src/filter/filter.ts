import { Domain, DomainHomeAssistantEntity, DomainResults } from "../Domain"

type SupportedFilters = "equality" | "equalityInPath"
interface FilterDefinition<TDomain extends Domain> {
  type: SupportedFilters
  attribute: keyof DomainResults[TDomain] | string[]
  value: any
  negation: boolean
}

type Filter<TDomain extends Domain> = FilterDefinition<TDomain>

const filterCreator = (type: SupportedFilters) => <TDomain extends Domain>(
  attribute: keyof DomainResults[TDomain] | string[],
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
export { Filter, FilterDefinition, SupportedFilters }
