import { Item } from "./item"
import { Unit } from "./unit"
import { Destructable } from "../../core/types/destructable"
import { Handle } from "../../core/types/handle"
import { RallyRoute } from "./unit+rally"

const isItemPowerup = IsItemPowerup
const setItemBooleanField = BlzSetItemBooleanField
const unitAddItem = UnitAddItem
const unitDropItemSlot = UnitDropItemSlot
const unitInventorySize = UnitInventorySize
const unitItemInSlot = UnitItemInSlot
const unitRemoveItemFromSlot = UnitRemoveItemFromSlot

// eslint-disable-next-line @typescript-eslint/no-unsafe-declaration-merging
export interface UnitItems extends ReadonlyArray<Item | undefined> {
    readonly length: 0 | 1 | 2 | 3 | 4 | 5 | 6
    [0]: Item | undefined
    [1]: Item | undefined
    [2]: Item | undefined
    [3]: Item | undefined
    [4]: Item | undefined
    [5]: Item | undefined
}
// eslint-disable-next-line @typescript-eslint/no-unsafe-declaration-merging
export class UnitItems {
    constructor(private readonly handle: junit) {}

    protected __newindex(slot: number, item: Item | undefined): void {
        const handle = this.handle
        if (slot < 0 || slot >= unitInventorySize(handle)) {
            return
        }
        unitRemoveItemFromSlot(handle, slot)
        if (item !== undefined) {
            const itemHandle = item.handle
            const isPowerup = isItemPowerup(itemHandle)
            if (isPowerup) {
                setItemBooleanField(itemHandle, ITEM_BF_USE_AUTOMATICALLY_WHEN_ACQUIRED, false)
            }
            unitAddItem(handle, itemHandle)
            unitDropItemSlot(handle, itemHandle, slot)
            if (isPowerup) {
                setItemBooleanField(itemHandle, ITEM_BF_USE_AUTOMATICALLY_WHEN_ACQUIRED, true)
            }
        }
    }

    protected __index(slot: number): Item | undefined {
        return Item.of(unitItemInSlot(this.handle, slot))
    }

    protected __len(): number {
        return unitInventorySize(this.handle)
    }
}

declare module "./unit" {
    interface Unit {
        readonly items: UnitItems
    }
}

Object.defineProperty(Unit.prototype, "items", {
    get(this: Unit): UnitItems {
        const items = new UnitItems(this.handle)
        rawset(this, "items", items)
        return items
    },
})
