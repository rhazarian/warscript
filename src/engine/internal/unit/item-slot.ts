import { Item } from "../item"
import { Unit } from "../unit"
import { EquipmentSlot } from "../../object-data/auxiliary/equipment-slot"

const convertLoadoutSlot = ConvertLoadoutSlot
const unitExtendedInventorySize = UnitExtendedInventorySize
const unitInventorySize = UnitInventorySize
const unitItemInBagSlot = UnitItemInBagSlot
const unitItemInEquipmentSlot = UnitItemInEquipmentSlot
const unitItemInSlot = UnitItemInSlot

export const enum UnitItemContainerType {
    INVENTORY,
    EXTENDED_INVENTORY,
    EQUIPMENT_INVENTORY,
}

export const UNIT_INVENTORY_SLOT_COUNT = 6

export const UNIT_EXTENDED_INVENTORY_SLOT_COUNT = 30

export const UNIT_EQUIPMENT_INVENTORY_SLOT_COUNT = bj_MAX_EQUIPMENT_INVENTORY

/**
 * A slot of one of a unit's item containers (the inventory, the extended inventory or the equipment inventory).
 *
 * There is exactly one instance per (container type, index) pair, so slots can be compared by identity.
 */
export class UnitItemSlot {
    private static readonly inventorySlots: UnitItemSlot[] = []
    private static readonly extendedInventorySlots: UnitItemSlot[] = []
    private static readonly equipmentInventorySlots: UnitItemSlot[] = []

    private constructor(
        public readonly containerType: UnitItemContainerType,
        public readonly index: number,
    ) {}

    public static inventory(index: 0 | 1 | 2 | 3 | 4 | 5): UnitItemSlot {
        return UnitItemSlot.inventorySlots[index]
    }

    public static extendedInventory(index: number): UnitItemSlot {
        return UnitItemSlot.extendedInventorySlots[index]
    }

    public static equipmentInventory(slot: EquipmentSlot): UnitItemSlot {
        return UnitItemSlot.equipmentInventorySlots[slot]
    }

    public static get(containerType: UnitItemContainerType, index: number): UnitItemSlot {
        return UnitItemSlot.slotsByContainerType[containerType][index]
    }

    /** Returns the slot the item currently occupies in the unit's inventory, extended inventory or equipment inventory, if any. */
    public static find(unit: Unit, item: Item): UnitItemSlot | undefined {
        const unitHandle = unit.handle
        const itemHandle = item.handle
        for (const index of $range(0, unitInventorySize(unitHandle) - 1)) {
            if (unitItemInSlot(unitHandle, index) == itemHandle) {
                return UnitItemSlot.inventorySlots[index]
            }
        }
        for (const index of $range(0, unitExtendedInventorySize(unitHandle) - 1)) {
            if (unitItemInBagSlot(unitHandle, index) == itemHandle) {
                return UnitItemSlot.extendedInventorySlots[index]
            }
        }
        for (const index of $range(0, UNIT_EQUIPMENT_INVENTORY_SLOT_COUNT - 1)) {
            if (unitItemInEquipmentSlot(unitHandle, convertLoadoutSlot(index)) == itemHandle) {
                return UnitItemSlot.equipmentInventorySlots[index]
            }
        }
        return undefined
    }

    public getItem(unit: Unit): Item | undefined {
        return Item.of(itemInSlotByContainerType[this.containerType](unit.handle, this.index))
    }

    static {
        for (const index of $range(0, UNIT_INVENTORY_SLOT_COUNT - 1)) {
            UnitItemSlot.inventorySlots[index] = new UnitItemSlot(
                UnitItemContainerType.INVENTORY,
                index,
            )
        }
        for (const index of $range(0, UNIT_EXTENDED_INVENTORY_SLOT_COUNT - 1)) {
            UnitItemSlot.extendedInventorySlots[index] = new UnitItemSlot(
                UnitItemContainerType.EXTENDED_INVENTORY,
                index,
            )
        }
        for (const index of $range(0, UNIT_EQUIPMENT_INVENTORY_SLOT_COUNT - 1)) {
            UnitItemSlot.equipmentInventorySlots[index] = new UnitItemSlot(
                UnitItemContainerType.EQUIPMENT_INVENTORY,
                index,
            )
        }
    }

    private static readonly slotsByContainerType = {
        [UnitItemContainerType.INVENTORY]: UnitItemSlot.inventorySlots,
        [UnitItemContainerType.EXTENDED_INVENTORY]: UnitItemSlot.extendedInventorySlots,
        [UnitItemContainerType.EQUIPMENT_INVENTORY]: UnitItemSlot.equipmentInventorySlots,
    }
}

const itemInSlotByContainerType = {
    [UnitItemContainerType.INVENTORY]: unitItemInSlot,
    [UnitItemContainerType.EXTENDED_INVENTORY]: unitItemInBagSlot,
    [UnitItemContainerType.EQUIPMENT_INVENTORY]: (unitHandle: junit, index: number) =>
        unitItemInEquipmentSlot(unitHandle, convertLoadoutSlot(index)),
}
