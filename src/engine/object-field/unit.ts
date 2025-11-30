import { Unit } from "../internal/unit"
import {
    ObjectField,
    ObjectFieldValueChangeEvent,
    ObjectLevelField,
    ObjectLevelFieldValueChangeEvent,
    ReadonlyObjectFieldType,
    ReadonlyObjectLevelFieldType,
} from "../object-field"
import { UnitType, UnitTypeId } from "../object-data/entry/unit-type"
import { nonEmptyLinkedSetOf, ReadonlyNonEmptyLinkedSet } from "../../utility/linked-set"
import { AttackType } from "../object-data/auxiliary/attack-type"
import { UnitClassifications } from "../object-data/auxiliary/unit-classification"
import { HealthRegenerationType } from "../object-data/auxiliary/health-regeneration-type"

const convertUnitBooleanField = ConvertUnitBooleanField
const convertUnitIntegerField = ConvertUnitIntegerField
const convertUnitRealField = ConvertUnitRealField
const convertUnitStringField = ConvertUnitStringField
const convertUnitWeaponIntegerField = ConvertUnitWeaponIntegerField
const getUnitWeaponIntegerField = BlzGetUnitWeaponIntegerField
const setUnitWeaponIntegerField = BlzSetUnitWeaponIntegerField
const getUnitFlyHeight = GetUnitFlyHeight
const setUnitFlyHeight = SetUnitFlyHeight
const getUnitPropulsionWindow = GetUnitPropWindow
const setUnitPropulsionWindow = SetUnitPropWindow
const setUnitScale = SetUnitScale

export abstract class UnitField<
    ValueType extends number | string | boolean = number | string | boolean,
    NativeFieldType = any,
> extends ObjectField<UnitType, Unit, ValueType, NativeFieldType> {
    protected override get instanceClass(): typeof Unit {
        return Unit
    }

    protected override getObjectDataEntryId(instance: Unit): UnitTypeId {
        return instance.typeId
    }

    protected override hasNativeFieldValue(): boolean {
        return true
    }

    public static get valueChangeEvent(): ObjectFieldValueChangeEvent<
        ReadonlyObjectFieldType<UnitField>
    > {
        return this.getOrCreateValueChangeEvent()
    }
}

export class UnitBooleanField extends UnitField<boolean, junitbooleanfield> {
    protected override get defaultValue(): boolean {
        return false
    }

    protected getNativeFieldById(id: number): junitbooleanfield {
        return convertUnitBooleanField(id)
    }

    protected override getNativeFieldValue(instance: Unit): boolean {
        return instance.getField(this.nativeField)
    }

    protected override setNativeFieldValue(instance: Unit, value: boolean): boolean {
        return instance.setField(this.nativeField, value)
    }

    public static get valueChangeEvent(): ObjectFieldValueChangeEvent<
        ReadonlyObjectFieldType<UnitBooleanField>
    > {
        return this.getOrCreateValueChangeEvent()
    }
}

export class UnitFloatField extends UnitField<number, junitrealfield> {
    protected override get defaultValue(): number {
        return 0
    }

    protected getNativeFieldById(id: number): junitrealfield {
        return convertUnitRealField(id)
    }

    protected override getNativeFieldValue(instance: Unit): number {
        return instance.getField(this.nativeField)
    }

    protected override setNativeFieldValue(instance: Unit, value: number): boolean {
        return instance.setField(this.nativeField, value)
    }

    public static get valueChangeEvent(): ObjectFieldValueChangeEvent<
        ReadonlyObjectFieldType<UnitFloatField>
    > {
        return this.getOrCreateValueChangeEvent()
    }
}

export class UnitIntegerField<T extends number = number> extends UnitField<T, junitintegerfield> {
    protected override get defaultValue(): T {
        return 0 as T
    }

    protected getNativeFieldById(id: number): junitintegerfield {
        return convertUnitIntegerField(id)
    }

    protected override getNativeFieldValue(instance: Unit): T {
        return instance.getField(this.nativeField) as T
    }

    protected override setNativeFieldValue(instance: Unit, value: T): boolean {
        return instance.setField(this.nativeField, value)
    }

    public static get valueChangeEvent(): ObjectFieldValueChangeEvent<
        ReadonlyObjectFieldType<UnitIntegerField>
    > {
        return this.getOrCreateValueChangeEvent()
    }
}

export class UnitStringField extends UnitField<string, junitstringfield> {
    protected override get defaultValue(): string {
        return ""
    }

    protected getNativeFieldById(id: number): junitstringfield {
        return convertUnitStringField(id)
    }

    protected override getNativeFieldValue(instance: Unit): string {
        return instance.getField(this.nativeField)
    }

    protected override setNativeFieldValue(instance: Unit, value: string): boolean {
        return instance.setField(this.nativeField, value)
    }

