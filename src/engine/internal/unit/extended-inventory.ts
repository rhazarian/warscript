import { Item } from "../item"
import { Unit } from "../unit"
import { unitOwnsItem } from "./item-container"
import type { UnitItemContainer } from "./item-container"
import { unitAddItemToSlot } from "./add-item-to-slot"
import { UnitItemContainerType } from "./item-slot"

const unitExtendedInventorySize = UnitExtendedInventorySize
const unitHasItemBagged = UnitHasItemBagged
const unitItemInBagSlot = UnitItemInBagSlot
const unitRemoveItem = UnitRemoveItem
const isItemPowerup = IsItemPowerup
const setItemBooleanField = BlzSetItemBooleanField

const rawget = _G.rawget
const rawset = _G.rawset
const type = _G.type

const handleByUnitExtendedInventory = setmetatable(new LuaMap<UnitExtendedInventory, junit>(), {
    __mode: "k",
})

const unitExtendedInventoryNext = (handle: junit, slot: number) => {
    if (slot >= unitExtendedInventorySize(handle)) {
        return $multi(undefined as unknown as number, undefined)
    }
    return $multi(slot + 1, Item.of(unitItemInBagSlot(handle, slot)))
}

// eslint-disable-next-line @typescript-eslint/no-unsafe-declaration-merging,@typescript-eslint/no-empty-object-type
export interface UnitExtendedInventory extends UnitItemContainer {}

/**
 * A live, zero-based view of a unit's extended inventory.
 *
 * Slot assignment works like the regular inventory's, see {@link unitAddItemToSlot}.
 */
// eslint-disable-next-line @typescript-eslint/no-unsafe-declaration-merging
export class UnitExtendedInventory {
    public constructor(handle: junit) {
        handleByUnitExtendedInventory.set(this, handle)
    }

    public has(item: Item): boolean {
        return unitHasItemBagged(handleByUnitExtendedInventory.get(this)!, item.handle)
    }

    public findSlot(item: Item): number | undefined {
        const handle = handleByUnitExtendedInventory.get(this)!
        for (const slot of $range(0, unitExtendedInventorySize(handle) - 1)) {
            if (unitItemInBagSlot(handle, slot) === item.handle) {
                return slot
            }
        }
        return undefined
    }

    public isSlotEmpty(slot: number): boolean {
        return unitItemInBagSlot(handleByUnitExtendedInventory.get(this)!, slot) === undefined
    }

    protected __newindex(slot: number, item: Item | undefined): void {
        const handle = handleByUnitExtendedInventory.get(this)!
        if (slot < 1 || slot > unitExtendedInventorySize(handle)) {
            return
        }
        const previousItem = unitItemInBagSlot(handle, slot - 1)
        if (previousItem !== undefined && previousItem !== item?.handle) {
            unitRemoveItem(handle, previousItem)
        }
        if (item !== undefined) {
            const itemHandle = item.handle
            if (unitOwnsItem(handle, itemHandle)) {
                unitRemoveItem(handle, itemHandle)
            }
            const isPowerup = isItemPowerup(itemHandle)
            if (isPowerup) {
                setItemBooleanField(itemHandle, ITEM_BF_USE_AUTOMATICALLY_WHEN_ACQUIRED, false)
            }
            unitAddItemToSlot(
                handle,
                itemHandle,
                slot - 1,
                UnitItemContainerType.EXTENDED_INVENTORY,
            )
            if (isPowerup) {
                setItemBooleanField(itemHandle, ITEM_BF_USE_AUTOMATICALLY_WHEN_ACQUIRED, true)
            }
        }
    }

    protected __index(key: string | number): unknown {
        if (type(key) === "number") {
            return Item.of(
                unitItemInBagSlot(handleByUnitExtendedInventory.get(this)!, (key as number) - 1),
            )
        }
        return rawget(UnitExtendedInventory.prototype as any, key)
    }

    protected __len(): number {
        return unitExtendedInventorySize(handleByUnitExtendedInventory.get(this)!)
    }

    protected __ipairs(): LuaIterator<LuaMultiReturn<[number, Item | undefined]>, junit> {
        return $multi(unitExtendedInventoryNext, handleByUnitExtendedInventory.get(this)!, 0)
    }
}

declare module "../unit" {
    interface Unit {
        readonly extendedInventory: UnitExtendedInventory
    }
}

Object.defineProperty(Unit.prototype, "extendedInventory", {
    get(this: Unit): UnitExtendedInventory {
        const extendedInventory = new UnitExtendedInventory(this.handle)
        rawset(this, "extendedInventory", extendedInventory)
        return extendedInventory
    },
})
