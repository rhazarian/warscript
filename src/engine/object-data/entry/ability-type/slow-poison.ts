import { AbilityType, AbilityTypeId } from "../ability-type"
import { ObjectDataEntryLevelFieldValueSupplier } from "../../entry"

export class SlowPoisonAbilityType extends AbilityType {
    public static override readonly BASE_ID = fourCC("Aspo") as AbilityTypeId

    public get damagePerSecond(): number[] {
        return this.getNumberLevelField("Spo1")
    }

    public set damagePerSecond(damagePerSecond: ObjectDataEntryLevelFieldValueSupplier<number>) {
        this.setNumberLevelField("Spo1", damagePerSecond)
    }

    public get movementSpeedDecreaseFactor(): number[] {
        return this.getNumberLevelField("Spo2")
    }

    public set movementSpeedDecreaseFactor(
        movementSpeedDecreaseFactor: ObjectDataEntryLevelFieldValueSupplier<number>,
    ) {
        this.setNumberLevelField("Spo2", movementSpeedDecreaseFactor)
    }

    public get attackSpeedDecreaseFactor(): number[] {
        return this.getNumberLevelField("Spo3")
    }

    public set attackSpeedDecreaseFactor(
        attackSpeedDecreaseFactor: ObjectDataEntryLevelFieldValueSupplier<number>,
    ) {
        this.setNumberLevelField("Spo3", attackSpeedDecreaseFactor)
    }

    public get isDamageStacking(): boolean[] {
        return this.getOption(1)
    }

    public set isDamageStacking(isDamageStacking: ObjectDataEntryLevelFieldValueSupplier<boolean>) {
        this.setOption(1, isDamageStacking)
    }

    public get isMovementSpeedFactorStacking(): boolean[] {
        return this.getOption(2)
    }

    public set isMovementSpeedFactorStacking(
        isMovementSpeedFactorStacking: ObjectDataEntryLevelFieldValueSupplier<boolean>,
    ) {
        this.setOption(2, isMovementSpeedFactorStacking)
    }

    public get isAttackSpeedFactorStacking(): boolean[] {
        return this.getOption(4)
    }

    public set isAttackSpeedFactorStacking(
        isAttackSpeedFactorStacking: ObjectDataEntryLevelFieldValueSupplier<boolean>,
    ) {
        this.setOption(4, isAttackSpeedFactorStacking)
    }

    public get isAbleToKill(): boolean[] {
        return this.getOption(8)
    }

    public set isAbleToKill(isAbleToKill: ObjectDataEntryLevelFieldValueSupplier<boolean>) {
        this.setOption(8, isAbleToKill)
    }

    private setOption(
        option: 1 | 2 | 4 | 8,
        supplier: ObjectDataEntryLevelFieldValueSupplier<boolean>,
    ): void {
        this.setFlagLevelFieldValue("Spo4", option, supplier)
    }

    private getOption(option: 1 | 2 | 4 | 8): boolean[] {
        return this.getFlagLevelFieldValue("Spo4", option)
    }
}
