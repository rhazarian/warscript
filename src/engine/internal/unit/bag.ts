import { Item } from "../item"
import { Unit } from "../unit"

const unitExtendedInventorySize = UnitExtendedInventorySize
const unitHasItemBagged = UnitHasItemBagged
const unitItemInBagSlot = UnitItemInBagSlot

const rawget = _G.rawget
const rawset = _G.rawset
const type = _G.type

const handleByUnitBag = setmetatable(new LuaMap<UnitBag, junit>(), { __mode: "k" })

const unitBagNext = (handle: junit, slot: number) => {
    if (slot >= unitExtendedInventorySize(handle)) {
        return $multi(undefined as unknown as number, undefined)
    }
    return $multi(slot + 1, Item.of(unitItemInBagSlot(handle, slot)))
}

// eslint-disable-next-line @typescript-eslint/no-unsafe-declaration-merging,@typescript-eslint/no-empty-object-type
export interface UnitBag extends ReadonlyArray<Item | undefined> {}

/** A live, zero-based view of a unit's bag. The engine does not expose bag-slot assignment. */
// eslint-disable-next-line @typescript-eslint/no-unsafe-declaration-merging
export class UnitBag {
    public constructor(handle: junit) {
        handleByUnitBag.set(this, handle)
    }

    public has(item: Item): boolean {
        return unitHasItemBagged(handleByUnitBag.get(this)!, item.handle)
    }

    public findSlot(item: Item): number | undefined {
        const handle = handleByUnitBag.get(this)!
        for (const slot of $range(0, unitExtendedInventorySize(handle) - 1)) {
            if (unitItemInBagSlot(handle, slot) === item.handle) {
                return slot
            }
        }
        return undefined
    }

    protected __index(key: string | number): unknown {
        if (type(key) === "number") {
            return Item.of(unitItemInBagSlot(handleByUnitBag.get(this)!, (key as number) - 1))
        }
        return rawget(UnitBag.prototype as any, key)
    }

    protected __len(): number {
        return unitExtendedInventorySize(handleByUnitBag.get(this)!)
    }

    protected __ipairs(): LuaIterator<LuaMultiReturn<[number, Item | undefined]>, junit> {
        return $multi(unitBagNext, handleByUnitBag.get(this)!, 0)
    }
}

declare module "../unit" {
    interface Unit {
        readonly bag: UnitBag
    }
}

Object.defineProperty(Unit.prototype, "bag", {
    get(this: Unit): UnitBag {
        const bag = new UnitBag(this.handle)
        rawset(this, "bag", bag)
        return bag
    },
})
