import { checkNotNull } from "../../../utility/preconditions"

const nextValidChar = (char: number): number => {
    if (char < 48 || char > 126) return 48
    if (char == 57) return 97
    return char + 1
}

const isIdOccupied = (id: string): boolean => {
    if (currentMap != undefined) {
        for (const [, objectData] of pairs(currentMap.objects)) {
            if (objectData.getObject(id) != undefined) {
                return true
            }
        }
    }
    return false
}

const nextIdFrom = (id: number): number | undefined => {
    let [b1, b2, b3, b4] = string.byte(util.id2s(id), 1, 4)
    while (isIdOccupied(string.char(b1, b2, b3, b4))) {
        if (b4 < 126) {
            b4 = nextValidChar(b4)
        } else if (b3 < 126) {
            b4 = 48
            b3 = nextValidChar(b3)
        } else if (b2 < 126) {
            b4 = 48
            b3 = 48
            b2 = nextValidChar(b2)
        } else if (b1 < 126) {
            b4 = 48
            b3 = 48
            b2 = 48
            b1 = nextValidChar(b1)
        } else {
            return undefined
        }
    }
    return util.s2id(string.char(b1, b2, b3, b4))
}

export class ObjectDataEntryIdGenerator {
    private id: number

    public constructor(firstId: number) {
        this.id = firstId
    }

    public next(): number {
        const id = checkNotNull(nextIdFrom(this.id))
        this.id = id
        return id
    }
}

/** @internal For use by internal systems only. */
export const abilityTypeIdGenerator = new ObjectDataEntryIdGenerator(fourCC("A000"))
