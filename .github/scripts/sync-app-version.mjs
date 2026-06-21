import { readFileSync, writeFileSync } from "node:fs"

const tag = process.argv[2]

if (!tag) {
  console.error("Usage: node sync-app-version.mjs <tag>")
  process.exit(1)
}

const version = tag.startsWith("v") ? tag.slice(1) : tag

const tauriConfPath = "src-tauri/tauri.conf.json"
const tauriConf = JSON.parse(readFileSync(tauriConfPath, "utf8"))
tauriConf.version = version
writeFileSync(tauriConfPath, `${JSON.stringify(tauriConf, null, 2)}\n`)

const cargoPath = "src-tauri/Cargo.toml"
const cargo = readFileSync(cargoPath, "utf8").replace(
  /^version = ".*"/m,
  `version = "${version}"`,
)
writeFileSync(cargoPath, cargo)

console.log(`App version synced to ${version} from tag ${tag}`)
