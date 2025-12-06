import { Unit } from "../unit"
import {
    AGILITY_UNIT_FIELD,
    INTELLIGENCE_UNIT_FIELD,
    STRENGTH_UNIT_FIELD,
} from "../../standard/fields/unit"

declare module "../unit" {
    interface Unit {
        strengthBase: number
    }
}
Object.defineProperty(Unit.prototype, "strengthBase", {
    get(this: Unit): number {
        return STRENGTH_UNIT_FIELD.getValue(this)
    },
    set(this: Unit, value: number) {
        STRENGTH_UNIT_FIELD.setValue(this, value)
    },
})

declare module "../unit" {
    interface Unit {
        agilityBase: number
    }
}
Object.defineProperty(Unit.prototype, "agilityBase", {
    get(this: Unit): number {
        return AGILITY_UNIT_FIELD.getValue(this)
    },
    set(this: Unit, value: number) {
        AGILITY_UNIT_FIELD.setValue(this, value)
    },
})

declare module "../unit" {
    interface Unit {
        intelligenceBase: number
    }
}
Object.defineProperty(Unit.prototype, "intelligenceBase", {
    get(this: Unit): number {
        return INTELLIGENCE_UNIT_FIELD.getValue(this)
    },
    set(this: Unit, value: number) {
        INTELLIGENCE_UNIT_FIELD.setValue(this, value)
    },
})
