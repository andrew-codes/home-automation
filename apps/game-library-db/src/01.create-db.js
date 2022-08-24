db = new Mongo().getDB("gameLibrary")

db.createCollection('games', { capped: false })
db.createCollection('platforms', { capped: false })
db.createCollection('files', { capped: false })