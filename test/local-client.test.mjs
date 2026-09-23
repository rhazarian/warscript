import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { stripTypeScriptTypes } from "node:module"
import test from "node:test"
import { runInNewContext } from "node:vm"

const source = readFileSync(new URL("../src/engine/local-client.ts", import.meta.url), "utf8")
const detector = stripTypeScriptTypes(
    source.slice(
        source.indexOf("const commandButtons ="),
        source.indexOf("Timer.onPeriod[", source.indexOf("const commandButtons =")),
    ),
)
const frameSource = readFileSync(new URL("../src/core/types/frame.ts", import.meta.url), "utf8")
const hiddenGetter = frameSource.match(
    /public get isHiddenByScript\(\): boolean \{[\s\S]*?\n    \}/,
)[0]
const HiddenFrame = runInNewContext(
    stripTypeScriptTypes(`class HiddenFrame { hideCounter = 0; ${hiddenGetter} }; HiddenFrame`),
)

const harness = () => {
    const containers = Array.from({ length: 12 }, () =>
        Object.assign(new HiddenFrame(), { visible: true }),
    )
    for (const container of containers) container.handle = container
    let failRead = false
    const commands = containers.map((parent) => ({
        nativeVisible: false,
        get visible() {
            if (failRead) throw new Error("read failed")
            return this.nativeVisible && parent.visible
        },
    }))
    const events = { enter: [], leave: [], change: [] }
    const api = runInNewContext(
        `let lastTargetingModeState = false; ${detector}; ({ read: actualizeTargetingModeState })`,
        {
            Frame: {
                byOrigin: (_, i) => commands[i],
                byName: (name) => containers[Number(name.split("_")[1])],
            },
            ORIGIN_FRAME_COMMAND_BUTTON: 0,
            array: (n, factory) => Array.from({ length: n }, (_, i) => factory(i)),
            $range: function* (a, b) {
                for (let i = a; i <= b; i++) yield i
            },
            setFrameVisible: (frame, visible) => {
                frame.visible = visible
            },
            targetingModeEnterEvent: events.enter,
            targetingModeLeaveEvent: events.leave,
            targetingModeStateChangeEvent: events.change,
            Event: {
                invoke: (listeners) => {
                    for (const listener of listeners) listener()
                },
            },
        },
    )
    return {
        ...api,
        containers,
        commands,
        events,
        fail: () => {
            failRead = true
        },
        native: (targeting) => {
            commands.forEach((command, i) => {
                command.nativeVisible = i === 11 || !targeting
            })
        },
        hide: (i, count = 1) => {
            containers[i].hideCounter = count
            containers[i].visible = false
        },
    }
}

test("script hide getter excludes engine-only hiding", () => {
    const frame = new HiddenFrame()
    assert.equal(frame.isHiddenByScript, false)
    frame.hideCounter = 2
    assert.equal(frame.isHiddenByScript, true)
})

test("targeting entry/exit with occupied cancel slot preserves nested hides", () => {
    const h = harness()
    for (let i = 0; i < 12; i++) h.hide(i, 2)
    h.native(false)
    assert.equal(h.read(), false)
    h.native(true)
    assert.equal(h.read(), true)
    h.native(false)
    assert.equal(h.read(), false)
    for (const frame of h.containers) {
        assert.equal(frame.visible, false)
        assert.equal(frame.hideCounter, 2)
    }
})

test("visibility is restored before reentrant callbacks, which may release hides", () => {
    const h = harness()
    h.hide(0, 2)
    h.native(true)
    let enters = 0,
        leaves = 0
    h.events.enter.push(() => {
        enters++
        assert.equal(h.containers[0].visible, false)
        assert.equal(h.read(), true)
        h.containers[0].hideCounter--
    })
    h.events.leave.push(() => {
        leaves++
        assert.equal(h.containers[0].visible, false)
        assert.equal(h.read(), false)
        h.containers[0].hideCounter--
        h.containers[0].visible = true
    })
    assert.equal(h.read(), true)
    h.native(false)
    assert.equal(h.read(), false)
    assert.equal(enters, 1)
    assert.equal(leaves, 1)
    assert.equal(h.containers[0].hideCounter, 0)
    assert.equal(h.containers[0].visible, true)
})

test("failed sample restores hides without dispatching events", () => {
    const h = harness()
    h.hide(0, 3)
    h.events.enter.push(() => assert.fail("must not dispatch"))
    h.fail()
    assert.throws(h.read, /read failed/)
    assert.equal(h.containers[0].visible, false)
    assert.equal(h.containers[0].hideCounter, 3)
})

test("engine-hidden containers without script hides remain untouched", () => {
    const h = harness()
    h.containers[0].visible = false
    h.native(false)
    assert.equal(h.read(), false)
    assert.equal(h.containers[0].visible, false)
    assert.equal(h.containers[0].hideCounter, 0)
})
