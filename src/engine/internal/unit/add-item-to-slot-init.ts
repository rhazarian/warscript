import { Unit } from "../unit"
import { EventListenerPriority } from "../../../event"

import { fillerItems, unitsWithFillerItems } from "./add-item-to-slot"

const setItemVisible = SetItemVisible
const unitRemoveItem = UnitRemoveItem

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
