import { AbilityType, AbilityTypeId } from "../ability-type"
import { ObjectDataEntryLevelFieldValueSupplier } from "../../entry"

export class PermanentInvisibilityAbilityType extends AbilityType {
    public static override readonly BASE_ID = fourCC("Apiv") as AbilityTypeId

    public get shouldAutoAcquireAttackTargets(): boolean[] {
        return this.getBooleanLevelField("Gho1")
    }

    public set shouldAutoAcquireAttackTargets(
        shouldAutoAcquireAttackTargets: ObjectDataEntryLevelFieldValueSupplier<boolean>,
    ) {
        this.setBooleanLevelField("Gho1", shouldAutoAcquireAttackTargets)
    }
}
