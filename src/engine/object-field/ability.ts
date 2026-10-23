import {
    Ability,
    AbilityFieldSource,
    AbilityOrSnapshot,
    abilityTypeHasField,
    jabilityfield,
} from "../internal/ability"
import {
    ObjectArrayField,
    ObjectField,
    ObjectFieldId,
    ObjectFieldValueChangeEvent,
    ObjectLevelField,
    ObjectLevelFieldValueChangeEvent,
    ReadonlyObjectFieldType,
    ReadonlyObjectLevelFieldType,
} from "../object-field"
import { AbilityType, AbilityTypeId } from "../object-data/entry/ability-type"
import { ObjectDataEntryId } from "../object-data/entry"
import { LightningTypeId } from "../object-data/entry/lightning-type"
import { CombatClassifications } from "../object-data/auxiliary/combat-classification"
import { UnitTypeId } from "../object-data/entry/unit-type"
import { BuffResistanceType } from "../object-data/auxiliary/buff-resistance-type"
import { BuffPolarity } from "../object-data/auxiliary/buff-polarity"
import { nonEmptyLinkedSetOf, ReadonlyNonEmptyLinkedSet } from "../../utility/linked-set"

const convertAbilityBooleanField = _G.ConvertAbilityBooleanField
const convertAbilityIntegerField = _G.ConvertAbilityIntegerField
const convertAbilityRealField = _G.ConvertAbilityRealField
const convertAbilityStringField = _G.ConvertAbilityStringField
const convertAbilityIntegerLevelField = _G.ConvertAbilityIntegerLevelField
const convertAbilityRealLevelField = _G.ConvertAbilityRealLevelField
const convertAbilityStringLevelField = _G.ConvertAbilityStringLevelField

export abstract class AbilityField<
    ValueType extends number | string | boolean = number | string | boolean,
    NativeFieldType extends jabilityfield = jabilityfield,
> extends ObjectField<AbilityType, Ability, ValueType, NativeFieldType, AbilityFieldSource> {
    /**
     * The value this field has for the ability, modifiers included, or the value it had for a
     * snapshot of one at the moment that snapshot was taken.
     *
     * This is how a snapshot is read: it answers for the fields of the ability it is of, at the
     * one level it is of, so there is no level to read it at.
     */
    public getCurrentValue(ability: AbilityOrSnapshot): ValueType {
        return this.getActualValue(ability)
    }

    protected override get instanceClass(): typeof Ability {
        return Ability
    }

    protected override getObjectDataEntryId(source: AbilityFieldSource): AbilityTypeId {
        return source.typeId
    }

    protected override hasNativeFieldValue(abilityTypeId: AbilityTypeId): boolean {
        return abilityTypeHasField(abilityTypeId, this.nativeField)
    }

    public static get valueChangeEvent(): ObjectFieldValueChangeEvent<
        ReadonlyObjectFieldType<AbilityField>
    > {
        return this.getOrCreateValueChangeEvent()
    }
}

export class AbilityBooleanField extends AbilityField<boolean, jabilitybooleanfield> {
    protected override get defaultValue(): boolean {
        return false
    }

    protected override getNativeFieldById(id: number): jabilitybooleanfield {
        return convertAbilityBooleanField(id)
    }

    protected override getNativeFieldValue(source: AbilityFieldSource): boolean {
        return source.getField(this.nativeField)
    }

    protected override setNativeFieldValue(instance: Ability, value: boolean): boolean {
        return instance.setField(this.nativeField, value)
    }

    public static get valueChangeEvent(): ObjectFieldValueChangeEvent<AbilityBooleanField> {
        return this.getOrCreateValueChangeEvent()
    }
}

export abstract class AbilityNumberField<
    NativeFieldType extends jabilityfield = jabilityfield,
> extends AbilityField<number, NativeFieldType> {
    protected override get defaultValue(): number {
        return 0
    }

    public static get valueChangeEvent(): ObjectFieldValueChangeEvent<AbilityNumberField> {
        return this.getOrCreateValueChangeEvent()
    }
}

