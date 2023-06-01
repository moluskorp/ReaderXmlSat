import { Item } from './item'

export interface XmlDb {
  id: string
  cfe: string
  dEmi: Date
  pdv: string
  total: number
  subtotal: number
  discount: number
  active?: boolean
}

export type Xml = XmlDb & {
  items: Array<Item>
}
