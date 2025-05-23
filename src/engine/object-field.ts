import { createDispatchingEvent, DispatchingEvent, Event, EventParameters } from "../event"
import { IllegalArgumentException } from "../exception"
import { getClass, getSuperclass } from "../utility/reflection"
import { AbstractConstructor } from "../utility/types"

import {
    extractObjectDataEntryLevelFieldValue,
    ObjectDataEntry,
    ObjectDataEntryId,
    ObjectDataEntryIdType,
    ObjectDataEntryLevelFieldValueSupplier,
} from "./object-data/entry"
import { ObjectDataEntryIdGenerator } from "./object-data/utility/object-data-entry-id-generator"

export type ObjectFieldId = number & { readonly __objectDataEntryFieldId: unique symbol }

const compiletimeDefaultValueByObjectDataEntryIdByObjectFieldId = new LuaMap<
    ObjectFieldId,
    LuaMap<ObjectDataEntryId, number | boolean | string | (number | boolean | string)[]>
>()

const defaultValueByObjectDataEntryIdByObjectFieldId = postcompile(
    () => compiletimeDefaultValueByObjectDataEntryIdByObjectFieldId,
)

const objectFieldById = new LuaMap<number, ObjectFieldBase<any, any, any, any>>()

export type ObjectFieldConstructor<T extends ObjectFieldBase<any, any, any, any>> = OmitConstructor<
    typeof ObjectFieldBase
> &
    (new (id: number) => T)

export type ObjectFieldAbstractConstructor<T extends ObjectFieldBase<any, any, any, any>> =
    OmitConstructor<typeof ObjectFieldBase> & (abstract new (id: number) => T)

const idGenerator = new ObjectDataEntryIdGenerator(fourCC("f000"))

abstract class ObjectFieldBase<
    ObjectDataEntryType extends ObjectDataEntry,
    InstanceType extends AnyNotNil,
    ValueType,
    NativeFieldType,
> {
    /** @internal */
    protected readonly valueByInstance = setmetatable(new LuaMap<InstanceType, ValueType>(), {
        __mode: "k",
    })

    protected abstract readonly instanceClass: AbstractConstructor<InstanceType> | Function

    public supports(instance: AnyNotNil): instance is InstanceType & {
        readonly __oneSidedTypeGuard: unique symbol
    } {
        return instance instanceof this.instanceClass
    }

    protected get nativeField(): NativeFieldType {
        const nativeField = this.getNativeFieldById(this.id)
        rawset(this as any, "nativeField", nativeField)
        return nativeField
    }

    public readonly id: ObjectFieldId

    protected abstract getNativeFieldById(id: number): NativeFieldType

    protected abstract getObjectDataEntryId(
        instance: InstanceType,
    ): ObjectDataEntryIdType<ObjectDataEntryType>

    protected abstract hasNativeFieldValue(instance: InstanceType): boolean

    public hasValue(instance: InstanceType): boolean {
        const defaultValueByObjectDataEntryId = defaultValueByObjectDataEntryIdByObjectFieldId.get(
            this.id,
        )
        return (
            (defaultValueByObjectDataEntryId != undefined &&
                defaultValueByObjectDataEntryId.has(this.getObjectDataEntryId(instance))) ||
            this.hasNativeFieldValue(instance)
        )
    }

    public constructor(id: number) {
        if (objectFieldById.has(id)) {
            throw new IllegalArgumentException(`An object field with id ${id} already exists.`)
        }
        this.id = id as ObjectFieldId
        objectFieldById.set(id, this)
    }

    public static create<T extends ObjectFieldBase<any, any, any, any>>(
        this: ObjectFieldConstructor<T>,
        id?: number,
    ): T & symbol {
        return new this(id ?? idGenerator.next()) as T & symbol
    }

    public static of<T extends ObjectFieldBase<any, any, any, any>>(
        this: ObjectFieldAbstractConstructor<T>,
        id: number,
    ): T | undefined {
        const objectField = objectFieldById.get(id)
        return objectField instanceof this ? (objectField as T & symbol) : undefined
    }
}

