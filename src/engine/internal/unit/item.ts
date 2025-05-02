import { Item } from "../item"
import { Unit } from "../unit"

const rawset = _G.rawset

const isItemPowerup = IsItemPowerup
const setItemBooleanField = BlzSetItemBooleanField
const unitAddItem = UnitAddItem
const unitDropItemSlot = UnitDropItemSlot
const unitInventorySize = UnitInventorySize
const unitItemInSlot = UnitItemInSlot
const unitRemoveItemFromSlot = UnitRemoveItemFromSlot

const handleByUnitItems = setmetatable(new LuaMap<UnitItems, junit>(), { __mode: "k" })

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
    constructor(handle: junit) {
        handleByUnitItems.set(this, handle)
    }

    protected __newindex(slot: number, item: Item | undefined): void {
        const handle = handleByUnitItems.get(this)!
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
        return Item.of(unitItemInSlot(handleByUnitItems.get(this)!, slot))
    }

    protected __len(): number {
        return unitInventorySize(handleByUnitItems.get(this)!)
    }
}

declare module "../unit" {
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
