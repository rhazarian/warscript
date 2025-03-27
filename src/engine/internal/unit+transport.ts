import { Unit } from "./unit"
import { Event } from "../../event"
import { GameMap } from "../game-map"

const eventInvoke = Event.invoke
const tableRemove = table.remove
const assert = _G.assert
const rawset = _G.rawset
const condition = Condition
const createTrigger = CreateTrigger
const getTransportUnit = GetTransportUnit
const getTriggerUnit = GetTriggerUnit
const isUnitLoaded = IsUnitLoaded
const triggerAddCondition = TriggerAddCondition
const triggerRegisterAnyUnitEventBJ = TriggerRegisterAnyUnitEventBJ
const unitAlive = UnitAlive

declare module "./unit" {
    interface Unit {
        readonly transport?: Unit
        readonly cargo: ReadonlyArray<Unit>
    }

    namespace Unit {
        const onBoard: Event<[unit: Unit, transport: Unit]>
        const onDeboard: Event<[unit: Unit, transport: Unit]>
    }
}

const transportByUnit = setmetatable(new LuaMap<Unit, Unit>(), { __mode: "kv" })

const cargoByUnit = setmetatable(new LuaTable<Unit, Unit[]>(), {
    __mode: "k",
    __index(unit: Unit) {
        const cargo: Unit[] = []
        rawset(this, unit, cargo)
        return cargo
    },
})

const onBoardEvent = new Event<[unit: Unit, transport: Unit]>()
const onDeboardEvent = new Event<[unit: Unit, transport: Unit]>()

const deboard = (unit: Unit) => {
    const transport = assert(transportByUnit.get(unit))
    const cargo = cargoByUnit.get(transport)
    for (const i of $range(1, cargo.length)) {
        if (cargo[i - 1] == unit) {
            tableRemove(cargo, i)
            break
        }
    }
    transportByUnit.delete(unit)
    eventInvoke(onDeboardEvent, unit, transport)
}

const boardTrigger = createTrigger()
triggerRegisterAnyUnitEventBJ(boardTrigger, EVENT_PLAYER_UNIT_LOADED)
triggerAddCondition(
    boardTrigger,
    condition(() => {
        const handle = getTriggerUnit()!
        const unit = Unit.of(handle)
        if (transportByUnit.has(unit)) {
            deboard(unit)
        }
        if (!unitAlive(handle)) {
            unit.x = GameMap.worldBoundsRect.maxX
            unit.y = GameMap.worldBoundsRect.maxY
        }
        const transport = Unit.of(getTransportUnit())
        transportByUnit.set(unit, transport)
        const cargo = cargoByUnit.get(transport)
        cargo[cargo.length] = unit
        eventInvoke(onBoardEvent, unit, transport)
    }),
)

Unit.deathEvent.addListener((unit) => {
    if (transportByUnit.has(unit)) {
        deboard(unit)
    }
})

Unit.onImmediateOrder.addListener((unit) => {
    if (transportByUnit.has(unit) && !isUnitLoaded(unit.handle)) {
        deboard(unit)
    }
})

Object.defineProperty(Unit.prototype, "transport", {
    get(this: Unit) {
        return transportByUnit.get(this)
    },
})

Object.defineProperty(Unit.prototype, "cargo", {
    get(this: Unit) {
        return cargoByUnit.get(this)
    },
})

rawset(Unit, "onBoard", onBoardEvent)
rawset(Unit, "onDeboard", onDeboardEvent)