export type ObjectFieldValueChangeEvent<
    T extends
        | ObjectField<any, any, any, any>
        | ReadonlyObjectFieldType<ObjectField<any, any, any, any>>,
> =
    T extends ObjectField<any, infer InstanceType, infer ValueType, any>
        ? DispatchingEvent<
              [instance: InstanceType, field: T, previousValue: ValueType, newValue: ValueType]
          >
        : T extends ReadonlyObjectFieldType<
                ObjectField<any, infer InstanceType, infer ValueType, any>
            >
          ? DispatchingEvent<
                [instance: InstanceType, field: T, previousValue: ValueType, newValue: ValueType]
            >
          : never

export type ReadonlyObjectFieldType<T extends ObjectField<any, any, any, any>> = Omit<
    T,
    "setValue" | "removeValue" | "trySetValue"
>

type ReadonlyObjectFieldConstructor<T extends ObjectField> = OmitConstructor<typeof ObjectField> &
    (abstract new (...args: any[]) => ReadonlyObjectFieldType<T>)

const valueChangeEventByObjectFieldConstructor = new LuaMap<
    ReadonlyObjectFieldConstructor<ObjectField>,
    ObjectFieldValueChangeEvent<ReadonlyObjectFieldType<ObjectField>>
>()

export abstract class ObjectField<
    ObjectDataEntryType extends ObjectDataEntry = ObjectDataEntry,
    InstanceType extends AnyNotNil = AnyNotNil,
    ValueType extends number | string | boolean = number | string | boolean,
    NativeFieldType = unknown,
