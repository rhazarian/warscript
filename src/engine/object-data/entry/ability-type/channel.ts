import { AbilityType, AbilityTypeId } from "../ability-type"

import { TargetingType } from "../../auxiliary/targeting-type"
import { ObjectDataEntryLevelFieldValueSupplier } from "../../entry"

export const enum ChannelAbilityTypeTargetingType {
    NONE = TargetingType.NONE,
    UNIT = TargetingType.UNIT,
    POINT = TargetingType.POINT,
    UNIT_OR_POINT = TargetingType.UNIT_OR_POINT,
}

export class ChannelAbilityType extends AbilityType {
    public static override readonly BASE_ID = fourCC("ANcl") as AbilityTypeId

    public constructor(object: WarObject) {
        super(object)
        this.setOption(1, true)
    }

    public get channelingDuration(): number[] {
        return this.getNumberLevelField("Ncl1")
    }

    public set channelingDuration(
        channelingDuration: ObjectDataEntryLevelFieldValueSupplier<number>
    ) {
        this.setNumberLevelField("Ncl1", channelingDuration)
    }

    public get targetingType(): ChannelAbilityTypeTargetingType[] {
        return this.getNumberLevelField("Ncl2")
    }

    public set targetingType(
        targetingType: ObjectDataEntryLevelFieldValueSupplier<ChannelAbilityTypeTargetingType>
    ) {
        this.setNumberLevelField("Ncl2", targetingType)
    }

    public get isTargetingImageVisible(): boolean[] {
        return this.getOption(2)
    }

    public set isTargetingImageVisible(
        isTargetingImageVisible: ObjectDataEntryLevelFieldValueSupplier<boolean>
    ) {
        this.setOption(2, isTargetingImageVisible)
    }

    /**
     * Whether the ability is considered physical.
     * A physical ability is not disabled on silence and cannot target ethereal units.
     */
    public get isPhysical(): boolean[] {
        return this.getOption(4)
    }

    public set isPhysical(v: ObjectDataEntryLevelFieldValueSupplier<boolean>) {
        this.setOption(4, v)
    }

    /**
     * Whether the ability is considered universal.
     * A universal ability can target spell immune units.
     */
    public get isUniversal(): boolean[] {
        return this.getOption(8)
    }

    public set isUniversal(v: ObjectDataEntryLevelFieldValueSupplier<boolean>) {
        this.setOption(8, v)
    }

    /**
     * Whether the ability is only cast once when ordered to a group of units.
     */
    public get isUniqueCast(): boolean[] {
        return this.getOption(16)
    }

    public set isUniqueCast(isUniqueCast: ObjectDataEntryLevelFieldValueSupplier<boolean>) {
        this.setOption(16, isUniqueCast)
    }

    public get casterAttachmentPresetsDuration(): number[] {
        return this.getNumberLevelField("Ncl4")
    }

    public set casterAttachmentPresetsDuration(
        casterAttachmentsDuration: ObjectDataEntryLevelFieldValueSupplier<number>
    ) {
        this.setNumberLevelField("Ncl4", casterAttachmentsDuration)
    }

    /**
     * Whether the ability should disable and hide other abilities while being channeled.
     */
    public get disablesOtherAbilities(): boolean[] {
        return this.getBooleanLevelField("Ncl5")
    }

    public set disablesOtherAbilities(
        shouldDisableOtherAbilities: ObjectDataEntryLevelFieldValueSupplier<boolean>
    ) {
        this.setBooleanLevelField("Ncl5", shouldDisableOtherAbilities)
    }

    public get baseOrderTypeStringId(): string[] {
        return this.getStringLevelField("Ncl6")
    }

    public set baseOrderTypeStringId(
        baseOrderTypeStringId: ObjectDataEntryLevelFieldValueSupplier<string>
    ) {
        this.setStringLevelField("Ncl6", baseOrderTypeStringId)
    }

    private setOption(
        option: 1 | 2 | 4 | 8 | 16,
        supplier: ObjectDataEntryLevelFieldValueSupplier<boolean>
    ): void {
        this.setFlagLevelFieldValue("Ncl3", option, supplier)
    }

    private getOption(option: 1 | 2 | 4 | 8 | 16): boolean[] {
        return this.getFlagLevelFieldValue("Ncl3", option)
    }
}
