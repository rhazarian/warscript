import { AbilityType, AbilityTypeId } from "../ability-type"
import { ObjectDataEntryLevelFieldValueSupplier } from "../../entry"

export class ResolveAbilityType extends AbilityType {
    public static override readonly BASE_ID = fourCC("AIlv") as AbilityTypeId

    /** Resolve */
    public get resolve(): number[] {
        return this.getNumberLevelField("Ilv1")
    }

    public set resolve(resolve: ObjectDataEntryLevelFieldValueSupplier<number>) {
        this.setNumberLevelField("Ilv1", resolve)
    }

    /** Flat Bonus */
    public get isFlatBonus(): boolean[] {
        return this.getBooleanLevelField("Ilv2")
    }

    public set isFlatBonus(isFlatBonus: ObjectDataEntryLevelFieldValueSupplier<boolean>) {
        this.setBooleanLevelField("Ilv2", isFlatBonus)
    }
}
