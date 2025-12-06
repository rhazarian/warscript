import { Unit } from "../unit"
import { FLY_HEIGHT_UNIT_FIELD } from "../../standard/fields/unit"

declare module "../unit" {
    interface Unit {
        flyHeight: number
    }
}
Object.defineProperty(Unit.prototype, "flyHeight", {
    get(this: Unit): number {
        return FLY_HEIGHT_UNIT_FIELD.getValue(this)
    },
    set(this: Unit, value: number) {
        FLY_HEIGHT_UNIT_FIELD.setValue(this, value)
    },
})
