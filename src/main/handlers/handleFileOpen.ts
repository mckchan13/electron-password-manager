import { dialog } from "electron"

const handleFileOpen = async (): Promise<string | undefined> => {
  const {canceled, filePaths} = await dialog.showOpenDialog({})
  if (!canceled) {
    return filePaths[0]
  }
}

export default handleFileOpen