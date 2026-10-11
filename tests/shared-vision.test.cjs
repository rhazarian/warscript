// Runs the shared vision counter and the buff's vision sharing with the natives replaced.
const assert = require("node:assert/strict")
const { readFileSync } = require("node:fs")
const { stripTypeScriptTypes } = require("node:module")
const { createContext, runInContext } = require("node:vm")
const test = require("node:test")

const withoutImports = (source) => source.replace(/^import [\s\S]*? from "[^"]+"\r?\n/gm, "")

const counterSource = stripTypeScriptTypes(
    withoutImports(
        readFileSync(`${__dirname}/../src/engine/internal/unit/shared-vision-counter.ts`, "utf8"),
    ),
)

const buffSource = readFileSync(`${__dirname}/../src/engine/buff.ts`, "utf8")
const extract = (pattern) => {
    const match = buffSource.match(pattern)
    assert.ok(match, `Buff source not found: ${pattern}`)
    return match[0]
}
const buffVisionSource = stripTypeScriptTypes(
    extract(/const shareVisionWithSource = [\s\S]*?\n}/) +
        "\n" +
        extract(/const unshareVisionWithSource = [\s\S]*?\n}/),
)

class LuaMap extends Map {
    delete(key) {
        super.delete(key)
    }
}

const harness = () => {
    const calls = []
    class Unit {
        constructor(handle) {
            this.handle = handle
        }
    }
    const context = createContext({
        LuaMap,
        Unit,
        setmetatable: (table) => table,
        UnitShareVision: (unit, player, share) => calls.push([unit, player, share]),
    })
    runInContext(counterSource, context)
    return { calls, context, unit: new Unit("unit") }
}

const player = (handle) => ({ handle })

test("the native is called only for the first share and the last unshare of a player", () => {
    const { calls, unit } = harness()
    const red = player("red")
    const blue = player("blue")

    unit.incrementSharedVisionCounter(red)
    unit.incrementSharedVisionCounter(red)
    unit.incrementSharedVisionCounter(blue)
    assert.deepEqual(calls, [
        ["unit", "red", true],
        ["unit", "blue", true],
    ])

    unit.decrementSharedVisionCounter(red)
    assert.equal(calls.length, 2)
    unit.decrementSharedVisionCounter(red)
    unit.decrementSharedVisionCounter(blue)
    assert.deepEqual(calls.slice(2), [
        ["unit", "red", false],
        ["unit", "blue", false],
    ])

    // An unmatched decrement neither revokes nor goes below zero.
    unit.decrementSharedVisionCounter(red)
    unit.incrementSharedVisionCounter(red)
    assert.deepEqual(calls.slice(4), [["unit", "red", true]])
})

test("the buff shares the unit with the source owner only, the engine does the rest", () => {
    const { calls, context, unit } = harness()
    const owner = player("p1")
    Object.assign(context, {
        BuffPropertyKey: { SOURCE: "source", UNIT: "unit", VISION_PLAYER: "visionPlayer" },
    })
    const { shareVisionWithSource, unshareVisionWithSource } = runInContext(
        buffVisionSource + "\n({ shareVisionWithSource, unshareVisionWithSource })",
        context,
    )

    const buff = { source: { owner }, unit }
    shareVisionWithSource(buff)
    assert.deepEqual(calls, [["unit", "p1", true]])

    // A second buff on the same unit keeps the vision when the first one ends.
    const otherBuff = { source: { owner }, unit }
    shareVisionWithSource(otherBuff)
    unshareVisionWithSource(buff)
    assert.equal(calls.length, 1)
    assert.equal(buff.visionPlayer, undefined)
    unshareVisionWithSource(buff)
    unshareVisionWithSource(otherBuff)
    assert.deepEqual(calls.slice(1), [["unit", "p1", false]])

    const sourcelessBuff = { unit }
    shareVisionWithSource(sourcelessBuff)
    unshareVisionWithSource(sourcelessBuff)
    assert.equal(calls.length, 2)
})
