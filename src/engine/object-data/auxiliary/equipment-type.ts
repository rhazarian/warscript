import { invertRecord } from "../../../utility/records"

export const enum EquipmentType {
    NONE = 0,
    HEAD = 1,
    CHEST = 2,
    GLOVES = 3,
    BOOTS = 4,
    RING = 5,
    PRIMARY = 6,
    OFFHAND = 7,
    TRINKET = 8,
}

const stringByEquipmentType = {
    [EquipmentType.NONE]: "None",
    [EquipmentType.HEAD]: "Head",
    [EquipmentType.CHEST]: "Chest",
    [EquipmentType.GLOVES]: "Gloves",
    [EquipmentType.BOOTS]: "Boots",
    [EquipmentType.RING]: "Ring",
    [EquipmentType.PRIMARY]: "Primary",
    [EquipmentType.OFFHAND]: "Offhand",
    [EquipmentType.TRINKET]: "Trinket",
} as const

const equipmentTypeByString: Record<string, EquipmentType | undefined> =
    invertRecord(stringByEquipmentType)

/** @internal For use by internal systems only. */
export const equipmentTypeToString = (equipmentType: EquipmentType): string => {
    return stringByEquipmentType[equipmentType]
}

/** @internal For use by internal systems only. */
export const stringToEquipmentType = (string: string): EquipmentType => {
    return equipmentTypeByString[string] ?? EquipmentType.NONE
}