    public static get valueChangeEvent(): ObjectFieldValueChangeEvent<
        ReadonlyObjectFieldType<UnitStringField>
    > {
        return this.getOrCreateValueChangeEvent()
    }
}

type junitweaponfield =
    | junitweaponbooleanfield
    | junitweaponintegerfield
    | junitweaponrealfield
    | junitweaponstringfield

export abstract class UnitWeaponField<
    ValueType extends number | string | boolean = number | string | boolean,
    InputValueType extends ValueType = never,
    NativeFieldType extends junitweaponfield = junitweaponfield,
> extends ObjectLevelField<UnitType, Unit, ValueType, InputValueType, NativeFieldType> {
    protected override get instanceClass(): typeof Unit {
        return Unit
    }

    protected override getLevelCount(): number {
        return 2
    }

    protected override getObjectDataEntryId(instance: Unit): UnitTypeId {
        return instance.typeId
    }

    protected override hasNativeFieldValue(): boolean {
        return true
    }

    public static override get valueChangeEvent(): ObjectLevelFieldValueChangeEvent<
        ReadonlyObjectLevelFieldType<UnitWeaponField>
    > {
        return this.getOrCreateValueChangeEvent()
    }
}

export abstract class UnitNumberWeaponField<
    NativeFieldType extends junitweaponintegerfield | junitweaponrealfield =
        | junitweaponintegerfield
        | junitweaponrealfield,
> extends UnitWeaponField<number, number, NativeFieldType> {
    protected override get defaultValue(): number {
        return 0
    }

    public static override get valueChangeEvent(): ObjectLevelFieldValueChangeEvent<UnitNumberWeaponField> {
        return this.getOrCreateValueChangeEvent()
    }
}

export abstract class UnitEnumWeaponField<T extends number> extends UnitWeaponField<
    T,
    T,
    junitweaponintegerfield
> {
    protected abstract values: ReadonlyNonEmptyLinkedSet<T>

    protected override get defaultValue(): T {
        return this.values.first()
    }

    protected override getNativeFieldById(id: number): junitweaponintegerfield {
        return convertUnitWeaponIntegerField(id)
    }

    protected override getNativeFieldValue(instance: Unit, index: number): T {
        const value = getUnitWeaponIntegerField(instance.handle, this.nativeField, index)
        if (this.values.contains(value)) {
            return value as T
        }
        return this.values.first()
    }

    protected override setNativeFieldValue(instance: Unit, index: number, value: T): boolean {
        return setUnitWeaponIntegerField(instance.handle, this.nativeField, index, value)
    }

    public static get valueChangeEvent(): ObjectLevelFieldValueChangeEvent<
        UnitEnumWeaponField<number>
    > {
        return this.getOrCreateValueChangeEvent()
    }
}

export class UnitAttackTypeWeaponField extends UnitEnumWeaponField<AttackType> {
    protected override values = nonEmptyLinkedSetOf(
        AttackType.NORMAL,
        AttackType.PIERCE,
        AttackType.SIEGE,
        AttackType.SPELL,
        AttackType.CHAOS,
        AttackType.MAGIC,
        AttackType.HERO,
    )
}

export class UnitClassificationsField extends UnitField<UnitClassifications, junitintegerfield> {
    protected override get defaultValue(): UnitClassifications {
        return 0 as UnitClassifications
    }

    protected getNativeFieldById(id: number): junitintegerfield {
        return convertUnitIntegerField(id)
    }

    protected getNativeFieldValue(instance: Unit): UnitClassifications {
        return instance.getField(this.nativeField) as UnitClassifications
    }

    protected setNativeFieldValue(instance: Unit, value: UnitClassifications): boolean {
        return instance.setField(this.nativeField, value)
    }
}

export class UnitFlyHeightField extends UnitFloatField {
    protected override getNativeFieldValue(instance: Unit): number {
        return getUnitFlyHeight(instance.handle)
    }

    protected override setNativeFieldValue(instance: Unit, value: number): boolean {
        setUnitFlyHeight(instance.handle, value, 100000)
        return true
    }
}

export class UnitPropulsionWindowField extends UnitFloatField {
    protected override getNativeFieldValue(instance: Unit): number {
        return getUnitPropulsionWindow(instance.handle)
    }

    protected override setNativeFieldValue(instance: Unit, value: number): boolean {
        setUnitPropulsionWindow(instance.handle, value)
        return true
    }
}

export class UnitHealthRegenerationTypeField extends UnitIntegerField<HealthRegenerationType> {}

export class UnitScalingValueField extends UnitFloatField {
    protected override setNativeFieldValue(instance: Unit, value: number): boolean {
        setUnitScale(instance.handle, value, value, value)
        return super.setNativeFieldValue(instance, value)
    }
}
