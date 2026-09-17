import { BlankItemType } from "../../object-data/entry/item-type/blank"
import { array } from "../../../utility/arrays"
import { ignoreEventsItemTypeIds } from "./ignore-events-items"
import {
    UNIT_EXTENDED_INVENTORY_SLOT_COUNT,
    UNIT_INVENTORY_SLOT_COUNT,
    UnitItemContainerType,
} from "./item-slot"

const setItemVisible = SetItemVisible
const unitAddItem = UnitAddItem
const unitInventorySize = UnitInventorySize
const unitItemInBagSlot = UnitItemInBagSlot
const unitItemInSlot = UnitItemInSlot
const unitRemoveItem = UnitRemoveItem

/** @internal For use by internal systems only. */
export const SLOT_FILLER_ITEM_TYPE_ID = compiletime(() => {
    const itemType = BlankItemType.create()
    itemType.name = "[Warscript/Dummy] Slot Filler"
    return itemType.id
})

ignoreEventsItemTypeIds.add(SLOT_FILLER_ITEM_TYPE_ID)

/**
 * Enough fillers to occupy every regular and extended inventory slot that precedes the last extended one.
 *
 * @internal For use by internal systems only.
 */
export const fillerItems = array(
    UNIT_INVENTORY_SLOT_COUNT + UNIT_EXTENDED_INVENTORY_SLOT_COUNT,
    () => {
        const item = CreateItem(SLOT_FILLER_ITEM_TYPE_ID, 0, 0)
        setItemVisible(item, false)
        return item
    },
)

/** @internal For use by internal systems only. */
export const unitsWithFillerItems = new LuaSet<junit>()

/** @internal For use by internal systems only. */
export const unitRemoveFillerItems = (unit: junit): void => {
    if (unitsWithFillerItems.has(unit)) {
        for (const fillerItem of fillerItems) {
            unitRemoveItem(unit, fillerItem)
            setItemVisible(fillerItem, false)
        }
        unitsWithFillerItems.delete(unit)
    }
}

/**
 * Adds an item to a unit so that it lands in a specific slot of its regular or extended inventory.
 *
 * The engine fills slots in order (the regular inventory first, then the extended one), so every empty slot
 * preceding the target is temporarily occupied by a filler item. Unlike `moveslot` orders, this works
 * regardless of whether the unit can currently act.
 *
 * @internal For use by internal systems only.
 */
export const unitAddItemToSlot = (
    unit: junit,
    item: jitem,
    slot: number,
    containerType:
        | UnitItemContainerType.INVENTORY
        | UnitItemContainerType.EXTENDED_INVENTORY = UnitItemContainerType.INVENTORY,
): boolean => {
    let fillerCount = 0
    const fillEmptySlots = (
        slotCount: number,
        itemInSlot: (unit: junit, slot: number) => jitem | undefined,
    ) => {
        for (const precedingSlot of $range(0, slotCount - 1)) {
            if (itemInSlot(unit, precedingSlot) == undefined) {
                unitAddItem(unit, fillerItems[fillerCount])
                fillerCount++
            }
        }
    }
    if (containerType == UnitItemContainerType.INVENTORY) {
        fillEmptySlots(slot, unitItemInSlot)
    } else {
        fillEmptySlots(unitInventorySize(unit), unitItemInSlot)
        fillEmptySlots(slot, unitItemInBagSlot)
    }
    if (fillerCount > 0) {
        unitsWithFillerItems.add(unit)
    }
    const result = unitAddItem(unit, item)
    if (unitsWithFillerItems.has(unit)) {
        for (const fillerIndex of $range(0, fillerCount - 1)) {
            const fillerItem = fillerItems[fillerIndex]
            unitRemoveItem(unit, fillerItem)
            setItemVisible(fillerItem, false)
        }
        unitsWithFillerItems.delete(unit)
    }
    return result
}
