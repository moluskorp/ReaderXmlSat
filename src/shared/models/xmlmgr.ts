import { db } from './dbmgr'
import { Xml, XmlDb } from '../types/xml'
import { insertZeroMinorTen } from '../utils/insertZeroMinorTen'
import { format } from 'date-fns'

export const createXmlTable = () => {
  const qry =
    'CREATE TABLE xml (id VARCHAR PRIMARY KEY, dEmi datetime, cfe VARCHAR, pdv VARCHAR, total FLOAT, subtotal FLOAT, discount FLOAT, active BOOLEAN);'
  return new Promise((res) => {
    db.all(qry, (_, rows) => {
      res(rows)
    })
  })
}

export const insertXml = (data: XmlDb) => {
  const month = insertZeroMinorTen(data.dEmi.getMonth() + 1)
  const day = insertZeroMinorTen(data.dEmi.getDate())
  const hour = insertZeroMinorTen(data.dEmi.getHours())
  const minute = insertZeroMinorTen(data.dEmi.getMinutes())
  const second = insertZeroMinorTen(data.dEmi.getSeconds())
  const date = `${data.dEmi.getFullYear()}-${month}-${day} ${hour}:${minute}:${second}`
  const qry = `INSERT INTO xml (id, dEmi, cfe, pdv, total, subtotal, discount, active) VALUES ('${data.id}', '${date}', '${data.cfe}', '${data.pdv}', ${data.total}, ${data.subtotal}, ${data.discount}, true)`
  return new Promise((res) => {
    db.all(qry, (e, rows) => {
      res(rows)
    })
  })
}

export const cancelXml = (xmlId: string) => {
  const qry = `UPDATE xml SET active = false WHERE id = '${xmlId}'`
  return new Promise((res) => {
    db.all(qry, (_, rows) => {
      res(rows)
    })
  })
}

export const getXmls = (start: Date, end: Date) => {
  const startDate = format(start, 'yyyy-MM-dd 00:00:00')
  const endDate = format(end, 'yyyy-MM-dd 23:59:59')

  const qry = `SELECT * FROM xml WHERE dEmi BETWEEN '${startDate}' AND '${endDate}'`
  return new Promise((res) => {
    db.all(qry, (e, rows: Xml[]) => {
      const response = rows.map((row) => {
        return {
          ...row,
          dEmi: new Date(row.dEmi),
        }
      })
      res(response)
    })
  })
}

export const getXml = (id: string): Promise<Xml[]> => {
  const qry = `SELECT * FROM xml WHERE id = '${id}'`
  return new Promise((res) => {
    db.all(qry, (e, rows: Xml[]) => {
      res(rows)
    })
  })
}

export const getXmlAndItems = (id: string) => {
  // const qry = `SELECT * FROM xml LEFT JOIN itemsxml ON xml.id = itemsxml.xmlid WHERE itemsxml.xmlid = '${id}'`
  const qry = `SELECT x.id as xmlId,x.dEmi as xmlDemi, x.cfe as xmlCfe, x.pdv as xmlPdv, x.total as xmlTotal, x.active as xmlActive, i.id as itemId, i.nitem as itemNitem, i.name as itemName, i.quantity as itemQuantity, i.price as itemPrice, i.total as itemTotal, i.xmlid as itemXmlId FROM xml x LEFT JOIN itemsxml i ON xmlId = itemXmlId WHERE itemsxml.xmlid = '${id}'`

  return new Promise((res) => {
    db.all(qry, (e, rows) => {
      console.log('e', e)
      console.log('rows', rows)
      res(rows)
    })
  })
}