export class AbilityFloatField extends AbilityNumberField<jabilityrealfield> {
    protected getNativeFieldById(id: number): jabilityrealfield {
        return convertAbilityRealField(id)
    }

    protected getNativeFieldValue(source: AbilityFieldSource): number {
        return source.getField(this.nativeField)
    }

    protected setNativeFieldValue(instance: Ability, value: number): boolean {
        return instance.setField(this.nativeField, value)
    }

    public static get valueChangeEvent(): ObjectFieldValueChangeEvent<AbilityFloatField> {
        return this.getOrCreateValueChangeEvent()
    }
}

export class AbilityIntegerField extends AbilityNumberField<jabilityintegerfield> {
    protected override getNativeFieldById(id: number): jabilityintegerfield {
        return convertAbilityIntegerField(id)
    }

    protected override getNativeFieldValue(source: AbilityFieldSource): number {
        return source.getField(this.nativeField)
    }

    protected override setNativeFieldValue(instance: Ability, value: number): boolean {
        return instance.setField(this.nativeField, value)
    }

    public static get valueChangeEvent(): ObjectFieldValueChangeEvent<AbilityIntegerField> {
        return this.getOrCreateValueChangeEvent()
    }
}

const stringValueByAbilityTypeIdByFieldId = postcompile(() => {
    const stringValueByAbilityTypeIdByFieldId = new LuaMap<
        ObjectFieldId,
        LuaMap<AbilityTypeId, string>
    >()
    for (const rawFieldId of [
        "acap",
        "aca1",
        "aspt",
        "ata0",
        "ata1",
        "ata2",
        "ata3",
        "ata4",
        "ata5",
    ]) {
        const stringValueByAbilityTypeId = new LuaMap<AbilityTypeId, string>()

        for (const abilityType of AbilityType.getAll()) {
            const stringValue = abilityType["getStringField"](rawFieldId)
            if (stringValue != "") {
                stringValueByAbilityTypeId.set(abilityType.id, stringValue)
            }
        }

        stringValueByAbilityTypeIdByFieldId.set(
            fourCC(rawFieldId) as ObjectFieldId,
            stringValueByAbilityTypeId,
        )
    }
    return stringValueByAbilityTypeIdByFieldId
})

export class AbilityStringField extends AbilityField<string, jabilitystringfield> {
    protected override get defaultValue(): string {
        return ""
    }

    protected override getNativeFieldById(id: number): jabilitystringfield {
        return convertAbilityStringField(id)
    }

    protected override getNativeFieldValue(source: AbilityFieldSource): string {
        if (stringValueByAbilityTypeIdByFieldId.has(this.id)) {
            return (
                stringValueByAbilityTypeIdByFieldId.get(this.id)?.get(source.typeId) ??
                this.defaultValue
            )
        }
        return source.getField(this.nativeField)
    }

    protected override setNativeFieldValue(instance: Ability, value: string): boolean {
        return instance.setField(this.nativeField, value)
    }

    public static get valueChangeEvent(): ObjectFieldValueChangeEvent<AbilityStringField> {
        return this.getOrCreateValueChangeEvent()
    }
}

export abstract class AbilityArrayField<
    ValueType extends number | string | boolean = number | string | boolean,
    NativeFieldType extends jabilityfield = jabilityfield,
> extends ObjectArrayField<AbilityType, Ability, ValueType, NativeFieldType, AbilityFieldSource> {
    /**
     * The values this field has for the ability, or the values it had for a snapshot of one at
     * the moment that snapshot was taken.
     */
    public getCurrentValue(ability: AbilityOrSnapshot): readonly ValueType[] {
        return this.getActualValue(ability)
    }

    protected override get instanceClass(): typeof Ability {
        return Ability
    }

    protected override getObjectDataEntryId(source: AbilityFieldSource): AbilityTypeId {
        return source.typeId
    }

    protected override hasNativeFieldValue(abilityTypeId: AbilityTypeId): boolean {
        return abilityTypeHasField(abilityTypeId, this.nativeField)
    }
}

export class AbilityStringArrayField extends AbilityArrayField<string, jabilitystringlevelfield> {
    protected override get defaultValue(): string {
        return ""
    }

