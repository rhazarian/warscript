import { BlankItemType } from "../../object-data/entry/item-type/blank"
import { array } from "../../../utility/arrays"
import { ignoreEventsItems } from "./ignore-events-items"
import { Unit } from "../unit"
import { EventListenerPriority } from "../../../event"

const setItemVisible = SetItemVisible
const unitAddItem = UnitAddItem
const unitRemoveItem = UnitRemoveItem

const FILLER_ITEM_TYPE_ID = compiletime(() => {
    const itemType = BlankItemType.create()
    itemType.name = "[Warscript/Dummy] Slot Filler"
    return itemType.id
})

const fillerItems = array(6, () => {
    const item = CreateItem(FILLER_ITEM_TYPE_ID, 0, 0)
    setItemVisible(item, false)
    ignoreEventsItems.add(item)
    return item
})

const unitsWithFillerItems = new LuaSet<junit>()

export const unitAddItemToSlot = (unit: junit, item: jitem, slot: number): void => {
    for (const previousSlot of $range(0, slot - 2)) {
        if (unitItemInSlot(unit, previousSlot) == undefined) {
            unitAddItem(unit, fillerItems[previousSlot])
            unitsWithFillerItems.add(unit)
        }
    }
    unitAddItem(unit, itemHandle)
    if (unitsWithFillerItems.has(unit)) {
        for (const previousSlot of $range(0, slot - 2)) {
            const fillerItem = fillerItems[previousSlot]
            unitRemoveItem(unit, fillerItem)
            setItemVisible(fillerItem, false)
        }
        unitsWithFillerItems.delete(unit)
    }
}

Unit.itemPickedUpEvent.addListener(EventListenerPriority.HIGHEST, (unit) => {
    const handle = unit.handle
    if (unitsWithFillerItems.has(handle)) {
        for (const previousSlot of $range(1, 6)) {
            const fillerItem = fillerItems[previousSlot - 1]
            unitRemoveItem(handle, fillerItem)
            setItemVisible(fillerItem, false)
        }
        unitsWithFillerItems.delete(handle)
    }
})
