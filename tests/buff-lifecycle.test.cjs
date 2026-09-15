// Runs the lifecycle dispatch from buff.ts with native handles and timers replaced.
const assert = require("node:assert/strict")
const { readFileSync } = require("node:fs")
const { stripTypeScriptTypes } = require("node:module")
const { createContext, runInContext } = require("node:vm")
const test = require("node:test")

const source = readFileSync(`${__dirname}/../src/engine/buff.ts`, "utf8")
const extract = (pattern) => {
    const match = source.match(pattern)
    assert.ok(match, `Lifecycle source not found: ${pattern}`)
    return match[0]
}
const dispatch = stripTypeScriptTypes(
    extract(/const expireBuff = [\s\S]*?\n}/) +
        "\nclass Lifecycle {\n" +
        extract(/    public dispel\([\s\S]*?\n    }/) +
        "\n}\n" +
        extract(/        const destroyBuffIfNeeded = [\s\S]*?\n        }/),
)
const unitBuffSource = stripTypeScriptTypes(
    readFileSync(`${__dirname}/../src/engine/internal/unit/buff.ts`, "utf8").replace(
        /^import [\s\S]*? from "[^"]+"\r?\n/gm,
        "",
    ),
)

const harness = (options = {}) => {
    const deferred = []
    let nativeHandle = options.nativeHandle ?? (options.nativePresent ? 2 : undefined)
    const context = createContext({
        BuffPropertyKey: { STATE: "state", UNIT: "unit" },
        BuffResistanceType: { MAGIC: 1, PHYSICAL: 2 },
        BuffPolarity: { POSITIVE: 1, NEGATIVE: 2 },
        HandleState: { CREATED: 1, BEING_DESTROYED: 2 },
        Timer: { run: (callback, ...args) => deferred.push(() => callback(...args)) },
        destroyBuff: (buff) => buff.destroy(),
        getUnitAbility: () => nativeHandle,
    })
    const { Lifecycle, expireBuff, destroyBuffIfNeeded } = runInContext(
        dispatch + "\n({ Lifecycle, expireBuff, destroyBuffIfNeeded })",
        context,
    )
    const calls = []
    const buff = Object.assign(new Lifecycle(), {
        state: 1,
        unit: { handle: 1, isAlive: true },
        handle: 2,
        resistanceType: 1,
        _timer: {},
        remainingDuration: 5,
        destroy() {
            if (this.isDestroyed) return
            this.isDestroyed = true
            this.state = 3
            calls.push("destroy")
        },
        expire() {
            expireBuff(this)
        },
        onExpiration() {
            calls.push("expiration")
        },
        onDispel(source) {
            calls.push(["dispel", source])
        },
        ...options,
    })
    const removeNativeBuff = () => {
        const hadBuff = nativeHandle !== undefined
        nativeHandle = undefined
        return hadBuff
    }
    Object.assign(context, {
        Unit: { prototype: {} },
        GetUnitAbilityLevel: () => (nativeHandle === undefined ? 0 : 1),
        UnitCountBuffsEx: () => (nativeHandle === undefined ? 0 : 1),
        UnitRemoveAbility: removeNativeBuff,
        UnitRemoveBuffsEx: removeNativeBuff,
        removeBuff: removeNativeBuff,
        checkBuff: (unit, id, isDispel, source) => destroyBuffIfNeeded(buff, isDispel, source),
        checkBuffs: (unit, isDispel, source) => destroyBuffIfNeeded(buff, isDispel, source),
        $range: function* (start, end) {
            for (let i = start; i <= end; i++) yield i
        },
    })
    runInContext(unitBuffSource, context)
    const listenerByEvent = new Map()
    for (const name of [
        "abilityChannelingStartEvent",
        "abilityUnitTargetChannelingStartEvent",
        "abilityPointTargetChannelingStartEvent",
        "abilityNoTargetChannelingStartEvent",
        "onDamage",
    ]) {
        context.Unit[name] = {
            addListener(priority, listener) {
                listenerByEvent.set(name, listener)
            },
        }
    }
    context.Unit.getInCollisionRange = () => [buff.unit]
    context.EventListenerPriority = { LOWEST: 0 }
    context.ABILITY_RLF_AREA_OF_EFFECT = 0
    context.forEach = (values, callback, ...args) =>
        values.forEach((value) => callback(value, ...args))
    const eventHandlers = source.slice(
        source.indexOf("        Unit.abilityChannelingStartEvent.addListener("),
        source.indexOf("        // It is here to avoid cyclic dependency"),
    )
    runInContext(stripTypeScriptTypes(eventHandlers), context)
    return {
        buff,
        calls,
        check: (isDispel = false, source) => destroyBuffIfNeeded(buff, isDispel, source),
        flush: () => deferred.splice(0).forEach((f) => f()),
        removeOne: () => context.Unit.prototype.removeBuff.call(buff.unit, 7),
        removeAll: (...args) => context.Unit.prototype.removeBuffs.call(buff.unit, ...args),
        removeNativeBuff,
        replaceNativeBuff: () => {
            nativeHandle = 3
        },
        emit: (name, ...args) => listenerByEvent.get(name)(...args),
    }
}

