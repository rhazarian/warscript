// Runs the real helper and ability behaviors with target enumeration and damage natives replaced.
const assert = require("node:assert/strict")
const { readFileSync } = require("node:fs")
const { stripTypeScriptTypes } = require("node:module")
const { createContext, runInContext } = require("node:vm")
const test = require("node:test")

const damageSource = readFileSync(`${__dirname}/../src/engine/internal/unit+damage.ts`, "utf8")
const helper = stripTypeScriptTypes(
    damageSource.slice(damageSource.indexOf("Unit.prototype.damageArea =")),
)
const behaviors = stripTypeScriptTypes(
    readFileSync(`${__dirname}/../src/engine/behaviour/ability/damage.ts`, "utf8")
        .replace(/^import [\s\S]*? from "[^"]+"\r?\n/gm, "")
        .replace(/^export /gm, ""),
    { mode: "transform" },
)

const harness = (count = 3) => {
    const targets = Array.from({ length: count }, (_, id) => ({ id }))
    const hits = [],
        queries = []
    class Unit {
        static getAllowedTargetsInCollisionRange(...args) {
            queries.push(args)
            return targets
        }
        damageTarget(...args) {
            hits.push(args)
        }
    }
    class AbilityBehavior {
        constructor(ability) {
            this.ability = ability
        }
        resolveCurrentAbilityDependentValue(value) {
            return typeof value === "function" ? value() : value
        }
    }
    const context = createContext({
        Unit,
        AbilityBehavior,
        min: Math.min,
        ALLOWED_TARGETS_ABILITY_COMBAT_CLASSIFICATIONS_LEVEL_FIELD: () => "enemies",
        AREA_OF_EFFECT_ABILITY_FLOAT_LEVEL_FIELD: () => 250,
    })
    const constructors = runInContext(
        helper +
            "\n" +
            behaviors +
            "\n({ DamageSelfAreaAbilityBehavior, DamageTargetAreaAbilityBehavior })",
        context,
    )
    const unit = Object.assign(new Unit(), {
        x: 10,
        y: 20,
        strength: 4,
        agility: 0,
        intelligence: 0,
    })
    return { unit, hits, queries, targets, ...constructors }
}

test("uncapped damage uses the allowed collision targets in their original order", () => {
    const { unit, hits, queries, targets } = harness()
    unit.damageArea(10, 20, 200, "enemies", 80)
    assert.deepEqual(queries, [[unit, "enemies", 10, 20, 200]])
    assert.deepEqual(
        hits.map(([target]) => target),
        targets,
    )
    assert.deepEqual(
        hits.map(([, amount]) => amount),
        [80, 80, 80],
    )
})

test("maximumDamage caps the total even when each individual hit is below the cap", () => {
    const { unit, hits } = harness()
    unit.damageArea(0, 0, 200, "enemies", 80, 150)
    assert.deepEqual(
        hits.map(([, amount]) => amount),
        [50, 50, 50],
    )
})

test("a cap never increases damage and zero or negative values leave it unlimited", () => {
    for (const cap of [300, 0, -1]) {
        const { unit, hits } = harness()
        unit.damageArea(0, 0, 200, "enemies", 80, cap)
        assert.deepEqual(
            hits.map(([, amount]) => amount),
            [80, 80, 80],
        )
    }
})

test("empty areas do not issue damage calls", () => {
    const { unit, hits } = harness(0)
    unit.damageArea(0, 0, 200, "enemies", 80, 150)
    assert.equal(hits.length, 0)
})

test("all damage flags, types and metadata reach damageTarget unchanged", () => {
    const { unit, hits, targets } = harness(1)
    const metadata = { reason: "test" }
    unit.damageArea(0, 0, 200, "enemies", 80, 40, true, true, 7, 8, 9, metadata)
    assert.deepEqual(hits, [[targets[0], 40, true, true, 7, 8, 9, metadata]])
})

test("area behavior resolves its fields and uses the shared cap and damage options", () => {
    const { unit, hits, queries, DamageTargetAreaAbilityBehavior } = harness()
    const behavior = new DamageTargetAreaAbilityBehavior({}, 100, {
        damagePerStrength: 5,
        maximumDamage: () => 150,
        attackType: () => 7,
        damageType: 8,
        weaponType: 9,
        metadata: () => "spell",
    })
    behavior.onPointTargetImpact(unit, 30, 40)
    assert.deepEqual(queries, [[unit, "enemies", 30, 40, 250]])
    for (const hit of hits) {
        assert.deepEqual(hit.slice(1), [50, undefined, undefined, 7, 8, 9, "spell"])
    }
})

test("self-area behavior retains damage calculated at channeling start", () => {
    const { unit, hits, queries, DamageSelfAreaAbilityBehavior } = harness(1)
    const behavior = new DamageSelfAreaAbilityBehavior({}, 100, { damagePerStrength: 5 })
    behavior.onChannelingStart(unit)
    unit.strength = 20
    behavior.onImpact(unit)
    assert.equal(hits[0][1], 120)
    assert.deepEqual(queries[0], [unit, "enemies", unit.x, unit.y, 250])
    behavior.onStop()
    behavior.onImpact(unit)
    assert.equal(hits[1][1], 200)
})
