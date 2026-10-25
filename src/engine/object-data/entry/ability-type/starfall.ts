import { AbilityType, AbilityTypeId } from "../ability-type"
import { ObjectDataEntryLevelFieldValueSupplier } from "../../entry"

/**
 * Priestess of the Moon's Starfall (`AEsf`): a channeled storm striking the enemies around
 * the caster in waves; the channel lasts the ability's duration.
 */
export class StarfallAbilityType extends AbilityType {
    public static override readonly BASE_ID = fourCC("AEsf") as AbilityTypeId

    public get damage(): number[] {
        return this.getNumberLevelField("Esf1")
    }

    public set damage(damage: ObjectDataEntryLevelFieldValueSupplier<number>) {
        this.setNumberLevelField("Esf1", damage)
    }

    public get damageInterval(): number[] {
        return this.getNumberLevelField("Esf2")
    }

    public set damageInterval(damageInterval: ObjectDataEntryLevelFieldValueSupplier<number>) {
        this.setNumberLevelField("Esf2", damageInterval)
    }

    public get structureDamageDecreaseFactor(): number[] {
        return this.getNumberLevelField("Esf3")
    }

    public set structureDamageDecreaseFactor(
        structureDamageDecreaseFactor: ObjectDataEntryLevelFieldValueSupplier<number>,
    ) {
        this.setNumberLevelField("Esf3", structureDamageDecreaseFactor)
    }
}