test("cast checks preserve dispel context through the next tick and damage cleanup", () => {
    for (const name of [
        "abilityUnitTargetChannelingStartEvent",
        "abilityPointTargetChannelingStartEvent",
        "abilityNoTargetChannelingStartEvent",
    ]) {
        const { buff, calls, emit, removeNativeBuff, flush } = harness({ nativePresent: true })
        const caster = { x: 0, y: 0 }
        const ability = { getField: () => 200 }
        if (name === "abilityUnitTargetChannelingStartEvent") emit(name, caster, ability, buff.unit)
        else emit(name, caster, ability, 0, 0)
        removeNativeBuff()
        emit("onDamage", undefined, buff.unit)
        flush()
        assert.deepEqual(calls, [["dispel", caster], "destroy"])
    }
})

test("removeBuffs during a cast remains plain cleanup even when a dispel check is queued", () => {
    const { buff, calls, emit, removeAll, flush } = harness({ nativePresent: true })
    emit("abilityUnitTargetChannelingStartEvent", {}, {}, buff.unit)
    removeAll()
    flush()
    assert.deepEqual(calls, ["destroy"])
})

test("spell-effect removal dispatches onDispel with the caster exactly once", () => {
    const { buff, calls, check } = harness()
    const caster = {}
    check(true, caster)
    check(true, caster)
    buff.expire()
    assert.deepEqual(calls, [["dispel", caster], "destroy"])
})

test("a different non-null buff handle means replacement even in a dispel check", () => {
    for (const isDispel of [false, true]) {
        const { calls, check } = harness({ nativeHandle: 3 })
        check(isDispel, {})
        check(true, {})
        assert.deepEqual(calls, ["destroy"])
    }
})

test("a buff overwritten after a cast is cleaned up without onDispel", () => {
    const { buff, calls, emit, replaceNativeBuff, flush } = harness({ nativePresent: true })
    emit("abilityUnitTargetChannelingStartEvent", {}, {}, buff.unit)
    replaceNativeBuff()
    flush()
    assert.deepEqual(calls, ["destroy"])
})

test("a dispel cast does not dispatch for a surviving, physical, dead or expired buff", () => {
    for (const options of [
        { nativePresent: true },
        { resistanceType: 2 },
        { unit: { handle: 1, isAlive: false } },
        { remainingDuration: 0 },
    ]) {
        const { calls, check } = harness(options)
        check(true, {})
        assert.deepEqual(calls, options.nativePresent ? [] : ["destroy"])
    }
})

test("Unit.removeBuff and both Unit.removeBuffs overloads never dispatch onDispel", () => {
    for (const method of ["single", "all", "ids"]) {
        const { calls, check, removeOne, removeAll } = harness({ nativePresent: true })
        if (method === "single") removeOne()
        else if (method === "ids") removeAll([7])
        else removeAll()
        // A queued spell check must not reclassify an explicitly removed buff.
        check(true, {})
        assert.deepEqual(calls, ["destroy"])
    }
})

test("a missing native buff only triggers cleanup, regardless of remaining duration", () => {
    for (const remainingDuration of [5, 0]) {
        const { buff, calls, check } = harness({ remainingDuration })
        check()
        check()
        buff.expire()
        buff.dispel()
        assert.deepEqual(calls, ["destroy"])
    }
})

test("duration expiry invokes expiration once despite repeated checks and timer callbacks", () => {
    const { buff, calls, check, flush } = harness({ remainingDuration: 0 })
    buff.expire()
    check()
    check()
    buff.expire()
    buff.dispel()
    flush()
    assert.deepEqual(calls, ["expiration", "destroy"])
})

test("missing permanent buffs and dead units only trigger cleanup", () => {
    const permanent = harness({ _timer: undefined, remainingDuration: 0 })
    permanent.check()
    assert.deepEqual(permanent.calls, ["destroy"])
    const dead = harness({ unit: { handle: 1, isAlive: false } })
    dead.check()
    assert.deepEqual(dead.calls, ["destroy"])
})

test("direct destruction never dispatches dispel or expiration", () => {
    const { buff, calls, check } = harness()
    buff.destroy()
    check()
    buff.expire()
    buff.dispel()
    assert.deepEqual(calls, ["destroy"])
})

test("explicit dispel carries its source and prevents recursive callbacks", () => {
    const { buff, calls } = harness()
    const source = {}
    buff.onDispel = function (receivedSource) {
        calls.push(receivedSource)
        this.dispel(source)
        this.expire()
    }
    buff.dispel(source)
    assert.deepEqual(calls, [source, "destroy"])
})

test("dispel still removes the buff if its callback throws", () => {
    const error = new Error("test")
    const { buff, calls } = harness({
        onDispel() {
            throw error
        },
    })
    assert.throws(
        () => buff.dispel(),
        (received) => received === error,
    )
    assert.deepEqual(calls, ["destroy"])
})
