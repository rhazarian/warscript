import { Unit } from "../unit"
import { resetAutoAttackTimer } from "../unit-missile-launch"

const unitDisableAbility = BlzUnitDisableAbility
const unitInterruptAttack = BlzUnitInterruptAttack

declare module "../unit" {
    interface Unit {
        interruptAttack(this: Unit): void
    }
}
Unit.prototype.interruptAttack = function () {
    unitInterruptAttack(this.handle)
    resetAutoAttackTimer(this)
}

declare module "../unit" {
    interface Unit {
        interruptMovement(this: Unit): void
    }
}
Unit.prototype.interruptMovement = function () {
    const handle = this.handle
    unitDisableAbility(handle, fourCC("Amov"), true, false)
    unitDisableAbility(handle, fourCC("Amov"), false, false)
    resetAutoAttackTimer(this)
}
