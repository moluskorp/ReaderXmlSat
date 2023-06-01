import { db } from './dbmgr'
import { Item } from '../types/item'

export const createItemsXmlTable = () => {
  const qry =
    'CREATE TABLE itemsxml (id INTEGER PRIMARY KEY, nitem INTEGER, itemid VARCHAR, name VARCHAR, quantity FLOAT, price FLOAT, total FLOAT, xmlid VARCHAR, FOREIGN KEY(xmlid) REFERENCES xml(id));'
  return new Promise((res) => {
    db.all(qry, (_, rows) => {
      res(rows)
    })
  })
}

export const insertItemsXml = (data: Item, xmlId: string) => {
  const qry = `INSERT INTO itemsxml (nitem, itemid, name, quantity, price, total, xmlid) VALUES (${data.nItem}, '${data.id}', '${data.name}', ${data.quantity}, ${data.price}, ${data.total}, '${xmlId}');`
  return new Promise((res) => {
    db.all(qry, (_, rows) => {
      res(rows)
    })
  })
}

export const getItems = (xmlId: string) => {
  const qry = `SELECT * FROM itemsxml where xmlid = '${xmlId}'`
  return new Promise((res) => {
    db.all(qry, (_, rows) => {
      res(rows)
    })
  })
}
