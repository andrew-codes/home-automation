import DataLoader from "dataloader"
import { Db } from "mongodb"

interface CreateDataLoader<T> {
  (db: Db): DataLoader<string, T>
}

export default CreateDataLoader
