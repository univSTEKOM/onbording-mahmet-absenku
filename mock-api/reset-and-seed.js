import { existsSync, unlinkSync } from 'fs'

if (existsSync('./db.json')) {
  unlinkSync('./db.json')
  console.log('Deleted existing db.json')
}

await import('./seed.js')