    protected override getNativeFieldById(id: number): jabilitystringlevelfield {
        return convertAbilityStringLevelField(id)
    }

    protected override getNativeFieldValue(source: AbilityFieldSource, index: number): string {
        return source.getField(this.nativeField, index)
    }

    protected override setNativeFieldValue(
        instance: Ability,
        index: number,
        value: string,
    ): boolean {
        return instance.setField(this.nativeField, index, value)
    }
}

export abstract class AbilityObjectDataEntryIdArrayField<
    T extends ObjectDataEntryId = ObjectDataEntryId,
> extends AbilityArrayField<T, jabilitystringlevelfield> {
    protected override get defaultValue(): T {
        return 0 as T
    }

    protected override getNativeFieldById(id: number): jabilitystringlevelfield {
        return convertAbilityStringLevelField(id)
    }

    protected override getNativeFieldValue(source: AbilityFieldSource, index: number): T {
        const value = source.getField(this.nativeField, index)
        return (value == "" ? 0 : util.s2id(value)) as T
    }

    protected override setNativeFieldValue(instance: Ability, index: number, value: T): boolean {
        return instance.setField(this.nativeField, index, util.id2s(value))
    }
}

export class AbilityLightningTypeIdArrayField extends AbilityObjectDataEntryIdArrayField<LightningTypeId> {}

export abstract class AbilityLevelField<
    ValueType extends number | string | boolean = number | string | boolean,
    InputValueType extends ValueType = never,
    NativeFieldType extends jabilityfield = jabilityfield,
> extends ObjectLevelField<
    AbilityType,
    Ability,
    ValueType,
    InputValueType,
    NativeFieldType,
    AbilityFieldSource
> {
    /**
     * The value this field has for the ability at the level it is at, modifiers included, or the
     * value it had for a snapshot of one, at the level that snapshot is of.
     *
     * This is how a snapshot is read: it answers for the fields of the ability it is of, at the
     * one level it is of, so there is no other level to read it at.
     */
    public getCurrentValue(ability: AbilityOrSnapshot): ValueType {
        return this.getActualValue(ability, ability.level)
    }

    protected override get instanceClass(): typeof Ability {
        return Ability
    }

    protected override getLevelCount(entry: AbilityType | Ability): number {
        return entry.levelCount
    }

    protected override getObjectDataEntryId(source: AbilityFieldSource): AbilityTypeId {
        return source.typeId
    }

    protected override hasNativeFieldValue(abilityTypeId: AbilityTypeId): boolean {
        return abilityTypeHasField(abilityTypeId, this.nativeField)
    }

    public static override get valueChangeEvent(): ObjectLevelFieldValueChangeEvent<
        ReadonlyObjectLevelFieldType<AbilityLevelField>
    > {
        return this.getOrCreateValueChangeEvent()
    }
}

export class AbilityBooleanLevelField extends AbilityLevelField<
    boolean,
    boolean,
    jabilityintegerlevelfield
> {
    protected override get defaultValue(): boolean {
        return false
    }

    protected override getNativeFieldById(id: number): jabilityintegerlevelfield {
        return convertAbilityIntegerLevelField(id)
    }

    protected override getNativeFieldValue(source: AbilityFieldSource, level: number): boolean {
        return source.getField(this.nativeField, level) != 0
    }

    protected override setNativeFieldValue(
        instance: Ability,
        level: number,
        value: boolean,
    ): boolean {
        return instance.setField(this.nativeField, level, value ? 1 : 0)
    }

    public static get valueChangeEvent(): ObjectLevelFieldValueChangeEvent<AbilityBooleanLevelField> {
        return this.getOrCreateValueChangeEvent()
    }
}

export abstract class AbilityNumberLevelField<
    NativeFieldType extends jabilityfield = jabilityfield,
> extends AbilityLevelField<number, number, NativeFieldType> {
    protected override get defaultValue(): number {
        return 0
    }

    public static override get valueChangeEvent(): ObjectLevelFieldValueChangeEvent<AbilityNumberLevelField> {
        return this.getOrCreateValueChangeEvent()
    }
}

