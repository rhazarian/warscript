import { Item } from "../item"
import { Unit } from "../unit"

const unitExtendedInventorySize = UnitExtendedInventorySize
const unitHasItemBagged = UnitHasItemBagged
const unitItemInBagSlot = UnitItemInBagSlot

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
export interface UnitExtendedInventory extends ReadonlyArray<Item | undefined> {}

/** A live, zero-based view of a unit's extended inventory. The engine does not expose extended-inventory slot assignment. */
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
