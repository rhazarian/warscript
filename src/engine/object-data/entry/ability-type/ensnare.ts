import { AbilityType, AbilityTypeId } from "../ability-type"
import { ObjectDataEntryLevelFieldValueSupplier } from "../../entry"

export class EnsnareAbilityType extends AbilityType {
    public static override readonly BASE_ID = fourCC("Aens") as AbilityTypeId

    public get airUnitLoweringDuration(): number[] {
        return this.getNumberLevelField("Ens1")
    }

    public set airUnitLoweringDuration(
        airUnitLoweringDuration: ObjectDataEntryLevelFieldValueSupplier<number>,
    ) {
        this.setNumberLevelField("Ens1", airUnitLoweringDuration)
    }

    public get airUnitHeight(): number[] {
        return this.getNumberLevelField("Ens2")
    }

    public set airUnitHeight(airUnitHeight: ObjectDataEntryLevelFieldValueSupplier<number>) {
        this.setNumberLevelField("Ens2", airUnitHeight)
    }

    public get meleeAttackRange(): number[] {
        return this.getNumberLevelField("Ens3")
    }

    public set meleeAttackRange(meleeAttackRange: ObjectDataEntryLevelFieldValueSupplier<number>) {
        this.setNumberLevelField("Ens3", meleeAttackRange)
    }
}
