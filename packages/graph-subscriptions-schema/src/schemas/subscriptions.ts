const subscriptionsSchema = `
type Query {
  health: String!
}

type Subscription {
  activityChanged: ActivtyChanged!
}

type ActivtyChanged {
  areaId: String!
  releaseId: String!
}
`

export default subscriptionsSchema
