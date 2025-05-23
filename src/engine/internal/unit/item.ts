import { Item } from "../item"
import { Unit } from "../unit"
import { findUnitItemSlot } from "../utility"
import { unitAddItemToSlot } from "./add-item-to-slot"

const rawset = _G.rawset
const type = _G.type

const isItemPowerup = IsItemPowerup
const setItemBooleanField = BlzSetItemBooleanField
const unitInventorySize = UnitInventorySize
const unitItemInSlot = UnitItemInSlot
const unitRemoveItemFromSlot = UnitRemoveItemFromSlot

const handleByUnitItems = setmetatable(new LuaMap<UnitItems, junit>(), { __mode: "k" })

const unitItemsNext = (handle: junit, index: number) => {
    const slot = index & 0b111
    if (index >>> 3 == slot) {
        return $multi(undefined as unknown as number, undefined)
    }
    return $multi(index + 1, Item.of(unitItemInSlot(handle, slot)))
}

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

    public findSlot(item: Item): 0 | 1 | 2 | 3 | 4 | 5 | undefined {
        return findUnitItemSlot(handleByUnitItems.get(this)!, item.handle)
    }

    protected __newindex(slot: number, item: Item | undefined): void {
        const handle = handleByUnitItems.get(this)!
        if (slot < 1 || slot > unitInventorySize(handle)) {
            return
        }
        unitRemoveItemFromSlot(handle, slot - 1)
        if (item !== undefined) {
            const itemHandle = item.handle
            const isPowerup = isItemPowerup(itemHandle)
            if (isPowerup) {
                setItemBooleanField(itemHandle, ITEM_BF_USE_AUTOMATICALLY_WHEN_ACQUIRED, false)
            }
            unitAddItemToSlot(handle, itemHandle, slot - 1)
            if (isPowerup) {
                setItemBooleanField(itemHandle, ITEM_BF_USE_AUTOMATICALLY_WHEN_ACQUIRED, true)
            }
        }
    }

    protected __index(key: string | number): unknown {
        if (type(key) == "number") {
            return Item.of(unitItemInSlot(handleByUnitItems.get(this)!, (key as number) - 1))
        }
        return rawget(UnitItems.prototype as any, key)
    }

    protected __len(): number {
        return unitInventorySize(handleByUnitItems.get(this)!)
    }

    protected __ipairs(): LuaIterator<LuaMultiReturn<[number, Item | undefined]>, junit> {
        const handle = handleByUnitItems.get(this)!
        return $multi(unitItemsNext, handle, unitInventorySize(handle) << 3)
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
