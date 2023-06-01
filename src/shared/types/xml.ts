import { Item } from './item'

export interface XmlDb {
  id: string
  cfe: string
  dEmi: Date
  pdv: string
  total: number
}

export type Xml = XmlDb & {
  items: Array<Item>
}
