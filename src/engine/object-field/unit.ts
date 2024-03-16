import { Unit } from "../internal/unit"
import { ObjectField } from "../object-field"
import { UnitType, UnitTypeId } from "../object-data/entry/unit-type"

export abstract class UnitField<
    ValueType extends number | string | boolean = number | string | boolean,
    NativeFieldType = any
> extends ObjectField<UnitType, Unit, ValueType, NativeFieldType> {
    protected override get instanceClass(): typeof Unit {
        return Unit
    }

    protected override getObjectDataEntryId(instance: Unit): UnitTypeId {
        return instance.typeId
    }
}

export class UnitStringField extends UnitField<string, junitstringfield> {
    protected override get defaultValue(): string {
        return ""
    }

    protected getNativeFieldById(id: number): junitstringfield {
        return ConvertUnitStringField(id)
    }

    protected override hasNativeFieldValue(): boolean {
        // TODO
        return true
    }

    protected override getNativeFieldValue(instance: Unit): string {
        return instance.getField(this.nativeField)
    }

    protected override getObjectDataEntryId(instance: Unit): UnitTypeId {
        return instance.typeId
    }

    protected override setNativeFieldValue(instance: Unit, value: string): boolean {
        return instance.setField(this.nativeField, value)
    }
}
