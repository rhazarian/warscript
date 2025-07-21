import { invertRecord } from "../../../utility/records"

export const enum MovementType {
    NONE = 0,
    FOOT = 1,
    FLY = 2,
    HORSE = 4,
    HOVER = 8,
    FLOAT = 16,
    AMPHIBIOUS = 32,
}

const stringByMovementType = {
    [MovementType.NONE]: "",
    [MovementType.FLOAT]: "float",
    [MovementType.FLY]: "fly",
    [MovementType.FOOT]: "foot",
    [MovementType.HORSE]: "horse",
    [MovementType.HOVER]: "hover",
    [MovementType.AMPHIBIOUS]: "amph",
} as const

const movementTypeByString: Record<string, MovementType | undefined> =
    invertRecord(stringByMovementType)

/** @internal For use by internal systems only. */
export const movementTypeToString = (movementType: MovementType): string => {
    return stringByMovementType[movementType]
}

/** @internal For use by internal systems only. */
export const stringToMovementType = (string: string): MovementType => {
    return movementTypeByString[string] ?? MovementType.NONE
}
