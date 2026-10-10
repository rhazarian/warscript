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

test("the buff shares with the source owner and the players the owner shares vision with", () => {
    const { calls, context, unit } = harness()
    const players = [player("p0"), player("p1"), player("p2"), player("p3")]
    const owner = players[1]
    owner.getAlliance = (other, type) => type == "vision" && other == players[3]
    Object.assign(context, {
        Player: { all: players },
        PlayerAllianceType: { SHARED_VISION: "vision" },
        BuffPropertyKey: { SOURCE: "source", UNIT: "unit", VISION_PLAYERS: "visionPlayers" },
    })
    const { shareVisionWithSource, unshareVisionWithSource } = runInContext(
        buffVisionSource + "\n({ shareVisionWithSource, unshareVisionWithSource })",
        context,
    )

    const buff = { source: { owner }, unit }
    shareVisionWithSource(buff)
    assert.deepEqual(calls, [
        ["unit", "p1", true],
        ["unit", "p3", true],
    ])

    // A second buff on the same unit keeps the vision when the first one ends.
    const otherBuff = { source: { owner }, unit }
    shareVisionWithSource(otherBuff)
    unshareVisionWithSource(buff)
    assert.equal(calls.length, 2)
    assert.equal(buff.visionPlayers, undefined)
    unshareVisionWithSource(buff)
    unshareVisionWithSource(otherBuff)
    assert.deepEqual(calls.slice(2), [
        ["unit", "p1", false],
        ["unit", "p3", false],
    ])

    const sourcelessBuff = { unit }
    shareVisionWithSource(sourcelessBuff)
    // The array comes from the vm context, so compare its length rather than its prototype.
    assert.equal(sourcelessBuff.visionPlayers.length, 0)
    unshareVisionWithSource(sourcelessBuff)
    assert.equal(calls.length, 4)
})
