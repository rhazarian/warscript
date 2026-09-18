import type { Item } from "../item"

const unitHasItem = UnitHasItem
const unitHasItemBagged = UnitHasItemBagged
const unitHasItemEquipped = UnitHasItemEquipped

/** Which of a unit's item containers a slot belongs to. */
export const enum UnitItemContainerType {
    INVENTORY,
    EXTENDED_INVENTORY,
    EQUIPMENT_INVENTORY,
}

export const UNIT_INVENTORY_SLOT_COUNT = 6

export const UNIT_EXTENDED_INVENTORY_SLOT_COUNT = 30

export const UNIT_EQUIPMENT_INVENTORY_SLOT_COUNT = bj_MAX_EQUIPMENT_INVENTORY

/**
 * The API shared by all live views of a unit's item containers: {@link UnitInventory},
 * {@link UnitExtendedInventory} and {@link UnitEquipmentInventory}.
 *
 * Slots are zero-based. Reading `container[slot]` returns the item in the slot, if any; assigning
 * `container[slot] = item` drops whatever the slot held and places the item there (picking it up from
 * wherever it is first), and assigning `undefined` just drops the slot's item.
 */
export interface UnitItemContainer extends ReadonlyArray<Item | undefined> {
    readonly length: number
    has(item: Item): boolean
    findSlot(item: Item): number | undefined
    isSlotEmpty(slot: number): boolean
}

/** @internal For use by internal systems only. */
export const unitOwnsItem = (unitHandle: junit, itemHandle: jitem): boolean =>
    unitHasItem(unitHandle, itemHandle) ||
    unitHasItemBagged(unitHandle, itemHandle) ||
    unitHasItemEquipped(unitHandle, itemHandle)
