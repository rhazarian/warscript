const assert = require("node:assert/strict")
const fs = require("node:fs")
const path = require("node:path")
const test = require("node:test")
const ts = require("typescript")
const tstl = require("typescript-to-lua")

// The published types of AbilitySnapshot: what a snapshot answers for, and what it is not. A
// snapshot is a read-only record of an ability at one level, so reading it at any other level,
// setting anything of it, modifying a field of it and passing it for the ability itself are all
// meant to be rejected, and that is what this freezes -- against `dist`, as a map project sees
// it, `stripInternal` and all.
test("ability snapshot types allow reading what was captured and nothing else", () => {
    const root = path.resolve(__dirname, "..")
    const temporary = fs.mkdtempSync(path.join(root, "node_modules", ".snapshot-types-"))
    try {
        fs.writeFileSync(
            path.join(temporary, "fixture.ts"),
            `
import "../../dist"
import { Ability, AbilityOrSnapshot, AbilitySnapshot } from "../../dist/engine/internal/ability"
import { AbilityDependentValue } from "../../dist/engine/object-field/ability"
import { Item } from "../../dist/engine/internal/item"
import { Unit } from "../../dist/engine/internal/unit"
import {
    CASTER_EFFECT_MODEL_PATHS_ABILITY_STRING_ARRAY_FIELD,
    MANA_COST_ABILITY_INTEGER_LEVEL_FIELD,
    MISSILE_SPEED_ABILITY_INTEGER_FIELD,
} from "../../dist/engine/standard/fields/ability"

declare const ability: Ability
declare const snapshot: AbilitySnapshot
declare const levelField: jabilityreallevelfield

// A snapshot is taken of an ability, and is not built in any other way.
export const taken: AbilitySnapshot = ability.getSnapshot()
// @ts-expect-error A snapshot of no ability is not a snapshot of anything.
export const built = new AbilitySnapshot()
// @ts-expect-error ... and the constructor is not the way to take one either.
export const builtOf = new AbilitySnapshot(ability)

// What a snapshot holds: the ability, the level it was at, what and whose it was, its fields.
export const of: Ability = snapshot.ability
export const level: number = snapshot.level
export const levelCount: number = snapshot.levelCount
export const owner: Unit | Item = snapshot.owner
export const unit: Unit | undefined = snapshot.unit
export const has: boolean = snapshot.hasField(levelField)
export const field: number = snapshot.getField(levelField)
export const text: string = snapshot.toString()

// And nothing of the live state of the ability, so it does not pass for the ability itself.
// @ts-expect-error
export const cooldown = snapshot.cooldownRemaining
// @ts-expect-error
export const handle = snapshot.handle
// @ts-expect-error
export const asAbility: Ability = snapshot

// It has no level of its own to read at, and nothing of it can be set.
// @ts-expect-error
export const atLevel = snapshot.getField(levelField, 2)
// @ts-expect-error
export const setter = snapshot.setField
// @ts-expect-error
export const assigned = (snapshot.level = 2)

// A field reads a snapshot through getCurrentValue, and reads an ability the same way.
export const current: number = MANA_COST_ABILITY_INTEGER_LEVEL_FIELD.getCurrentValue(snapshot)
export const live: number = MANA_COST_ABILITY_INTEGER_LEVEL_FIELD.getCurrentValue(ability)
export const plain: number = MISSILE_SPEED_ABILITY_INTEGER_FIELD.getCurrentValue(snapshot)
export const array: readonly string[] =
    CASTER_EFFECT_MODEL_PATHS_ABILITY_STRING_ARRAY_FIELD.getCurrentValue(snapshot)

// Reading at a level, reading every level, writing and modifying take an ability alone.
export const atLevelOfAbility: number = MANA_COST_ABILITY_INTEGER_LEVEL_FIELD.getValue(ability, 2)
// @ts-expect-error
export const read = MANA_COST_ABILITY_INTEGER_LEVEL_FIELD.getValue(snapshot, 2)
// @ts-expect-error
export const readEvery = MANA_COST_ABILITY_INTEGER_LEVEL_FIELD.getValue(snapshot)
// @ts-expect-error
export const written = MANA_COST_ABILITY_INTEGER_LEVEL_FIELD.setValue(snapshot, 2, 5)
// @ts-expect-error
export const modified = MANA_COST_ABILITY_INTEGER_LEVEL_FIELD.applyModifier(snapshot, () => 0)
// @ts-expect-error
export const readPlain = MISSILE_SPEED_ABILITY_INTEGER_FIELD.getValue(snapshot)

// A supplier of an ability-dependent value is given either of the two, so it takes either.
export const supplier: AbilityDependentValue<number> = (source: AbilityOrSnapshot) => source.level
// @ts-expect-error A supplier of an ability alone is not one: a snapshot is passed to it as well.
export const abilitySupplier: AbilityDependentValue<number> = (source: Ability) => source.level
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
        assert.ok(path.basename(temporary).startsWith(".snapshot-types-"))
        fs.rmSync(temporary, { recursive: true, force: true })
    }
})
