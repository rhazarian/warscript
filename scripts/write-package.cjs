const fs = require("node:fs")
const path = require("node:path")

const root = path.resolve(__dirname, "..")
const manifest = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"))

// Registry releases still have the contents of dist at the package root.
// Git installations use the root manifest and its mappings into dist instead.
delete manifest.files
delete manifest.main
delete manifest.types
delete manifest.typesVersions
delete manifest.exports
delete manifest.scripts
delete manifest.devDependencies

fs.writeFileSync(path.join(root, "dist/package.json"), JSON.stringify(manifest, null, 4) + "\n")
