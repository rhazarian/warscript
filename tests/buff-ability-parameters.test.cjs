const assert = require("node:assert/strict")
const fs = require("node:fs")
const path = require("node:path")
const test = require("node:test")
const ts = require("typescript")
const tstl = require("typescript-to-lua")

test("buff ability parameters accept sparse custom and standard IDs with checked values", () => {
    const root = path.resolve(__dirname, "..")
    const temporary = fs.mkdtempSync(path.join(root, "node_modules", ".buff-parameters-"))
    try {
        fs.writeFileSync(
            path.join(temporary, "fixture.ts"),
            `
import "../../dist"
import { BuffAbilityParameters, BuffParameters } from "../../dist/engine/buff"
import { AbilityTypeId } from "../../dist/engine/object-data/entry/ability-type"
import { StandardAbilityTypeId } from "../../dist/engine/standard/entries/ability-type"
import { DAMAGE_MULTIPLIER_OCR2_ABILITY_FLOAT_LEVEL_FIELD } from "../../dist/engine/standard/fields/ability"

declare const customAbilityTypeId: AbilityTypeId

export const empty: BuffParameters = { abilityTypeIds: {} }
export const customWithoutFields: BuffParameters = {
    abilityTypeIds: { [customAbilityTypeId]: { level: 1 } },
}
export const custom: BuffParameters = {
    abilityTypeIds: {
        [customAbilityTypeId]: {
            fields: [[DAMAGE_MULTIPLIER_OCR2_ABILITY_FLOAT_LEVEL_FIELD, 2]],
            isButtonVisible: false,
        } satisfies BuffAbilityParameters,
    },
}
export const standard: BuffParameters = {
    abilityTypeIds: { [StandardAbilityTypeId.ENSNARE]: { level: 1 } },
}
export const invalidValue: BuffParameters = {
    abilityTypeIds: {
        [StandardAbilityTypeId.ENSNARE]: {
            // @ts-expect-error Ability levels must remain numeric.
            level: "invalid",
        },
    },
}
export const invalidField: BuffParameters = {
    abilityTypeIds: {
        [StandardAbilityTypeId.ENSNARE]: {
            // @ts-expect-error Field overrides must use ability field objects.
            fields: [["invalid", 2]],
        },
    },
}
`,
        )
        const configPath = path.join(temporary, "tsconfig.json")
        fs.writeFileSync(
            configPath,
            JSON.stringify({
                extends: path.join(root, "tsconfig.json"),
                compilerOptions: {
                    rootDir: temporary,
                    outDir: path.join(temporary, "out"),
                    baseUrl: path.join(root, "dist"),
                },
                include: ["fixture.ts"],
            }),
        )
        const emitted = new Map()
        const result = tstl.transpileProject(configPath, undefined, (name, text) => {
            emitted.set(name, text)
        })
        assert.equal(
            result.diagnostics.length,
            0,
            ts.formatDiagnosticsWithColorAndContext(result.diagnostics, {
                getCurrentDirectory: () => root,
                getCanonicalFileName: (name) => name,
                getNewLine: () => "\n",
            }),
        )
        assert.ok([...emitted.keys()].some((name) => name.endsWith("fixture.lua")))
    } finally {
        assert.equal(path.dirname(temporary), path.join(root, "node_modules"))
        assert.ok(path.basename(temporary).startsWith(".buff-parameters-"))
        fs.rmSync(temporary, { recursive: true, force: true })
    }
})
