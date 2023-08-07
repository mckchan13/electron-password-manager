import { dialog } from "electron"

export const handleFileOpen = async (): Promise<string | undefined> => {
  const {canceled, filePaths} = await dialog.showOpenDialog({})
  if (!canceled) {
    return filePaths[0]
  }
}