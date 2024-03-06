import { Unit } from "./unit"
import { Destructable } from "../../core/types/destructable"
import { Timer } from "../../core/types/timer"
import { Handle } from "../../core/types/handle"

const getLocationX = GetLocationX
const getLocationY = GetLocationY
const getHandleId = GetHandleId
const getUnitRallyDestructible = GetUnitRallyDestructable
const getUnitRallyPoint = GetUnitRallyPoint
const getUnitRallyUnit = GetUnitRallyUnit
const removeLocation = RemoveLocation
const issuePointOrderById = IssuePointOrderById
const issueTargetOrderById = IssueTargetOrderById
const queuePointOrderById = BlzQueuePointOrderById
const queueTargetOrderById = BlzQueueTargetOrderById

export type RallyPoint = Unit | Destructable | [x: number, y: number]
export type RallyRoute = ReadonlyArray<RallyPoint>

declare module "./unit" {
    interface Unit {
        rallyRoute: RallyRoute
    }
}

const rallyRouteByUnit = setmetatable(new LuaMap<Unit, RallyRoute>(), { __mode: "k" })

Unit.onPointOrder[orderId("setrally")].addListener((unit, x, y) => {
    processPoint(unit, x, y)
})

Unit.onPointOrder[orderId("smart")].addListener((unit, x, y) => {
    if (unit.hasAbility(fourCC("ARal"))) {
        processPoint(unit, x, y)
    }
})

Unit.onTargetOrder[orderId("setrally")].addListener((unit, target) => {
    if (target instanceof Unit) {
        processUnit(unit, target)
    } else if (target instanceof Destructable) {
        processDestructible(unit, target)
    }
})

Unit.onTargetOrder[orderId("smart")].addListener((unit, target) => {
    if (unit.hasAbility(fourCC("ARal"))) {
        if (target instanceof Unit) {
            processUnit(unit, target)
        } else if (target instanceof Destructable) {
            processDestructible(unit, target)
        }
    }
})

const processPoint = (unit: Unit, x: number, y: number) => {
    Timer.run(() => {
        const rallyPoint = getUnitRallyPoint(unit.handle)
        if (
            rallyPoint == undefined ||
            x != getLocationX(rallyPoint) ||
            y != getLocationY(rallyPoint)
        ) {
            const rallyRoute = unit.rallyRoute
            ;(rallyRoute as RallyPoint[])[rallyRoute.length] = [x, y]
        } else {
            rallyRouteByUnit.set(unit, [[x, y]])
        }
        removeLocation(rallyPoint)
    })
}

const processUnit = (unit: Unit, rallyPoint: Unit) => {
    Timer.run(() => {
        if (getHandleId(rallyPoint.handle) !== getHandleId(getUnitRallyUnit(unit.handle))) {
            const rallyRoute = unit.rallyRoute
            ;(rallyRoute as RallyPoint[])[rallyRoute.length] = rallyPoint
        } else {
            rallyRouteByUnit.set(unit, [rallyPoint])
        }
    })
}

const processDestructible = (unit: Unit, rallyPoint: Destructable) => {
    Timer.run(() => {
        if (getHandleId(rallyPoint.handle) !== getHandleId(getUnitRallyDestructible(unit.handle))) {
            const rallyRoute = unit.rallyRoute
            ;(rallyRoute as RallyPoint[])[rallyRoute.length] = rallyPoint
        } else {
            rallyRouteByUnit.set(unit, [rallyPoint])
        }
    })
}

Object.defineProperty(Unit.prototype, "rallyRoute", {
    get(this: Unit): RallyRoute {
        {
            const rallyRoute = rallyRouteByUnit.get(this)
            if (rallyRoute !== undefined) {
                return rallyRoute
            }
        }
        const handle = this.handle
        const rallyPoint = getUnitRallyPoint(handle)
        if (rallyPoint != undefined) {
            const x = getLocationX(rallyPoint)
            const y = getLocationY(rallyPoint)
            removeLocation(rallyPoint)
            const rallyRoute: RallyRoute = [[x, y]]
            rallyRouteByUnit.set(this, rallyRoute)
            return rallyRoute
        }
        const rallyUnit = getUnitRallyUnit(handle)
        if (rallyUnit != undefined) {
            const rallyRoute = [Unit.of(rallyUnit)]
            rallyRouteByUnit.set(this, rallyRoute)
            return rallyRoute
        }
        const rallyDestructible = getUnitRallyDestructible(handle)
        const rallyRoute =
            rallyDestructible != undefined ? [Destructable.of(rallyDestructible)] : []
        rallyRouteByUnit.set(this, rallyRoute)
        return rallyRoute
    },
    set(this: Unit, rallyRoute: RallyRoute) {
        const handle = this.handle
        {
            const rallyPoint = rallyRoute[0]
            if (rallyPoint instanceof Handle) {
                issueTargetOrderById(handle, orderId("setrally"), rallyPoint.handle)
            } else if (rallyPoint !== undefined) {
                issuePointOrderById(handle, orderId("setrally"), rallyPoint[0], rallyPoint[1])
            } else {
                issueTargetOrderById(handle, orderId("setrally"), handle)
            }
        }
        for (const i of $range(2, rallyRoute.length)) {
            const rallyPoint = rallyRoute[i - 1]
            if (rallyPoint instanceof Handle) {
                queueTargetOrderById(handle, orderId("setrally"), rallyPoint.handle)
            } else {
                queuePointOrderById(handle, orderId("setrally"), rallyPoint[0], rallyPoint[1])
            }
        }
    },
})