> extends ObjectFieldBase<ObjectDataEntryType, InstanceType, ValueType, NativeFieldType> {
    protected abstract readonly defaultValue: ValueType

    protected abstract getNativeFieldValue(instance: InstanceType): ValueType

    protected abstract setNativeFieldValue(instance: InstanceType, value: ValueType): boolean

    public getValue(entry: ObjectDataEntryType | InstanceType): ValueType {
        if (entry instanceof ObjectDataEntry) {
            const defaultValueByObjectDataEntryId = (
                warpack.compiletime
                    ? compiletimeDefaultValueByObjectDataEntryIdByObjectFieldId
                    : defaultValueByObjectDataEntryIdByObjectFieldId
            ).get(this.id)
            if (defaultValueByObjectDataEntryId != undefined) {
                const value = defaultValueByObjectDataEntryId.get(entry.id) as ValueType | undefined
                if (value != undefined) {
                    return value
                }
            }
            return this.defaultValue
        }
        const defaultValueByObjectDataEntryId = defaultValueByObjectDataEntryIdByObjectFieldId.get(
            this.id,
        )
        if (defaultValueByObjectDataEntryId != undefined) {
            const defaultValue = defaultValueByObjectDataEntryId.get(
                this.getObjectDataEntryId(entry),
            ) as ValueType | undefined
            if (defaultValue != undefined) {
                return this.valueByInstance.get(entry) ?? defaultValue
            }
        }
        return this.getNativeFieldValue(entry) ?? this.defaultValue
    }

    public setValue(entry: ObjectDataEntryType | InstanceType, value: ValueType): boolean {
        if (entry instanceof ObjectDataEntry) {
            if (!warpack.compiletime) {
                return false
            }
            let defaultValueByObjectDataEntryId =
                compiletimeDefaultValueByObjectDataEntryIdByObjectFieldId.get(this.id)
            if (defaultValueByObjectDataEntryId == undefined) {
                defaultValueByObjectDataEntryId = new LuaMap()
                compiletimeDefaultValueByObjectDataEntryIdByObjectFieldId.set(
                    this.id,
                    defaultValueByObjectDataEntryId,
                )
            }
            defaultValueByObjectDataEntryId.set(entry.id, value)
            return true
        }

        const defaultValueByObjectDataEntryId = defaultValueByObjectDataEntryIdByObjectFieldId.get(
            this.id,
        )
        if (defaultValueByObjectDataEntryId != undefined) {
            const defaultValue = defaultValueByObjectDataEntryId.get(
                this.getObjectDataEntryId(entry),
            ) as ValueType | undefined
            if (defaultValue != undefined) {
                const previousValue =
                    this.valueByInstance.get(entry) ?? defaultValue ?? this.defaultValue
                if (value != previousValue) {
                    this.valueByInstance.set(entry, value)
                    this.invokeValueChangeEvent(entry, this, previousValue, value)
                }
                return true
            }
        }
        if (!this.hasNativeFieldValue(entry)) {
            return false
        }
        const previousValue = this.getNativeFieldValue(entry)
        if (value != previousValue) {
            if (!this.setNativeFieldValue(entry, value)) {
                return false
            }
            this.invokeValueChangeEvent(entry, this, previousValue, value)
        }
        return true
    }

    public removeValue(entry: ObjectDataEntryType): boolean {
        if (!warpack.compiletime) {
            return false
        }
        const defaultValueByObjectDataEntryId =
            compiletimeDefaultValueByObjectDataEntryIdByObjectFieldId.get(this.id)
        if (defaultValueByObjectDataEntryId != undefined) {
            if (defaultValueByObjectDataEntryId.has(entry.id)) {
                defaultValueByObjectDataEntryId.delete(entry.id)
                return true
            }
            return false
        }
        return false
    }

    public trySetValue(entry: ObjectDataEntryType | InstanceType, value: unknown): boolean {
        if (typeof value != typeof this.defaultValue) {
            return false
        }
        return this.setValue(entry, value as ValueType)
    }

    private invokeValueChangeEvent(
        ...args: [
            instance: InstanceType,
            field: this,
            previousValue: ValueType,
            newValue: ValueType,
        ]
    ): void {
        this.invokeValueChangeEventRecursive(getClass(this), ...args)
    }

    private invokeValueChangeEventRecursive(
        clazz: AbstractConstructor<this> | undefined,
        ...args: [
            instance: InstanceType,
            field: this,
            previousValue: ValueType,
            newValue: ValueType,
        ]
    ): void {
        if (clazz == undefined) {
            return
        }
        this.invokeValueChangeEventRecursive(getSuperclass(clazz), ...args)
        const valueChangeEvent = valueChangeEventByObjectFieldConstructor.get(
            clazz as unknown as typeof ObjectField,
        )
        if (valueChangeEvent != undefined) {
            Event.invoke(valueChangeEvent, ...args)
        }
    }

    protected static getOrCreateValueChangeEvent<
        T extends ObjectField,
        R extends ReadonlyObjectFieldType<T>,
    >(this: ReadonlyObjectFieldConstructor<T>): ObjectFieldValueChangeEvent<R> {
        let valueChangeEvent = valueChangeEventByObjectFieldConstructor.get(this)
        if (valueChangeEvent == undefined) {
            valueChangeEvent = createDispatchingEvent(
                new Event<EventParameters<ObjectFieldValueChangeEvent<R>>>(),
                (...[, objectLevelField]) => objectLevelField.id,
            )
            valueChangeEventByObjectFieldConstructor.set(this, valueChangeEvent)
        }
        return valueChangeEvent as ObjectFieldValueChangeEvent<R>
    }

    public static get valueChangeEvent(): ObjectFieldValueChangeEvent<
        ReadonlyObjectFieldType<ObjectField>
    > {
        return this.getOrCreateValueChangeEvent()
    }
}

export type ReadonlyObjectLevelFieldType<T extends ObjectLevelField<any, any, any, any>> = Omit<
    T,
    "setValue" | "trySetValue"
>

export type ObjectLevelFieldValueChangeEvent<
    T extends
        | ObjectLevelField<any, any, any, any>
        | ReadonlyObjectLevelFieldType<ObjectLevelField<any, any, any, any>>,
