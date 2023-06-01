import { app, dialog, ipcMain } from 'electron'
import { IPC } from '../shared/constants/ipc'
import path, { join } from 'node:path'
import fs from 'node:fs'
import { Directory, XmlReadFilesRequest } from '../shared/types/ipc'
import xml2js from 'xml2js'
import { Item } from '../shared/types/item'
import { cancelXml, getXml, getXmls, insertXml } from '../shared/models/xmlmgr'
import { getItems, insertItemsXml } from '../shared/models/itemsxmlmgr'
import { moveFile } from '../shared/utils/moveFile'

const configPath = join(app.getPath('userData'), 'config.json')

ipcMain.handle(IPC.DIRECTORY.CHANGE_DIRECTORY, async () => {
  // const oi = await countTestTable()
  // //   console.log('oi', oi[0]['count(*)'])
  // // const oi = await insertTestTable()
  // if (!oi) {
  //   await createTestTable()
  //   console.log('Criado')
  // } else {
  //   await insertTestTable()
  // }
  const directory = dialog.showOpenDialogSync({
    properties: ['openDirectory'],
  })

  if (directory) {
    const configPath = path.join(app.getPath('userData'), 'config.json')
    const config = {
      directory: directory[0],
    }
    fs.writeFile(configPath, JSON.stringify(config, null, 2), (error) => {
      if (error) {
        console.log('Error', error)
        return null
      }
    })
    return directory[0]
  } else {
    return null
  }
})

ipcMain.handle(IPC.DIRECTORY.GET_DIRECTORY, () => {
  if (fs.existsSync(configPath)) {
    return JSON.parse(fs.readFileSync(configPath, 'utf8'))
  }
  return null
})

ipcMain.handle(IPC.XML.READ_FILES, async () => {
  const parser = new xml2js.Parser()
  const { directory } = JSON.parse(
    fs.readFileSync(configPath, 'utf8'),
  ) as Directory

  const folderExists = fs.existsSync(directory)

  if (folderExists) {
    const filenames = fs.readdirSync(directory)

    for (let i = 0; i < filenames.length; i++) {
      if (filenames[i].endsWith('xml')) {
        let bkpFolderName = 'others'
        const data = fs.readFileSync(path.join(directory, filenames[i]))
        parser.parseString(data, async (_, result) => {
          const json = result

          const CFeCanc = json.CFeCanc
          const CFe = json.CFe

          if (CFeCanc) {
            const idCanc = String(CFeCanc.infCFe[0].$.chCanc)
            bkpFolderName = String(json.CFeCanc.infCFe[0].dEmi).slice(0, 6)
            await cancelXml(idCanc)
          }
          if (CFe) {
            const id = String(json.CFe.infCFe[0].$.Id)
            bkpFolderName = String(json.CFe.infCFe[0].ide[0].dEmi).slice(0, 6)
            const xmlExists = await getXml(id)

            const saveXml = !xmlExists[0]

            if (saveXml) {
              const items: Item[] = json.CFe.infCFe[0].det.map((item: any) => {
                return {
                  nItem: Number(item.$.nItem),
                  id: item.prod[0].cProd[0],
                  name: item.prod[0].xProd[0],
                  quantity: Number(item.prod[0].qCom[0]),
                  price: Number(item.prod[0].vUnCom[0]),
                  total: Number(item.prod[0].vProd[0]),
                }
              })

              const xml = {
                id,
                dEmi: getDate(
                  json.CFe.infCFe[0].ide[0].dEmi,
                  json.CFe.infCFe[0].ide[0].hEmi,
                ),
                cfe: String(json.CFe.infCFe[0].ide[0].nCFe),
                pdv: String(json.CFe.infCFe[0].ide[0].numeroCaixa),
                items,
                subtotal: Number(json.CFe.infCFe[0].total[0].ICMSTot[0].vProd),
                discount: Number(json.CFe.infCFe[0].total[0].ICMSTot[0].vDesc),
                total: Number(json.CFe.infCFe[0].total[0].vCFe[0]),
                active: true,
              }
              await insertXml(xml)
              items.forEach(async (item) => {
                await insertItemsXml(item, xml.id)
              })
            }
          }
        })
        moveFile(directory, bkpFolderName, filenames[i])
      }
    }
  }
})

ipcMain.handle(
  IPC.XML.GET_ORDERS,
  async (_, { startDate, endDate }: XmlReadFilesRequest) => {
    return await getXmls(startDate, endDate)
  },
)

ipcMain.handle(IPC.XML_ITEMS.GET_XMLITEMS, async (_, id) => {
  return await getItems(id)
})

function getDate(date: string, time: string) {
  const dateValue = String(date)
  const timeValue = String(time)
  const stringDate = `${dateValue.slice(0, 4)}-${dateValue.slice(
    4,
    6,
  )}-${dateValue.slice(6, 8)}T${timeValue.slice(0, 2)}:${timeValue.slice(
    2,
    4,
  )}:${timeValue.slice(4, 6)}`
  return new Date(stringDate)
}
