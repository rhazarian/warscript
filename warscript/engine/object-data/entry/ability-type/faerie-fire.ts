import { AbilityType, AbilityTypeId } from "../ability-type"
import { ObjectDataEntryLevelFieldValueSupplier } from "../../entry"

export class FaerieFireAbilityType extends AbilityType {
    public static override readonly BASE_ID = fourCC("Afae") as AbilityTypeId

    public get armorDecrease(): number[] {
        return this.getNumberLevelField("Fae1")
    }

    public set armorDecrease(armorDecrease: ObjectDataEntryLevelFieldValueSupplier<number>) {
        this.setNumberLevelField("Fae1", armorDecrease)
    }

    public get shouldAlwaysAutoCast(): boolean[] {
        return this.getBooleanLevelField("Fae2")
    }

    public set shouldAlwaysAutoCast(
        shouldAlwaysAutoCast: ObjectDataEntryLevelFieldValueSupplier<boolean>
    ) {
        this.setBooleanLevelField("Fae2", shouldAlwaysAutoCast)
    }
}
