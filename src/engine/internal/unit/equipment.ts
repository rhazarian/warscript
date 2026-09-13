import { Unit, UnitTriggerEvent } from "../unit"
import { Item } from "../item"
import { EquipmentSlot } from "../../object-data/auxiliary/equipment-slot"
import { EquipmentType } from "../../object-data/auxiliary/equipment-type"
import { IgnoreEvent } from "../../../event"
import { dummyUnitId } from "../../../objutil/dummy"
import { ignoreEventsItems } from "./ignore-events-items"

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
const unitUnequipItem = UnitUnequipItem
const unitUnequipItemFromSlot = UnitUnequipItemFromSlot

const rawget = _G.rawget
const rawset = _G.rawset
const type = _G.type

const EQUIPMENT_SLOT_COUNT = bj_MAX_EQUIPMENT_INVENTORY
const handleByUnitEquipment = setmetatable(new LuaMap<UnitEquipment, junit>(), { __mode: "k" })

const unitEquipmentNext = (handle: junit, slot: number) => {
    if (slot >= EQUIPMENT_SLOT_COUNT) {
        return $multi(undefined as unknown as number, undefined)
    }
    return $multi(slot + 1, Item.of(unitItemInEquipmentSlot(handle, convertLoadoutSlot(slot))))
}

// eslint-disable-next-line @typescript-eslint/no-unsafe-declaration-merging,@typescript-eslint/no-empty-object-type
export interface UnitEquipment extends ReadonlyArray<Item | undefined> {}

/** A live view indexed by EquipmentSlot. Equip operations let the engine choose the slot. */
// eslint-disable-next-line @typescript-eslint/no-unsafe-declaration-merging
export class UnitEquipment {
    public constructor(handle: junit) {
        handleByUnitEquipment.set(this, handle)
    }

    public equip(item: Item): boolean {
        return unitEquipItem(handleByUnitEquipment.get(this)!, item.handle)
    }

    public unequip(item: Item): void {
        unitUnequipItem(handleByUnitEquipment.get(this)!, item.handle)
    }

    public unequipSlot(slot: EquipmentSlot): Item | undefined {
        return Item.of(
            unitUnequipItemFromSlot(handleByUnitEquipment.get(this)!, convertLoadoutSlot(slot)),
        )
    }

    public has(item: Item): boolean {
        return unitHasItemEquipped(handleByUnitEquipment.get(this)!, item.handle)
    }

    public hasAny(): boolean {
        return unitHasAnyItemEquiped(handleByUnitEquipment.get(this)!)
    }

    public isSlotEmpty(slot: EquipmentSlot): boolean {
        return unitHasLoadoutSlotEmpty(handleByUnitEquipment.get(this)!, convertLoadoutSlot(slot))
    }

    public hasType(type: EquipmentType): boolean {
        return unitHasItemEquipmentOfType(
            handleByUnitEquipment.get(this)!,
            convertEquipmentType(type),
        )
    }

    public canEquipType(type: EquipmentType): boolean {
        return unitCanEquipItemOfEquipmentType(
            handleByUnitEquipment.get(this)!,
            convertEquipmentType(type),
        )
    }

    public findSlot(item: Item): EquipmentSlot | undefined {
        const handle = handleByUnitEquipment.get(this)!
        for (const slot of $range(0, EQUIPMENT_SLOT_COUNT - 1)) {
            if (unitItemInEquipmentSlot(handle, convertLoadoutSlot(slot)) === item.handle) {
                return slot as EquipmentSlot
            }
        }
        return undefined
    }

    protected __index(key: string | number): unknown {
        if (type(key) === "number") {
            return Item.of(
                unitItemInEquipmentSlot(
                    handleByUnitEquipment.get(this)!,
                    convertLoadoutSlot((key as number) - 1),
                ),
            )
        }
        return rawget(UnitEquipment.prototype as any, key)
    }

    protected __len(): number {
        return EQUIPMENT_SLOT_COUNT
    }

    protected __ipairs(): LuaIterator<LuaMultiReturn<[number, Item | undefined]>, junit> {
        return $multi(unitEquipmentNext, handleByUnitEquipment.get(this)!, 0)
    }
}

declare module "../unit" {
    interface Unit {
        readonly equipment: UnitEquipment
    }
    namespace Unit {
        const itemEquippedEvent: UnitTriggerEvent<[item: Item]>
        const itemUnequippedEvent: UnitTriggerEvent<[item: Item]>
        let itemStackedEvent: UnitTriggerEvent<
            [target: Item, source: Item, previousTargetCharges: number]
        >
    }
}

Object.defineProperty(Unit.prototype, "equipment", {
    get(this: Unit): UnitEquipment {
        const equipment = new UnitEquipment(this.handle)
        rawset(this, "equipment", equipment)
        return equipment
    },
})

rawset(
    Unit,
    "itemEquippedEvent",
    new UnitTriggerEvent<[item: Item]>(EVENT_PLAYER_UNIT_EQUIP_ITEM, () => {
        const unit = getTriggerUnit()!
        const item = getEquippedItem()
        if (getUnitTypeId(unit) !== dummyUnitId && !ignoreEventsItems.has(item)) {
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
        if (getUnitTypeId(unit) !== dummyUnitId && !ignoreEventsItems.has(item)) {
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
        () =>
            $multi(
                Unit.of(getTriggerUnit()!),
                Item.of(getStackingItemTarget()!),
                Item.of(getStackingItemSource()!),
                getStackingItemTargetPreviousCharges(),
            ),
    ),
)
