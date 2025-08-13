// Simple generator to create src/config/secrets.ts from .env without external libs
const fs = require('fs')
const path = require('path')

const projectRoot = __dirname ? path.resolve(__dirname, '..') : process.cwd()
const envPath = path.join(projectRoot, '.env')
const outputPath = path.join(projectRoot, 'src', 'config', 'secrets.ts')

function parseDotEnv(content) {
  const result = {}
  content.split(/\r?\n/).forEach(line => {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) return
    const idx = trimmed.indexOf('=')
    if (idx === -1) return
    const key = trimmed.slice(0, idx).trim()
    let value = trimmed.slice(idx + 1).trim()
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith('\'') && value.endsWith('\''))) {
      value = value.slice(1, -1)
    }
    result[key] = value
  })
  return result
}

try {
  let env = {}
  if (fs.existsSync(envPath)) {
    const raw = fs.readFileSync(envPath, 'utf8')
    env = parseDotEnv(raw)
  }

  const groqKey = env.GROQ_API_KEY || ''
  const weatherKey = env.WEATHER_API_KEY || ''

  const fileContent = [
    "export const GROQ_API_KEY = '" + groqKey.replace(/'/g, "\\'") + "';",
    "export const WEATHER_API_KEY = '" + weatherKey.replace(/'/g, "\\'") + "';",
    ''
  ].join('\n')

  const outDir = path.dirname(outputPath)
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true })
  fs.writeFileSync(outputPath, fileContent, 'utf8')
  console.log('Generated', path.relative(projectRoot, outputPath))
} catch (err) {
  console.error('Failed generating secrets.ts:', err)
  process.exit(1)
}