> =
    T extends ObjectLevelField<any, infer InstanceType, infer ValueType, any, any>
        ? DispatchingEvent<
              [
                  instance: InstanceType,
                  field: T,
                  level: number,
                  previousValue: ValueType,
                  newValue: ValueType,
              ]
          >
        : T extends ReadonlyObjectLevelFieldType<
                ObjectLevelField<any, infer InstanceType, infer ValueType, any, any>
            >
          ? DispatchingEvent<
                [
                    instance: InstanceType,
                    field: T,
                    level: number,
                    previousValue: ValueType,
                    newValue: ValueType,
                ]
            >
          : never

type ReadonlyObjectLevelFieldConstructor<T extends ObjectLevelField> = OmitConstructor<
    typeof ObjectLevelField
> &
    (abstract new (...args: any[]) => ReadonlyObjectLevelFieldType<T>)

const valueChangeEventByObjectLevelFieldConstructor = new LuaMap<
    ReadonlyObjectLevelFieldConstructor<ObjectLevelField>,
    ObjectLevelFieldValueChangeEvent<ReadonlyObjectLevelFieldType<ObjectLevelField>>
>()

export abstract class ObjectArrayField<
    ObjectDataEntryType extends ObjectDataEntry = ObjectDataEntry,
    InstanceType extends AnyNotNil = AnyNotNil,
    ValueType extends number | string | boolean = number | string | boolean,
    NativeFieldType = unknown,
> extends ObjectFieldBase<ObjectDataEntryType, InstanceType, ValueType[], NativeFieldType> {
    protected abstract readonly defaultValue: ValueType

    protected abstract getNativeFieldValue(instance: InstanceType, index: number): ValueType

    protected abstract setNativeFieldValue(
        instance: InstanceType,
        index: number,
        value: ValueType,
    ): boolean

    public getValue<IndexType extends [number] | []>(
        entry: ObjectDataEntryType | InstanceType,
        ...[index]: IndexType
    ): IndexType extends [number] ? ValueType : ValueType[]

    public getValue(
        entry: ObjectDataEntryType | InstanceType,
        index?: number,
    ): ValueType[] | ValueType {
        if (entry instanceof ObjectDataEntry) {
            const defaultValueByObjectDataEntryId = (
                warpack.compiletime
                    ? compiletimeDefaultValueByObjectDataEntryIdByObjectFieldId
                    : defaultValueByObjectDataEntryIdByObjectFieldId
            ).get(this.id)
            if (defaultValueByObjectDataEntryId != undefined) {
                const value = defaultValueByObjectDataEntryId.get(entry.id) as
                    | ValueType[]
                    | undefined
                if (value != undefined) {
                    return index == undefined ? value : (value[index] ?? this.defaultValue)
                }
            }
            return index == undefined ? [] : this.defaultValue
        }

        const defaultValueByObjectDataEntryId = defaultValueByObjectDataEntryIdByObjectFieldId.get(
            this.id,
        )
        if (defaultValueByObjectDataEntryId != undefined) {
            const defaultValue = defaultValueByObjectDataEntryId.get(
                this.getObjectDataEntryId(entry),
            ) as ValueType[] | undefined
            if (defaultValue != undefined) {
                const value = this.valueByInstance.get(entry) ?? defaultValue
                return index == undefined ? value : (value[index] ?? this.defaultValue)
            }
        }

        if (index != undefined) {
            return this.getNativeFieldValue(entry, index)
        }

        const result: ValueType[] = []

        for (
            let index = 0,
                previousValue: ValueType | undefined = undefined,
                value: ValueType = this.getNativeFieldValue(entry, index);
            value != previousValue && value != this.defaultValue;
            ++index, previousValue = value, value = this.getNativeFieldValue(entry, index)
        ) {
            result[index] = value
        }

        return result
    }

    public setValue(entry: ObjectDataEntryType | InstanceType, value: ValueType[]): boolean {
        // TODO
        return false
    }
}

export abstract class ObjectLevelField<
    ObjectDataEntryType extends ObjectDataEntry = ObjectDataEntry,
    InstanceType extends AnyNotNil = AnyNotNil,
    ValueType extends number | string | boolean = number | string | boolean,
    InputValueType extends ValueType = never,
    NativeFieldType = unknown,
