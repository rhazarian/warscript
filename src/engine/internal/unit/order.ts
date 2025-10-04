import { attribute } from "../../../attributes"
import { Widget } from "../../../core/types/widget"
import { Unit } from "../unit"
import { elapsedTime } from "../../../core/game"
import { EventListenerPriority } from "../../../event"

const getUnitCurrentOrder = GetUnitCurrentOrder
const issueImmediateOrderById = IssueImmediateOrderById
const issuePointOrderById = IssuePointOrderById
const issueTargetOrderById = IssueTargetOrderById

export const enum OrderType {
    IMMEDIATE,
    POINT,
    TARGET,
}

const unitLastOrderTypeAttribute = attribute<OrderType>()
const unitLastOrderIdAttribute = attribute<number>()
const unitLastOrderStartTimeAttribute = attribute<number>()
const unitLastOrderStartXAttribute = attribute<number>()
const unitLastOrderStartYAttribute = attribute<number>()
const unitLastOrderTargetXAttribute = attribute<number>()
const unitLastOrderTargetYAttribute = attribute<number>()
const unitLastOrderTargetAttribute = attribute<Widget>()

Unit.onImmediateOrder.addListener(EventListenerPriority.HIGHEST, (unit, orderId) => {
    unit.set(unitLastOrderTypeAttribute, OrderType.IMMEDIATE)
    unit.set(unitLastOrderIdAttribute, orderId)
    unit.set(unitLastOrderStartTimeAttribute, elapsedTime())
    unit.set(unitLastOrderStartXAttribute, unit.x)
    unit.set(unitLastOrderStartYAttribute, unit.y)
    unit.set(unitLastOrderTargetXAttribute, undefined)
    unit.set(unitLastOrderTargetYAttribute, undefined)
    unit.set(unitLastOrderTargetAttribute, undefined)
})

Unit.onPointOrder.addListener(EventListenerPriority.HIGHEST, (unit, orderId, x, y) => {
    unit.set(unitLastOrderTypeAttribute, OrderType.POINT)
    unit.set(unitLastOrderIdAttribute, orderId)
    unit.set(unitLastOrderStartTimeAttribute, elapsedTime())
    unit.set(unitLastOrderStartXAttribute, unit.x)
    unit.set(unitLastOrderStartYAttribute, unit.y)
    unit.set(unitLastOrderTargetXAttribute, x)
    unit.set(unitLastOrderTargetYAttribute, y)
    unit.set(unitLastOrderTargetAttribute, undefined)
})

Unit.onTargetOrder.addListener(EventListenerPriority.HIGHEST, (unit, orderId, target) => {
    unit.set(unitLastOrderTypeAttribute, OrderType.TARGET)
    unit.set(unitLastOrderIdAttribute, orderId)
    unit.set(unitLastOrderStartTimeAttribute, elapsedTime())
    unit.set(unitLastOrderStartXAttribute, unit.x)
    unit.set(unitLastOrderStartYAttribute, unit.y)
    unit.set(unitLastOrderTargetXAttribute, target.x)
    unit.set(unitLastOrderTargetYAttribute, target.y)
    unit.set(unitLastOrderTargetAttribute, target)
})

declare module "../unit" {
    interface Unit {
        readonly currentOrderType: OrderType
        readonly currentOrderId: number
        readonly currentOrderStartTime: number
        readonly currentOrderStartX: number
        readonly currentOrderStartY: number
        readonly currentOrderTargetX: number
        readonly currentOrderTargetY: number
        readonly currentOrderTarget?: Widget

        issueOrder(
            ...order:
                | [orderType: OrderType.IMMEDIATE, orderId: number]
                | [orderType: OrderType.POINT, orderId: number, x: number, y: number]
                | [orderType: OrderType.TARGET, orderId: number, target: Widget]
        ): boolean
    }
}

const toUndefinedIfCurrentOrderDoesNotMatchLast = <T>(unit: Unit, value: T): T | undefined => {
    const currentOrderId = getUnitCurrentOrder(unit.handle)
    const lastOrderId = unit.get(unitLastOrderIdAttribute)
    return currentOrderId == lastOrderId ||
        (currentOrderId == orderId("patrolAI") && lastOrderId == orderId("patrol"))
        ? value
        : undefined
}

Object.defineProperty(Unit.prototype, "currentOrderType", {
    get: function (this: Unit): number {
        return (
            toUndefinedIfCurrentOrderDoesNotMatchLast(this, this.get(unitLastOrderTypeAttribute)) ??
            OrderType.IMMEDIATE
        )
    },
})

Object.defineProperty(Unit.prototype, "currentOrderId", {
    get: function (this: Unit): number {
        return (
            toUndefinedIfCurrentOrderDoesNotMatchLast(this, this.get(unitLastOrderIdAttribute)) ?? 0
        )
    },
})

Object.defineProperty(Unit.prototype, "currentOrderStartTime", {
    get: function (this: Unit): number {
        return (
            toUndefinedIfCurrentOrderDoesNotMatchLast(
                this,
                this.get(unitLastOrderStartTimeAttribute),
            ) ?? 0
        )
    },
})

Object.defineProperty(Unit.prototype, "currentOrderStartX", {
    get: function (this: Unit): number {
        return (
            toUndefinedIfCurrentOrderDoesNotMatchLast(
                this,
                this.get(unitLastOrderStartXAttribute),
            ) ?? 0
        )
    },
})

Object.defineProperty(Unit.prototype, "currentOrderStartY", {
    get: function (this: Unit): number {
        return (
            toUndefinedIfCurrentOrderDoesNotMatchLast(
                this,
                this.get(unitLastOrderStartYAttribute),
            ) ?? 0
        )
    },
})

Object.defineProperty(Unit.prototype, "currentOrderTargetX", {
    get: function (this: Unit): number {
        return (
            toUndefinedIfCurrentOrderDoesNotMatchLast(
                this,
                this.get(unitLastOrderTargetXAttribute),
            ) ?? 0
        )
    },
})

Object.defineProperty(Unit.prototype, "currentOrderTargetY", {
    get: function (this: Unit): number {
        return (
            toUndefinedIfCurrentOrderDoesNotMatchLast(
                this,
                this.get(unitLastOrderTargetYAttribute),
            ) ?? 0
        )
    },
})

Object.defineProperty(Unit.prototype, "currentOrderTarget", {
    get: function (this: Unit): Widget | undefined {
        return toUndefinedIfCurrentOrderDoesNotMatchLast(
            this,
            this.get(unitLastOrderTargetAttribute),
        )
    },
})

const issueOrderByType = {
    [OrderType.IMMEDIATE]: issueImmediateOrderById,
    [OrderType.POINT]: issuePointOrderById,
    [OrderType.TARGET]: (unitHandle: junit, orderId: number, widget: Widget): boolean =>
        issueTargetOrderById(unitHandle, orderId, widget.handle),
}

Unit.prototype.issueOrder = function (
    this: Unit,
    orderType: OrderType,
    orderId: number,
    xOrTarget?: number | Widget,
    y?: number,
): boolean {
    return issueOrderByType[orderType](
        this.handle,
        orderId,
        xOrTarget as number & Widget,
        y as number,
    )
}
