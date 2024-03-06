import { AbilityType, AbilityTypeId } from "../ability-type"
import { ObjectDataEntryLevelFieldValueSupplier } from "../../entry"

export class InnerFireAbilityType extends AbilityType {
    public static override readonly BASE_ID = fourCC("Ainf") as AbilityTypeId

    public get damageIncreaseFactor(): number[] {
        return this.getNumberLevelField("Inf1")
    }

    public set damageIncreaseFactor(
        damageIncreaseFactor: ObjectDataEntryLevelFieldValueSupplier<number>
    ) {
        this.setNumberLevelField("Inf1", damageIncreaseFactor)
    }

    public get armorIncrease(): number[] {
        return this.getNumberLevelField("Inf2")
    }

    public set armorIncrease(armorIncrease: ObjectDataEntryLevelFieldValueSupplier<number>) {
        this.setNumberLevelField("Inf2", armorIncrease)
    }

    public get autoCastRange(): number[] {
        return this.getNumberLevelField("Inf3")
    }

    public set autoCastRange(autoCastRange: ObjectDataEntryLevelFieldValueSupplier<number>) {
        this.setNumberLevelField("Inf3", autoCastRange)
    }

    public get healthRegenerationRateIncrease(): number[] {
        return this.getNumberLevelField("Inf4")
    }

    public set healthRegenerationRateIncrease(
        healthRegenerationRateIncrease: ObjectDataEntryLevelFieldValueSupplier<number>
    ) {
        this.setNumberLevelField("Inf4", healthRegenerationRateIncrease)
    }
}
