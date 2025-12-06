import { Unit } from "../unit"
import { SCALING_VALUE_UNIT_FIELD } from "../../standard/fields/unit"

declare module "../unit" {
    interface Unit {
        scale: number
    }
}
Object.defineProperty(Unit.prototype, "scale", {
    get(this: Unit): number {
        return SCALING_VALUE_UNIT_FIELD.getValue(this)
    },
    set(this: Unit, value: number) {
        SCALING_VALUE_UNIT_FIELD.setValue(this, value)
    },
})
