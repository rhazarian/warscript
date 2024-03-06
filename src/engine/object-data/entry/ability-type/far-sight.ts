import { AbilityType, AbilityTypeId } from "../ability-type"

import { DetectionType } from "../../auxiliary/detection-type"
import { ObjectDataEntryLevelFieldValueSupplier } from "../../entry"

export class FarSightAbilityType extends AbilityType {
    public static override readonly BASE_ID = fourCC("AOfs") as AbilityTypeId

    public get detectionType(): DetectionType[] {
        return this.getNumberLevelField(`Ofs1`)
    }

    public set detectionType(detectionType: ObjectDataEntryLevelFieldValueSupplier<DetectionType>) {
        this.setNumberLevelField("Ofs1", detectionType)
    }
}
