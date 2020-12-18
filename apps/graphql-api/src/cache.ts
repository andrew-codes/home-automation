import NodeCache from "node-cache"

const cache = new NodeCache({ stdTTL: 0, checkperiod: 0 })

export { cache }
