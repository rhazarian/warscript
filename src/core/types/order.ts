import { Unit } from "./unit"
import { Item } from "./item"
import { Destructable } from "./destructable"
import { elapsedTime } from "../game"

const getUnitCurrentOrder = GetUnitCurrentOrder

export type Order = { id: number; startX: number; startY: number; issueTime: number } & (
    | {
          type: "immediate"
      }
    | {
          type: "point"
          targetX: number
          targetY: number
      }
    | {
          type: "target"
          target: Unit | Item | Destructable
      }
)

const orders = setmetatable(new LuaMap<Unit, Order>(), { __mode: "k" })

Unit.onImmediateOrder.addListener((unit, orderId) => {
    orders.set(unit, {
        id: orderId,
        startX: unit.x,
        startY: unit.y,
        issueTime: elapsedTime(),
        type: "immediate",
    })
})

Unit.onPointOrder.addListener((unit, orderId, x, y) => {
    orders.set(unit, {
        id: orderId,
        startX: unit.x,
        startY: unit.y,
        issueTime: elapsedTime(),
        type: "point",
        targetX: x,
        targetY: y,
    })
})

Unit.onTargetOrder.addListener((unit, orderId, target) => {
    orders.set(unit, {
        id: orderId,
        startX: unit.x,
        startY: unit.y,
        issueTime: elapsedTime(),
        type: "target",
        target: target,
    })
})

declare module "../../engine/internal/unit" {
    interface Unit {
        readonly currentOrder: Order
        readonly lastOrder: Order

        issueOrder(order: Order): void
    }
}

Object.defineProperty(Unit.prototype, "currentOrder", {
    get: function () {
        const currentOrderId = getUnitCurrentOrder(this.handle)
        const lastOrder = orders.get(this)
        return lastOrder &&
            (lastOrder.id == currentOrderId ||
                (currentOrderId == orderId("patrolAI") && lastOrder.id == orderId("patrol")))
            ? lastOrder
            : {
                  id: 0,
                  type: "immediate",
              }
    },
})

Object.defineProperty(Unit.prototype, "lastOrder", {
    get: function () {
        return (
            orders.get(this) ?? {
                id: 0,
                type: "immediate",
            }
        )
    },
})

Unit.prototype.issueOrder = function (order: Order): void {
    if (order.type == "immediate") {
        IssueImmediateOrderById(this.handle, order.id)
    } else if (order.type == "point") {
        IssuePointOrderById(this.handle, order.id, order.targetX, order.targetY)
    } else {
        IssueTargetOrderById(this.handle, order.id, order.target.handle)
    }
}
