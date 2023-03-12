type Item = {
  id: string
}

type ItemCollection<TItem extends Item> = {
  items: TItem[]
} & Item

export { Item, ItemCollection }
