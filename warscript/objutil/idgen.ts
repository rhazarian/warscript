const firstValidChar = 48
const lastValidChar = 126

function nextValidCharId(char: number): number | undefined {
    if (char < 48) return 48
    if (char > 126) return undefined
    if (char == 57) return 97
    return char + 1
}

function isIdOccupied(id: string): boolean {
    if (currentMap != undefined) {
        for (const [, v] of pairs(currentMap.objects)) {
            if (v[id] != undefined) {
                return true
            }
        }
    }
    return false
}

function nextIdFrom(id: string): string {
    if (id.length != 4) {
        error("id must be 4-char")
    }

    // the signature of string.byte is wrong for some reason
    let [b1, b2, b3, b4] = string.byte(id, 1, 4)

    do {
        if (b4 < lastValidChar) {
            b4 = nextValidCharId(b4)!
        } else if (b3 < lastValidChar) {
            b4 = firstValidChar
            b3 = nextValidCharId(b3)!
        } else if (b2 < lastValidChar) {
            b4 = firstValidChar
            b3 = firstValidChar
            b2 = nextValidCharId(b2)!
        } else if (b1 < lastValidChar) {
            b4 = firstValidChar
            b3 = firstValidChar
            b2 = firstValidChar
            b1 = nextValidCharId(b1)!
        }
    } while (isIdOccupied(string.char(b1, b2, b3, b4)))

    return string.char(b1, b2, b3, b4)
}

let unitId = "x000"
let heroId = "H000"
let abilityId = "A000"
let doodadId = "DO00"
let destructableId = "X000"
let buffId = "B000"
let itemId = "I000"
let upgradeId = "R000"

export function unit(): string {
    unitId = nextIdFrom(unitId)
    return unitId
}

export function hero(): string {
    heroId = nextIdFrom(heroId)
    return heroId
}

export function ability(): string {
    abilityId = nextIdFrom(abilityId)
    return abilityId
}

export function doodad(): string {
    doodadId = nextIdFrom(doodadId)
    return doodadId
}

export function destructable(): string {
    destructableId = nextIdFrom(destructableId)
    return destructableId
}

export function buff(): string {
    buffId = nextIdFrom(buffId)
    return buffId
}

export function item(): string {
    itemId = nextIdFrom(itemId)
    return itemId
}

export function upgrade(): string {
    upgradeId = nextIdFrom(upgradeId)
    return upgradeId
}
