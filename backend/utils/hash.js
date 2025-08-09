import fs from 'fs'
import crypto from 'crypto'

export function computeFileHash(filePath, algo = 'sha256') {
  return new Promise((resolve,reject) => {
    const hash = crypto.createHash(algo)
    const stream = fs.createReadStream(filePath)
    stream.on('error', reject)
    stream.on('data', chunk => hash.update(chunk))
    stream.on('end' ,() => resolve(hash.digest('hex')))
  })
}