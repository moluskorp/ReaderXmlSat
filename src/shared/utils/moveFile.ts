import path from 'node:path'
import fs from 'node:fs'

export const moveFile = (
  directory: string,
  bkpFolderName: string,
  filename: string,
) => {
  const oldPath = path.join(directory, filename)
  const bkpFolder = path.join(directory, 'bkp', bkpFolderName)
  const newPath = path.join(bkpFolder, filename)

  const folderNotExists = !fs.existsSync(bkpFolder)

  if (folderNotExists) {
    fs.mkdirSync(bkpFolder, {
      recursive: true,
    })
  }

  fs.renameSync(oldPath, newPath)
}
