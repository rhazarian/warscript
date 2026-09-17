import { Item } from "./item"

import { Unit } from "./unit"
import "./unit/equipment-inventory"
import { EventListenerPriority } from "../../event"
import { ownerByItem } from "./item/owner-cache"

const unitHasItem = UnitHasItem
const unitHasItemBagged = UnitHasItemBagged
const unitHasItemEquipped = UnitHasItemEquipped

declare module "./item" {
    interface Item {
        /** The unit carrying the item in any of its inventories (regular, extended or equipment), if any. */
        readonly owner?: Unit
    }
}

const unitOwnsItem = (unitHandle: junit, itemHandle: jitem): boolean =>
    unitHasItem(unitHandle, itemHandle) ||
    unitHasItemBagged(unitHandle, itemHandle) ||
    unitHasItemEquipped(unitHandle, itemHandle)

Unit.itemPickedUpEvent.addListener(EventListenerPriority.HIGHEST, (unit, item) => {
    ownerByItem.set(item, unit)
})

Unit.itemEquippedEvent.addListener(EventListenerPriority.HIGHEST, (unit, item) => {
    ownerByItem.set(item, unit)
})

// Unequipping may move the item into another inventory of the same unit or drop it on the ground.
Unit.itemUnequippedEvent.addListener(EventListenerPriority.HIGHEST, (unit, item) => {
    if (!unitOwnsItem(unit.handle, item.handle)) {
        ownerByItem.delete(item)
    }
})

Unit.itemDroppedEvent.addListener(EventListenerPriority.HIGHEST, (unit, item) => {
    ownerByItem.delete(item)
})

Object.defineProperty(Item.prototype, "owner", {
    get(this: Item): Unit | undefined {
        const owner = ownerByItem.get(this)
        // Items can leave a unit without a drop event (selling, pawning, scripted removal, ...),
        // so never trust the cache alone.
        if (owner !== undefined && !unitOwnsItem(owner.handle, this.handle)) {
            ownerByItem.delete(this)
            return undefined
        }
        return owner
    },
})
