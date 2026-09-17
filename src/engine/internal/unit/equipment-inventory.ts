import { Unit, UnitTriggerEvent } from "../unit"
import { Item } from "../item"
import { EquipmentSlot } from "../../object-data/auxiliary/equipment-slot"
import { EquipmentType } from "../../object-data/auxiliary/equipment-type"
import { IgnoreEvent } from "../../../event"
import { dummyUnitId } from "../../../objutil/dummy"
import { ignoreEventsItemTypeIds, isItemIgnoredInEvents } from "./ignore-events-items"
import { BlankItemType } from "../../object-data/entry/item-type/blank"
import { ItemClass } from "../../object-data/auxiliary/item-class"
import type { UnitItemContainer } from "./item-container"

const convertEquipmentType = ConvertEquipmentType
const convertLoadoutSlot = ConvertLoadoutSlot
const getEquippedItem = GetEquippedItem
const getStackingItemSource = BlzGetStackingItemSource
const getStackingItemTarget = BlzGetStackingItemTarget
const getStackingItemTargetPreviousCharges = BlzGetStackingItemTargetPreviousCharges
const getTriggerUnit = GetTriggerUnit
const getUnequippedItem = GetUnequippedItem
const getUnitTypeId = GetUnitTypeId
const unitCanEquipItemOfEquipmentType = UnitCanEquipItemOfEquipmentType
const unitEquipItem = UnitEquipItem
const unitHasAnyItemEquiped = UnitHasAnyItemEquiped
const unitHasItemEquipmentOfType = UnitHasItemEquipmentOfType
const unitHasItemEquipped = UnitHasItemEquipped
const unitHasLoadoutSlotEmpty = UnitHasLoadoutSlotEmpty
const unitItemInEquipmentSlot = UnitItemInEquipmentSlot
const setItemVisible = SetItemVisible
const unitAddItem = UnitAddItem
const unitRemoveItem = UnitRemoveItem
const unitUnequipItem = UnitUnequipItem
const unitUnequipItemFromSlot = UnitUnequipItemFromSlot

const rawget = _G.rawget
const rawset = _G.rawset
const type = _G.type

const EQUIPMENT_INVENTORY_SLOT_COUNT = bj_MAX_EQUIPMENT_INVENTORY

/** @internal For use by internal systems only. */
export const RING_FILLER_ITEM_TYPE_ID = compiletime(() => {
    const itemType = BlankItemType.create()
    itemType.name = "[Warscript/Dummy] Ring Filler"
    itemType.itemClass = ItemClass.EQUIPMENT
    itemType.equipmentType = EquipmentType.RING
    return itemType.id
})

ignoreEventsItemTypeIds.add(RING_FILLER_ITEM_TYPE_ID)

/**
 * Occupies the RING slot while a ring is being equipped into ALTERNATE_RING, since the engine fills the
 * RING slot first.
 */
const ringFillerItem = (() => {
    const item = CreateItem(RING_FILLER_ITEM_TYPE_ID, 0, 0)
    setItemVisible(item, false)
    return item
})()

/** Equips an item the unit may not be carrying yet; the engine picks the slot. */
const unitEquip = (unit: junit, item: jitem): boolean =>
    unitEquipItem(unit, item) || (unitAddItem(unit, item) && unitEquipItem(unit, item))
const handleByUnitEquipmentInventory = setmetatable(new LuaMap<UnitEquipmentInventory, junit>(), {
    __mode: "k",
})

const unitEquipmentInventoryNext = (handle: junit, slot: number) => {
    if (slot >= EQUIPMENT_INVENTORY_SLOT_COUNT) {
        return $multi(undefined as unknown as number, undefined)
    }
    return $multi(slot + 1, Item.of(unitItemInEquipmentSlot(handle, convertLoadoutSlot(slot))))
}

// eslint-disable-next-line @typescript-eslint/no-unsafe-declaration-merging,@typescript-eslint/no-empty-object-type
export interface UnitEquipmentInventory extends UnitItemContainer {}

/**
 * A live view of a unit's equipment inventory, indexed by {@link EquipmentSlot}.
 *
 * Equipment slots are typed, so the engine picks the slot itself when equipping: slot assignment frees
 * the requested slot and then equips the item. The only type with two slots is the ring; equipping into
 * ALTERNATE_RING temporarily occupies RING with a filler ring, mirroring the regular inventory's approach.
 */
// eslint-disable-next-line @typescript-eslint/no-unsafe-declaration-merging
export class UnitEquipmentInventory {
    public constructor(handle: junit) {
        handleByUnitEquipmentInventory.set(this, handle)
    }

    public equip(item: Item): boolean {
        return unitEquipItem(handleByUnitEquipmentInventory.get(this)!, item.handle)
    }

    public unequip(item: Item): void {
        unitUnequipItem(handleByUnitEquipmentInventory.get(this)!, item.handle)
    }

    public unequipSlot(slot: EquipmentSlot): Item | undefined {
        return Item.of(
            unitUnequipItemFromSlot(
                handleByUnitEquipmentInventory.get(this)!,
                convertLoadoutSlot(slot),
            ),
        )
    }

    public has(item: Item): boolean {
        return unitHasItemEquipped(handleByUnitEquipmentInventory.get(this)!, item.handle)
    }

    public hasAny(): boolean {
        return unitHasAnyItemEquiped(handleByUnitEquipmentInventory.get(this)!)
    }