> extends ObjectFieldBase<ObjectDataEntryType, InstanceType, ValueType[], NativeFieldType> {
    protected abstract readonly defaultValue: ValueType

    protected abstract getNativeFieldValue(instance: InstanceType, level: number): ValueType

    protected abstract setNativeFieldValue(
        instance: InstanceType,
        level: number,
        value: ValueType,
    ): boolean

    protected abstract getLevelCount(entry: ObjectDataEntryType | InstanceType): number

    public getValue<LevelType extends [number] | []>(
        entry: ObjectDataEntryType | InstanceType,
        ...[level]: LevelType
    ): LevelType extends [number] ? ValueType : ValueType[]

    public getValue(
        entry: ObjectDataEntryType | InstanceType,
        level?: number,
    ): ValueType[] | ValueType {
        if (level == undefined) {
            const result: ValueType[] = []
            const levelCount = this.getLevelCount(entry)
            for (const i of $range(0, levelCount - 1)) {
                result[i] = this.getValue(entry, i)
            }
            return result
        }

        if (entry instanceof ObjectDataEntry) {
            const defaultValueByObjectDataEntryId = (
                warpack.compiletime
                    ? compiletimeDefaultValueByObjectDataEntryIdByObjectFieldId
                    : defaultValueByObjectDataEntryIdByObjectFieldId
            ).get(this.id)
            if (defaultValueByObjectDataEntryId != undefined) {
                const valueByLevel = defaultValueByObjectDataEntryId.get(entry.id) as
                    | ValueType[]
                    | undefined
                if (valueByLevel != undefined) {
                    return valueByLevel[level] ?? this.defaultValue
                }
            }
            return this.defaultValue
        }

        const defaultValueByObjectDataEntryId = defaultValueByObjectDataEntryIdByObjectFieldId.get(
            this.id,
        )
        if (defaultValueByObjectDataEntryId != undefined) {
            const defaultValueByLevel = defaultValueByObjectDataEntryId.get(
                this.getObjectDataEntryId(entry),
            ) as ValueType[] | undefined
            if (defaultValueByLevel != undefined) {
                return (
                    this.valueByInstance.get(entry)?.[level] ??
                    defaultValueByLevel[level] ??
                    this.defaultValue
                )
            }
        }
        return this.getNativeFieldValue(entry, level) ?? this.defaultValue
    }

    public setValue(
        entry: ObjectDataEntryType | InstanceType,
        ...[levelOrValue, value]:
            | [value: ObjectDataEntryLevelFieldValueSupplier<InputValueType, ValueType>]
            | [level: number, value: InputValueType]
    ): boolean

    public setValue(
        entry: ObjectDataEntryType | InstanceType,
        levelOrValue: number | ObjectDataEntryLevelFieldValueSupplier<InputValueType, ValueType>,
        value?: InputValueType,
    ): boolean {
        if (value == undefined) {
            let result = false
            const levelCount = this.getLevelCount(entry)
            for (const i of $range(0, levelCount - 1)) {
                result =
                    this.setValue(
                        entry,
                        i,
                        extractObjectDataEntryLevelFieldValue(
                            levelOrValue as ObjectDataEntryLevelFieldValueSupplier<
                                InputValueType,
                                ValueType
                            >,
                            i,
                            this.getValue(entry, i),
                        ),
                    ) || result
            }
            return result
        }

        const level = levelOrValue as number
        if (level < 0 || level >= this.getLevelCount(entry)) {
            return false
        }
        if (entry instanceof ObjectDataEntry) {
            if (!warpack.compiletime) {
                return false
            }
            let defaultValueByObjectDataEntryId =
                compiletimeDefaultValueByObjectDataEntryIdByObjectFieldId.get(this.id)
            if (defaultValueByObjectDataEntryId == undefined) {
                defaultValueByObjectDataEntryId = new LuaMap()
                compiletimeDefaultValueByObjectDataEntryIdByObjectFieldId.set(
                    this.id,
                    defaultValueByObjectDataEntryId,
                )
            }
            let valueByLevel = defaultValueByObjectDataEntryId.get(entry.id) as
                | ValueType[]
                | undefined
            if (valueByLevel == undefined) {
                valueByLevel = []
                defaultValueByObjectDataEntryId.set(entry.id, valueByLevel)
            }
            valueByLevel[level] = value
            return true
        }
        const defaultValueByObjectDataEntryId = defaultValueByObjectDataEntryIdByObjectFieldId.get(
            this.id,
        )
        if (defaultValueByObjectDataEntryId != undefined) {
            const defaultValueByLevel = defaultValueByObjectDataEntryId.get(
                this.getObjectDataEntryId(entry),
            ) as ValueType[] | undefined
            if (defaultValueByLevel != undefined) {
                let valueByLevel = this.valueByInstance.get(entry)
                if (valueByLevel == undefined) {
                    valueByLevel = []
                    this.valueByInstance.set(entry, valueByLevel)
                }
                const previousValue =
                    valueByLevel[level] ?? defaultValueByLevel[level] ?? this.defaultValue
                if (value != previousValue) {
                    valueByLevel[level] = value
                    this.invokeValueChangeEvent(entry, this, level, previousValue, value)
                }
                return true
            }
        }
        if (!this.hasNativeFieldValue(entry)) {
            return false
        }
        const previousValue = this.getNativeFieldValue(entry, level)
        if (value != previousValue) {
            if (!this.setNativeFieldValue(entry, level, value)) {
                return false
            }
            this.invokeValueChangeEvent(entry, this, level, previousValue, value)
        }
        return true
    }

    public trySetValue(
        entry: ObjectDataEntryType | InstanceType,
        levelOrValue: number | unknown,
        value?: unknown,
    ): boolean {
        if (value != undefined) {
            if (typeof value != typeof this.defaultValue) {
                return false
            }
            if (typeof levelOrValue != "number") {
                return false
            }
            return this.setValue(entry, levelOrValue, value as InputValueType)
        }

        if (typeof levelOrValue != typeof this.defaultValue) {
            return false
        }
        return this.setValue(entry, levelOrValue as InputValueType)
    }

    private invokeValueChangeEvent(
        ...args: [
            instance: InstanceType,
            field: this,
            level: number,
            previousValue: ValueType,
            newValue: ValueType,
        ]
    ): void {
        this.invokeValueChangeEventRecursive(getClass(this), ...args)
    }

    private invokeValueChangeEventRecursive(
        clazz: AbstractConstructor<this> | undefined,
        ...args: [
            instance: InstanceType,
            field: this,
            level: number,
            previousValue: ValueType,
            newValue: ValueType,
        ]
    ): void {
        if (clazz == undefined) {
            return
        }
        this.invokeValueChangeEventRecursive(getSuperclass(clazz), ...args)
        const valueChangeEvent = valueChangeEventByObjectLevelFieldConstructor.get(
            clazz as unknown as typeof ObjectLevelField,
        )
        if (valueChangeEvent != undefined) {
            Event.invoke(valueChangeEvent, ...args)
        }
    }

    protected static getOrCreateValueChangeEvent<
        T extends ObjectLevelField,
        R extends ReadonlyObjectLevelFieldType<T>,
    >(this: ReadonlyObjectLevelFieldConstructor<T>): ObjectLevelFieldValueChangeEvent<R> {
        let valueChangeEvent = valueChangeEventByObjectLevelFieldConstructor.get(this)
        if (valueChangeEvent == undefined) {
            valueChangeEvent = createDispatchingEvent(
                new Event<EventParameters<ObjectLevelFieldValueChangeEvent<R>>>(),
                (...[, objectLevelField]) => objectLevelField.id,
            )
            valueChangeEventByObjectLevelFieldConstructor.set(this, valueChangeEvent)
        }
        return valueChangeEvent as ObjectLevelFieldValueChangeEvent<R>
    }

    public static get valueChangeEvent(): ObjectLevelFieldValueChangeEvent<
        ReadonlyObjectLevelFieldType<ObjectLevelField>
    > {
        return this.getOrCreateValueChangeEvent()
    }
}
