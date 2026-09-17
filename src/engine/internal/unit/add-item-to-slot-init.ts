import { Unit } from "../unit"
import { EventListenerPriority } from "../../../event"

import { unitRemoveFillerItems } from "./add-item-to-slot"

// Fillers must be gone before other listeners of the pickup event inspect the unit's inventories.
Unit.itemPickedUpEvent.addListener(EventListenerPriority.HIGHEST, (unit) => {
    unitRemoveFillerItems(unit.handle)
})
