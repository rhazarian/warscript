import { attribute } from "../../../attributes"
import { Widget } from "../../../core/types/widget"
import { Unit } from "../unit"
import { elapsedTime } from "../../../core/game"
import { EventListenerPriority } from "../../../event"
import { OrderType } from "../../object-data/auxiliary/order-type"

const getUnitCurrentOrder = GetUnitCurrentOrder
const issueImmediateOrderById = IssueImmediateOrderById
const issuePointOrderById = IssuePointOrderById
const issueTargetOrderById = IssueTargetOrderById

export const enum OrderKind {
    IMMEDIATE,
    POINT,
    TARGET,
}

const unitLastOrderKindAttribute = attribute<OrderKind>()
const unitLastOrderIdAttribute = attribute<number>()
const unitLastOrderStartTimeAttribute = attribute<number>()
const unitLastOrderStartXAttribute = attribute<number>()
const unitLastOrderStartYAttribute = attribute<number>()
const unitLastOrderTargetXAttribute = attribute<number>()
const unitLastOrderTargetYAttribute = attribute<number>()
const unitLastOrderTargetAttribute = attribute<Widget>()

Unit.onImmediateOrder.addListener(EventListenerPriority.HIGHEST, (unit, orderId) => {
    unit.set(unitLastOrderKindAttribute, OrderKind.IMMEDIATE)
    unit.set(unitLastOrderIdAttribute, orderId)
    unit.set(unitLastOrderStartTimeAttribute, elapsedTime())
    unit.set(unitLastOrderStartXAttribute, unit.x)
    unit.set(unitLastOrderStartYAttribute, unit.y)
    unit.set(unitLastOrderTargetXAttribute, undefined)
    unit.set(unitLastOrderTargetYAttribute, undefined)
    unit.set(unitLastOrderTargetAttribute, undefined)
})

Unit.onPointOrder.addListener(EventListenerPriority.HIGHEST, (unit, orderId, x, y) => {
    unit.set(unitLastOrderKindAttribute, OrderKind.POINT)
    unit.set(unitLastOrderIdAttribute, orderId)
    unit.set(unitLastOrderStartTimeAttribute, elapsedTime())
    unit.set(unitLastOrderStartXAttribute, unit.x)
    unit.set(unitLastOrderStartYAttribute, unit.y)
    unit.set(unitLastOrderTargetXAttribute, x)
    unit.set(unitLastOrderTargetYAttribute, y)
    unit.set(unitLastOrderTargetAttribute, undefined)
})

Unit.onTargetOrder.addListener(EventListenerPriority.HIGHEST, (unit, orderId, target) => {
    unit.set(unitLastOrderKindAttribute, OrderKind.TARGET)
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
        readonly currentOrderKind: OrderKind
        readonly currentOrderId: number
        readonly currentOrderStartTime: number
        readonly currentOrderStartX: number
        readonly currentOrderStartY: number
        readonly currentOrderTargetX: number
        readonly currentOrderTargetY: number
        readonly currentOrderTarget?: Widget

        issueOrder(
            ...order:
                | [orderType: OrderKind.IMMEDIATE, orderId: number]
                | [orderType: OrderKind.POINT, orderId: number, x: number, y: number]
                | [orderType: OrderKind.TARGET, orderId: number, target: Widget]
        ): boolean
    }
}

const toUndefinedIfCurrentOrderDoesNotMatchLast = <T>(unit: Unit, value: T): T | undefined => {
    const currentOrderId = getUnitCurrentOrder(unit.handle)
    const lastOrderId = unit.get(unitLastOrderIdAttribute)
    return currentOrderId == lastOrderId ||
        (currentOrderId == OrderType.AI_PATROL && lastOrderId == OrderType.PATROL)
        ? value
        : undefined
}

Object.defineProperty(Unit.prototype, "currentOrderKind", {
    get: function (this: Unit): number {
        return (
            toUndefinedIfCurrentOrderDoesNotMatchLast(this, this.get(unitLastOrderKindAttribute)) ??
            OrderKind.IMMEDIATE
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

const issueOrderByKind = {
    [OrderKind.IMMEDIATE]: issueImmediateOrderById,
    [OrderKind.POINT]: issuePointOrderById,
    [OrderKind.TARGET]: (unitHandle: junit, orderId: number, widget: Widget): boolean =>
        issueTargetOrderById(unitHandle, orderId, widget.handle),
}

Unit.prototype.issueOrder = function (
    this: Unit,
    orderKind: OrderKind,
    orderId: number,
    xOrTarget?: number | Widget,
    y?: number,
): boolean {
    return issueOrderByKind[orderKind](
        this.handle,
        orderId,
        xOrTarget as number & Widget,
        y as number,
    )
}
