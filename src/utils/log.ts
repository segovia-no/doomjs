import * as fs from 'fs'

export function logMapLumpData(lump: Record<string, any>, lumpName: string, mapName: string, amount = 5) {

  console.log(`${mapName} - ${lumpName} dump | showing: ${amount}/${lump.length}`)

  const keys = Object.keys(lump[0])

  for(let i = 0; i < amount; i++) {

    const values = Object.values(lump[i])

    let finalString = ''

    for(let j = 0; j < values.length; j++) {
      finalString = finalString + `${keys[j]}: ${values[j]}, `
    }

    console.log(`${lumpName} ${i} | ${finalString}`)
  }

  console.log('')

}

export function dumpMapLumpDataToFile(lump: Record<string, any>, lumpName: string, mapName: string): boolean {
  try {

    const filename = `${lumpName} - ${mapName}.csv`

    if(fs.existsSync(filename)) {
      fs.unlinkSync(filename)
    }

    const keys = Object.keys(lump[0]).join()

    fs.appendFileSync(filename, `${keys}\n`)

    for(let i = 0; i < lump.length; i++) {

      const values = Object.values(lump[i]).join()
      
      fs.appendFileSync(filename, `${values}\n`)

    }

    console.log(`Successfully dumped ${lumpName} of map ${mapName}`)

    return true

  } catch(e) {
    console.error(e)
    return false
  }
}