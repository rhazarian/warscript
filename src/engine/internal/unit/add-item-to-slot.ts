import { BlankItemType } from "../../object-data/entry/item-type/blank"
import { array } from "../../../utility/arrays"
import { ignoreEventsItems } from "./ignore-events-items"

const setItemVisible = SetItemVisible
const unitAddItem = UnitAddItem
const unitItemInSlot = UnitItemInSlot
const unitRemoveItem = UnitRemoveItem

const FILLER_ITEM_TYPE_ID = compiletime(() => {
    const itemType = BlankItemType.create()
    itemType.name = "[Warscript/Dummy] Slot Filler"
    return itemType.id
})

/** @internal For use by internal systems only. */
export const fillerItems = array(6, () => {
    const item = CreateItem(FILLER_ITEM_TYPE_ID, 0, 0)
    setItemVisible(item, false)
    ignoreEventsItems.add(item)
    return item
})

/** @internal For use by internal systems only. */
export const unitsWithFillerItems = new LuaSet<junit>()

/** @internal For use by internal systems only. */
export const unitAddItemToSlot = (unit: junit, item: jitem, slot: number): void => {
    for (const previousSlot of $range(0, slot - 1)) {
        if (unitItemInSlot(unit, previousSlot) == undefined) {
            unitAddItem(unit, fillerItems[previousSlot])
            unitsWithFillerItems.add(unit)
        }
    }
    unitAddItem(unit, item)
    if (unitsWithFillerItems.has(unit)) {
        for (const previousSlot of $range(0, slot - 1)) {
            const fillerItem = fillerItems[previousSlot]
            unitRemoveItem(unit, fillerItem)
            setItemVisible(fillerItem, false)
        }
        unitsWithFillerItems.delete(unit)
    }
}
