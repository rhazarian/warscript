import { AbilityType, AbilityTypeId } from "../ability-type"
import { UnitTypeId } from "../unit-type"

import { ObjectDataEntryLevelFieldValueSupplier } from "../../entry"

export class PhoenixMorphAbilityType extends AbilityType {
    public static override readonly BASE_ID = fourCC("Aphx") as AbilityTypeId

    public get normalFormUnitTypeId(): UnitTypeId[] {
        return this.getObjectDataEntryNumericIdLevelField("Eme1")
    }

    public set normalFormUnitTypeId(
        normalFormUnitTypeId: ObjectDataEntryLevelFieldValueSupplier<UnitTypeId>,
    ) {
        this.setObjectDataEntryNumericIdLevelField("Eme1", normalFormUnitTypeId)
    }

    public get isUninterruptible(): boolean[] {
        return this.getFlagLevelFieldValue("Eme2", 1)
    }

    public set isUninterruptible(
        isUninterruptible: ObjectDataEntryLevelFieldValueSupplier<boolean>,
    ) {
        this.setFlagLevelFieldValue("Eme2", 1, isUninterruptible)
    }

    public get isLandingImmediate(): boolean[] {
        return this.getFlagLevelFieldValue("Eme2", 2)
    }

    public set isLandingImmediate(
        isLandingImmediate: ObjectDataEntryLevelFieldValueSupplier<boolean>,
    ) {
        this.setFlagLevelFieldValue("Eme2", 2, isLandingImmediate)
    }

    public get isTakeOffImmediate(): boolean[] {
        return this.getFlagLevelFieldValue("Eme2", 4)
    }

    public set isTakeOffImmediate(
        isTakeOffImmediate: ObjectDataEntryLevelFieldValueSupplier<boolean>,
    ) {
        this.setFlagLevelFieldValue("Eme2", 4, isTakeOffImmediate)
    }

    public get isMorphPermanent(): boolean[] {
        return this.getFlagLevelFieldValue("Eme2", 8)
    }

    public set isMorphPermanent(isMorphPermanent: ObjectDataEntryLevelFieldValueSupplier<boolean>) {
        this.setFlagLevelFieldValue("Eme2", 8, isMorphPermanent)
    }

    public get requiresPayment(): boolean[] {
        return this.getFlagLevelFieldValue("Eme2", 16)
    }

    public set requiresPayment(requiresPayment: ObjectDataEntryLevelFieldValueSupplier<boolean>) {
        this.setFlagLevelFieldValue("Eme2", 16, requiresPayment)
    }

    public get attitudeAdjustmentDuration(): number[] {
        return this.getNumberLevelField("Eme3")
    }

    public set attitudeAdjustmentDuration(
        attitudeAdjustmentDuration: ObjectDataEntryLevelFieldValueSupplier<number>,
    ) {
        this.setNumberLevelField("Eme3", attitudeAdjustmentDuration)
    }

    public get landingDelayDuration(): number[] {
        return this.getNumberLevelField("Eme4")
    }

    public set landingDelayDuration(
        landingDelayDuration: ObjectDataEntryLevelFieldValueSupplier<number>,
    ) {
        this.setNumberLevelField("Eme4", landingDelayDuration)
    }

    public get alternateFormUnitTypeId(): UnitTypeId[] {
        return this.getObjectDataEntryNumericIdLevelField("Emeu")
    }

    public set alternateFormUnitTypeId(
        alternateFormUnitTypeId: ObjectDataEntryLevelFieldValueSupplier<UnitTypeId>,
    ) {
        this.setObjectDataEntryNumericIdLevelField("Emeu", alternateFormUnitTypeId)
    }
}