export class AbilityFloatLevelField extends AbilityNumberLevelField<jabilityreallevelfield> {
    protected override getNativeFieldById(id: number): jabilityreallevelfield {
        return convertAbilityRealLevelField(id)
    }

    protected override getNativeFieldValue(source: AbilityFieldSource, level: number): number {
        return source.getField(this.nativeField, level)
    }

    protected override setNativeFieldValue(
        instance: Ability,
        level: number,
        value: number,
    ): boolean {
        return instance.setField(this.nativeField, level, value)
    }

    public static get valueChangeEvent(): ObjectLevelFieldValueChangeEvent<AbilityFloatLevelField> {
        return this.getOrCreateValueChangeEvent()
    }
}

export class AbilityIntegerLevelField extends AbilityNumberLevelField<jabilityintegerlevelfield> {
    protected override getNativeFieldById(id: number): jabilityintegerlevelfield {
        return convertAbilityIntegerLevelField(id)
    }

    protected override getNativeFieldValue(source: AbilityFieldSource, level: number): number {
        return source.getField(this.nativeField, level)
    }

    protected override setNativeFieldValue(
        instance: Ability,
        level: number,
        value: number,
    ): boolean {
        return instance.setField(this.nativeField, level, value)
    }

    public static get valueChangeEvent(): ObjectLevelFieldValueChangeEvent<AbilityIntegerLevelField> {
        return this.getOrCreateValueChangeEvent()
    }
}

export class AbilityStringLevelField extends AbilityLevelField<
    string,
    string,
    jabilitystringlevelfield
> {
    protected override get defaultValue(): string {
        return ""
    }

    protected override getNativeFieldById(id: number): jabilitystringlevelfield {
        return convertAbilityStringLevelField(id)
    }

    protected override getNativeFieldValue(source: AbilityFieldSource, level: number): string {
        return source.getField(this.nativeField, level)
    }

    protected override setNativeFieldValue(
        instance: Ability,
        level: number,
        value: string,
    ): boolean {
        return instance.setField(this.nativeField, level, value)
    }

    public static get valueChangeEvent(): ObjectLevelFieldValueChangeEvent<AbilityStringLevelField> {
        return this.getOrCreateValueChangeEvent()
    }
}

export abstract class AbilityObjectDataEntryIdLevelField<
    T extends ObjectDataEntryId = ObjectDataEntryId,
> extends AbilityLevelField<T, T, jabilitystringlevelfield> {
    protected override get defaultValue(): T {
        return 0 as T
    }

    protected override getNativeFieldById(id: number): jabilitystringlevelfield {
        return convertAbilityStringLevelField(id)
    }

    protected override getNativeFieldValue(source: AbilityFieldSource, level: number): T {
        const value = source.getField(this.nativeField, level)
        return (value == "" ? 0 : util.s2id(value)) as T
    }

    protected override setNativeFieldValue(instance: Ability, level: number, value: T): boolean {
        return instance.setField(this.nativeField, level, util.id2s(value))
    }
}

export class AbilityAbilityTypeIdLevelField extends AbilityObjectDataEntryIdLevelField<AbilityTypeId> {}

export class AbilityUnitTypeIdLevelField extends AbilityObjectDataEntryIdLevelField<UnitTypeId> {}

export abstract class AbilityEnumLevelField<T extends number> extends AbilityLevelField<
    T,
    T,
    jabilityintegerlevelfield
> {
    protected abstract values: ReadonlyNonEmptyLinkedSet<T>

    protected override get defaultValue(): T {
        return this.values.first()
    }

    protected override getNativeFieldById(id: number): jabilityintegerlevelfield {
        return convertAbilityIntegerLevelField(id)
    }

    protected override getNativeFieldValue(source: AbilityFieldSource, level: number): T {
        const value = source.getField(this.nativeField, level)
        if (this.values.contains(value)) {
            return value as T
        }
        return this.values.first()
    }

    protected override setNativeFieldValue(instance: Ability, level: number, value: T): boolean {
        return instance.setField(this.nativeField, level, value)
    }

    public static get valueChangeEvent(): ObjectLevelFieldValueChangeEvent<
        AbilityEnumLevelField<number>
    > {
        return this.getOrCreateValueChangeEvent()
    }
}