    public isSlotEmpty(slot: EquipmentSlot): boolean {
        return unitHasLoadoutSlotEmpty(
            handleByUnitEquipmentInventory.get(this)!,
            convertLoadoutSlot(slot),
        )
    }

    public hasType(type: EquipmentType): boolean {
        return unitHasItemEquipmentOfType(
            handleByUnitEquipmentInventory.get(this)!,
            convertEquipmentType(type),
        )
    }

    public canEquipType(type: EquipmentType): boolean {
        return unitCanEquipItemOfEquipmentType(
            handleByUnitEquipmentInventory.get(this)!,
            convertEquipmentType(type),
        )
    }

    public findSlot(item: Item): EquipmentSlot | undefined {
        const handle = handleByUnitEquipmentInventory.get(this)!
        for (const slot of $range(0, EQUIPMENT_INVENTORY_SLOT_COUNT - 1)) {
            if (unitItemInEquipmentSlot(handle, convertLoadoutSlot(slot)) === item.handle) {
                return slot as EquipmentSlot
            }
        }
        return undefined
    }

    protected __newindex(slot: number, item: Item | undefined): void {
        const handle = handleByUnitEquipmentInventory.get(this)!
        if (slot < 1 || slot > EQUIPMENT_INVENTORY_SLOT_COUNT) {
            return
        }
        const loadoutSlot = convertLoadoutSlot(slot - 1)
        const previousItem = unitItemInEquipmentSlot(handle, loadoutSlot)
        if (previousItem !== undefined && previousItem !== item?.handle) {
            unitUnequipItemFromSlot(handle, loadoutSlot)
            unitRemoveItem(handle, previousItem)
        }
        if (item !== undefined) {
            const itemHandle = item.handle
            const ringLoadoutSlot = convertLoadoutSlot(EquipmentSlot.RING)
            if (
                slot - 1 == EquipmentSlot.ALTERNATE_RING &&
                unitHasLoadoutSlotEmpty(handle, ringLoadoutSlot)
            ) {
                unitEquip(handle, ringFillerItem)
                unitEquip(handle, itemHandle)
                unitUnequipItemFromSlot(handle, ringLoadoutSlot)
                unitRemoveItem(handle, ringFillerItem)
                setItemVisible(ringFillerItem, false)
            } else {
                unitEquip(handle, itemHandle)
            }
        }
    }

    protected __index(key: string | number): unknown {
        if (type(key) === "number") {
            return Item.of(
                unitItemInEquipmentSlot(
                    handleByUnitEquipmentInventory.get(this)!,
                    convertLoadoutSlot((key as number) - 1),
                ),
            )
        }
        return rawget(UnitEquipmentInventory.prototype as any, key)
    }

    protected __len(): number {
        return EQUIPMENT_INVENTORY_SLOT_COUNT
    }

    protected __ipairs(): LuaIterator<LuaMultiReturn<[number, Item | undefined]>, junit> {
        return $multi(unitEquipmentInventoryNext, handleByUnitEquipmentInventory.get(this)!, 0)
    }
}

declare module "../unit" {
    interface Unit {
        readonly equipmentInventory: UnitEquipmentInventory
    }
    namespace Unit {
        const itemEquippedEvent: UnitTriggerEvent<[item: Item]>
        const itemUnequippedEvent: UnitTriggerEvent<[item: Item]>
        let itemStackedEvent: UnitTriggerEvent<
            [target: Item, source: Item, previousTargetCharges: number]
        >
    }
}

Object.defineProperty(Unit.prototype, "equipmentInventory", {
    get(this: Unit): UnitEquipmentInventory {
        const equipmentInventory = new UnitEquipmentInventory(this.handle)
        rawset(this, "equipmentInventory", equipmentInventory)
        return equipmentInventory
    },
})

rawset(
    Unit,
    "itemEquippedEvent",
    new UnitTriggerEvent<[item: Item]>(EVENT_PLAYER_UNIT_EQUIP_ITEM, () => {
        const unit = getTriggerUnit()!
        const item = getEquippedItem()
        if (getUnitTypeId(unit) !== dummyUnitId && !isItemIgnoredInEvents(item)) {
            return $multi(Unit.of(unit), Item.of(item))
        }
        return $multi(IgnoreEvent)
    }),
)

rawset(
    Unit,
    "itemUnequippedEvent",
    new UnitTriggerEvent<[item: Item]>(EVENT_PLAYER_UNIT_UNEQUIP_ITEM, () => {
        const unit = getTriggerUnit()!
        const item = getUnequippedItem()
        if (getUnitTypeId(unit) !== dummyUnitId && !isItemIgnoredInEvents(item)) {
            return $multi(Unit.of(unit), Item.of(item))
        }
        return $multi(IgnoreEvent)
    }),
)

rawset(
    Unit,
    "itemStackedEvent",
    new UnitTriggerEvent<[target: Item, source: Item, previousTargetCharges: number]>(
        EVENT_PLAYER_UNIT_STACK_ITEM,
        () => {
            const unit = getTriggerUnit()!
            const target = getStackingItemTarget()!
            const source = getStackingItemSource()!
            if (
                getUnitTypeId(unit) !== dummyUnitId &&
                !isItemIgnoredInEvents(target) &&
                !isItemIgnoredInEvents(source)
            ) {
                return $multi(
                    Unit.of(unit),
                    Item.of(target),
                    Item.of(source),
                    getStackingItemTargetPreviousCharges(),
                )
            }
            return $multi(IgnoreEvent)
        },
    ),
)
