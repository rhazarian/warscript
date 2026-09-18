import { Item } from "../item"
import { Unit } from "../unit"
import { Event } from "../../../event"
import { OrderType } from "../../object-data/auxiliary/order-type"
import { UnitItemContainerType } from "./item-container"
import { UnitItemSlot } from "./item-slot"

const invoke = Event.invoke

declare module "../unit" {
    namespace Unit {
        /** A unit was ordered to use the item in a slot of any of its item containers. */
        const itemUseOrderEvent: Event<[unit: Unit, item: Item]>
        /** A unit was ordered to move an item between slots of its item containers. */
        const itemMoveOrderEvent: Event<
            [unit: Unit, item: Item, slotFrom: UnitItemSlot, slotTo: UnitItemSlot]
        >
    }
}

// Kept out of the unit module itself: its chunk is at Lua's local variable limit.

Object.defineProperty(Unit, "itemUseOrderEvent", {
    get(): Event<[unit: Unit, item: Item]> {
        const event = new Event<[Unit, Item]>()
        const addListeners = (
            firstOrderType: OrderType,
            lastOrderType: OrderType,
            containerType: UnitItemContainerType,
        ) => {
            for (const orderType of $range(firstOrderType, lastOrderType)) {
                const slot = UnitItemSlot.get(containerType, orderType - firstOrderType)
                const listener = (unit: Unit) => {
                    const item = slot.getItem(unit)
                    if (item !== undefined) {
                        invoke(event, unit, item)
                    }
                }
                Unit.onImmediateOrder[orderType].addListener(listener)
                Unit.onTargetOrder[orderType].addListener(listener)
                Unit.onPointOrder[orderType].addListener(listener)
            }
        }
        addListeners(OrderType.USE_SLOT_0, OrderType.USE_SLOT_5, UnitItemContainerType.INVENTORY)
        addListeners(
            OrderType.USE_SLOT_EXT_0,
            OrderType.USE_SLOT_EXT_29,
            UnitItemContainerType.EXTENDED_INVENTORY,
        )
        addListeners(
            OrderType.USE_SLOT_EQUIP_0,
            OrderType.USE_SLOT_EQUIP_8,
            UnitItemContainerType.EQUIPMENT_INVENTORY,
        )
        rawset(Unit, "itemUseOrderEvent", event)
        return event
    },
})

Object.defineProperty(Unit, "itemMoveOrderEvent", {
    get(): Event<[unit: Unit, item: Item, slotFrom: UnitItemSlot, slotTo: UnitItemSlot]> {
        const event = new Event<[Unit, Item, UnitItemSlot, UnitItemSlot]>()
        const addListeners = (
            firstOrderType: OrderType,
            lastOrderType: OrderType,
            containerType: UnitItemContainerType,
        ) => {
            for (const orderType of $range(firstOrderType, lastOrderType)) {
                const slotTo = UnitItemSlot.get(containerType, orderType - firstOrderType)
                Unit.onTargetOrder[orderType].addListener((unit, item) => {
                    const slotFrom = UnitItemSlot.find(unit, item as Item)
                    if (slotFrom !== undefined) {
                        invoke(event, unit, item, slotFrom, slotTo)
                    }
                })
            }
        }
        addListeners(OrderType.MOVE_SLOT_0, OrderType.MOVE_SLOT_5, UnitItemContainerType.INVENTORY)
        addListeners(
            OrderType.MOVE_SLOT_EXT_0,
            OrderType.MOVE_SLOT_EXT_29,
            UnitItemContainerType.EXTENDED_INVENTORY,
        )
        addListeners(
            OrderType.MOVE_SLOT_EQUIP_0,
            OrderType.MOVE_SLOT_EQUIP_8,
            UnitItemContainerType.EQUIPMENT_INVENTORY,
        )
        rawset(Unit, "itemMoveOrderEvent", event)
        return event
    },
})
