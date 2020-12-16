type SupportedFilters = 'equality'
interface FilterDefinition {
    type: SupportedFilters,
    attribute: string,
    value: any,
    negation: boolean,
}

const filterCreator = (type: SupportedFilters) => (attribute: string, value: any, negation: boolean = false) : FilterDefinition =>{
    return {
        type,
        attribute,
        value,
        negation,
    }
}

export default filterCreator
export { FilterDefinition, SupportedFilters }