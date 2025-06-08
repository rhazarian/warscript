import { AbilityType, AbilityTypeId } from "../ability-type"
import { ObjectDataEntryLevelFieldValueSupplier } from "../../entry"
import { UnitTypeId } from "../unit-type"

export class DiseaseCloudAbilityType extends AbilityType {
    public static override readonly BASE_ID = fourCC("Aap1") as AbilityTypeId

    public get diseaseDuration(): number[] {
        return this.getNumberLevelField("Apl1")
    }

    public set diseaseDuration(diseaseDuration: ObjectDataEntryLevelFieldValueSupplier<number>) {
        this.setNumberLevelField("Apl1", diseaseDuration)
    }

    public get damagePerSecond(): number[] {
        return this.getNumberLevelField("Apl2")
    }

    public set damagePerSecond(damagePerSecond: ObjectDataEntryLevelFieldValueSupplier<number>) {
        this.setNumberLevelField("Apl2", damagePerSecond)
    }

    public get plagueWardDuration(): number[] {
        return this.getNumberLevelField("Apl3")
    }

    public set plagueWardDuration(
        plagueWardDuration: ObjectDataEntryLevelFieldValueSupplier<number>,
    ) {
        this.setNumberLevelField("Apl3", plagueWardDuration)
    }

    public get plagueWardUnitTypeId(): UnitTypeId[] {
        return this.getObjectDataEntryNumericIdLevelField("Aplu")
    }

    public set plagueWardUnitTypeId(
        plagueWardUnitTypeId: ObjectDataEntryLevelFieldValueSupplier<UnitTypeId>,
    ) {
        this.setObjectDataEntryNumericIdLevelField("Aplu", plagueWardUnitTypeId)
    }
}