export class AbilityBuffPolarityLevelField extends AbilityEnumLevelField<BuffPolarity> {
    protected override values = nonEmptyLinkedSetOf(
        BuffPolarity.HIDDEN,
        BuffPolarity.POSITIVE,
        BuffPolarity.NEGATIVE,
    )
}

export class AbilityBuffResistanceTypeLevelField extends AbilityEnumLevelField<BuffResistanceType> {
    protected override values = nonEmptyLinkedSetOf(
        BuffResistanceType.MAGIC,
        BuffResistanceType.PHYSICAL,
        BuffResistanceType.BOTH,
    )
}

const allowedTargetCombatClassificationsByLevelByAbilityTypeId = postcompile(() => {
    const allowedTargetCombatClassificationsByLevelByAbilityTypeId = new LuaMap<
        AbilityTypeId,
        CombatClassifications[]
    >()
    for (const abilityType of AbilityType.getAll()) {
        allowedTargetCombatClassificationsByLevelByAbilityTypeId.set(
            abilityType.id,
            abilityType.allowedTargetCombatClassifications,
        )
    }
    return allowedTargetCombatClassificationsByLevelByAbilityTypeId
})

export class AbilityCombatClassificationsLevelField extends AbilityLevelField<
    CombatClassifications,
    CombatClassifications,
    jabilityintegerlevelfield
> {
    protected override get defaultValue(): CombatClassifications {
        return 0 as CombatClassifications
    }

    protected getNativeFieldById(id: number): jabilityintegerlevelfield {
        return convertAbilityIntegerLevelField(id)
    }

    protected getNativeFieldValue(
        source: AbilityFieldSource,
        level: number,
    ): CombatClassifications {
        if (this.id == fourCC("atar")) {
            return (
                allowedTargetCombatClassificationsByLevelByAbilityTypeId.get(source.typeId)?.[
                    level
                ] ?? this.defaultValue
            )
        }
        return source.getField(this.nativeField, level) as CombatClassifications
    }

    protected setNativeFieldValue(
        instance: Ability,
        level: number,
        value: CombatClassifications,
    ): boolean {
        return instance.setField(this.nativeField, level, value)
    }
}

export type ReadonlySubscribableAbilityDependentValue<ValueType extends boolean | number | string> =

        | ValueType
        | ReadonlyObjectFieldType<AbilityField<ValueType>>
        | ReadonlyObjectLevelFieldType<AbilityLevelField<ValueType>>

export type SubscribableAbilityDependentValue<ValueType extends boolean | number | string> =
    | ValueType
    | AbilityField<ValueType>
    | AbilityLevelField<ValueType>

export type AbilityDependentValue<ValueType extends boolean | number | string> =
    | SubscribableAbilityDependentValue<ValueType>
    | ((ability: AbilityOrSnapshot) => ValueType)

export const resolveCurrentAbilityDependentValue: {
    <ValueType extends boolean | number | string>(
        ability: AbilityOrSnapshot,
        value: AbilityDependentValue<ValueType>,
    ): ValueType
    <ValueType extends boolean | number | string>(
        ability: AbilityOrSnapshot,
        value?: AbilityDependentValue<ValueType>,
    ): ValueType | undefined
} = <ValueType extends boolean | number | string>(
    ability: AbilityOrSnapshot,
    value?: AbilityDependentValue<ValueType>,
): ValueType | undefined => {
    if (value instanceof AbilityField) {
        return value.getCurrentValue(ability)
    } else if (value instanceof AbilityLevelField) {
        return value.getCurrentValue(ability)
    } else if (typeof value == "function") {
        // A supplier is given whatever the value is resolved from, a snapshot included: what it
        // reads of one is what the ability was, as a field of one would be, and the ability
        // itself is there to be read through `ability` for anything a snapshot does not hold.
        return value(ability)
    } else {
        return value
    }
}
