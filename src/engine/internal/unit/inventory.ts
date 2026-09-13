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

const handleByUnitInventory = setmetatable(new LuaMap<UnitInventory, junit>(), { __mode: "k" })

const unitInventoryNext = (handle: junit, slot: number) => {
    if (slot >= unitInventorySize(handle)) {
        return $multi(undefined as unknown as number, undefined)
    }
    return $multi(slot + 1, Item.of(unitItemInSlot(handle, slot)))
}

// eslint-disable-next-line @typescript-eslint/no-unsafe-declaration-merging
export interface UnitInventory extends ReadonlyArray<Item | undefined> {
    readonly length: 0 | 1 | 2 | 3 | 4 | 5 | 6
    [0]: Item | undefined
    [1]: Item | undefined
    [2]: Item | undefined
    [3]: Item | undefined
    [4]: Item | undefined
    [5]: Item | undefined
}
// eslint-disable-next-line @typescript-eslint/no-unsafe-declaration-merging
export class UnitInventory {
    constructor(handle: junit) {
        handleByUnitInventory.set(this, handle)
    }

    public findSlot(item: Item): 0 | 1 | 2 | 3 | 4 | 5 | undefined {
        return findUnitItemSlot(handleByUnitInventory.get(this)!, item.handle)
    }

    protected __newindex(slot: number, item: Item | undefined): void {
        const handle = handleByUnitInventory.get(this)!
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
            return Item.of(unitItemInSlot(handleByUnitInventory.get(this)!, (key as number) - 1))
        }
        return rawget(UnitInventory.prototype as any, key)
    }

    protected __len(): number {
        return unitInventorySize(handleByUnitInventory.get(this)!)
    }

    protected __ipairs(): LuaIterator<LuaMultiReturn<[number, Item | undefined]>, junit> {
        const handle = handleByUnitInventory.get(this)!
        return $multi(unitInventoryNext, handle, 0)
    }
}

declare module "../unit" {
    interface Unit {
        readonly inventory: UnitInventory
    }
}

Object.defineProperty(Unit.prototype, "inventory", {
    get(this: Unit): UnitInventory {
        const inventory = new UnitInventory(this.handle)
        rawset(this, "inventory", inventory)
        return inventory
    },
})
