import { AbilityType, AbilityTypeId } from "../ability-type"
import { ObjectDataEntryLevelFieldValueSupplier } from "../../entry"

/** Firelord's Soul Burn (`ANso`). */
export class SoulBurnAbilityType extends AbilityType {
    public static override readonly BASE_ID = fourCC("ANso") as AbilityTypeId

    /** Damage Amount */
    public get damageAmount(): number[] {
        return this.getNumberLevelField("Nso1")
    }

    public set damageAmount(damageAmount: ObjectDataEntryLevelFieldValueSupplier<number>) {
        this.setNumberLevelField("Nso1", damageAmount)
    }

    /** Damage Period */
    public get damagePeriod(): number[] {
        return this.getNumberLevelField("Nso2")
    }

    public set damagePeriod(damagePeriod: ObjectDataEntryLevelFieldValueSupplier<number>) {
        this.setNumberLevelField("Nso2", damagePeriod)
    }

    /** Damage Penalty */
    public get damagePenalty(): number[] {
        return this.getNumberLevelField("Nso3")
    }

    public set damagePenalty(damagePenalty: ObjectDataEntryLevelFieldValueSupplier<number>) {
        this.setNumberLevelField("Nso3", damagePenalty)
    }

    /** Movement Speed Reduction (%) */
    public get movementSpeedReductionFactor(): number[] {
        return this.getNumberLevelField("Nso4")
    }

    public set movementSpeedReductionFactor(
        movementSpeedReductionFactor: ObjectDataEntryLevelFieldValueSupplier<number>,
    ) {
        this.setNumberLevelField("Nso4", movementSpeedReductionFactor)
    }

    /** Attack Speed Reduction (%) */
    public get attackSpeedReductionFactor(): number[] {
        return this.getNumberLevelField("Nso5")
    }

    public set attackSpeedReductionFactor(
        attackSpeedReductionFactor: ObjectDataEntryLevelFieldValueSupplier<number>,
    ) {
        this.setNumberLevelField("Nso5", attackSpeedReductionFactor)
    }
}
