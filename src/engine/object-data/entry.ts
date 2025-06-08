import {
    AttachmentPreset,
    AttachmentPresetInput,
    extractAttachmentPresetInputModelPath,
    extractAttachmentPresetInputNodeFQN,
    splitAttachmentNodeFQN,
} from "./auxiliary/attachment-preset"

import { IllegalStateException } from "../../exception"
import { map, zip } from "../../utility/arrays"
import { MutableKeys } from "../../utility/types"
import { check } from "../../utility/preconditions"
import { max } from "../../math"

export type ObjectDataEntryId = (number | string) & { readonly __objectDataEntryId: unique symbol }

export type ObjectDataEntryIdType<T extends ObjectDataEntry> =
    T extends ObjectDataEntry<infer Id> ? Id : never

export type ObjectDataEntryConstructor<T extends ObjectDataEntry> = OmitConstructor<
    typeof ObjectDataEntry
> &
    (new (object: WarObject) => T)

export type ObjectDataEntryAbstractConstructor<T extends ObjectDataEntry> = OmitConstructor<
    typeof ObjectDataEntry
> &
    (abstract new (object: WarObject) => T)

export type ObjectDataEntryProperties<T extends ObjectDataEntry> = Partial<T[MutableKeys<T>]>

export type ObjectDataEntryLevelFieldValueSupplier<
    ValueType extends string | number | boolean | undefined | Record<string, any>,
    InputValueType = ValueType,
> = ValueType | readonly ValueType[] | ((level: number, currentValue: InputValueType) => ValueType)

export const extractObjectDataEntryLevelFieldValue = <
    ValueType extends string | number | boolean | undefined | Record<string, any>,
    InputValueType = ValueType,
>(
    supplier: ObjectDataEntryLevelFieldValueSupplier<ValueType, InputValueType>,
    level: number,
    currentValue: InputValueType,
): ValueType => {
    return Array.isArray(supplier)
        ? supplier[level]
        : typeof supplier == "function"
          ? supplier(level, currentValue)
          : (supplier as ValueType)
}

export const extractObjectDataEntryLevelArrayFieldValue = <
    T extends string | number | boolean | undefined | Record<string, any>,
    S extends T[],
>(
    supplier: ObjectDataEntryLevelFieldValueSupplier<S>,
    level: number,
    currentValue: S,
): S => {
    return typeof supplier == "function"
        ? supplier(level, currentValue)
        : Array.isArray(supplier[0])
          ? supplier[0]
          : (supplier as S)
}

const objectDataEntryByObjectDataEntryId = new LuaMap<ObjectDataEntryId, ObjectDataEntry>()

const internalObjectDataEntryIds = new LuaSet<ObjectDataEntryId>()

type LevelFieldParameters<T extends string | number | boolean | undefined | Record<string, any>> = {
    supplier: ObjectDataEntryLevelFieldValueSupplier<T>
    extractor: (
        this: void,
        supplier: ObjectDataEntryLevelFieldValueSupplier<T>,
        level: number,
        value: T,
    ) => T
    dataToValue: (this: void, data: string | number | undefined) => T
    valueToData: (this: void, value: T) => string | number
}

export abstract class ObjectDataEntry<Id extends ObjectDataEntryId = ObjectDataEntryId> {
    public static readonly BASE_ID = 0 as ObjectDataEntryId

    protected static readonly IS_SYNTHETIC: boolean = false

    private readonly levelFieldParametersByField = new LuaMap<string, LevelFieldParameters<any>>()
    private readonly maxAffectedLevelByField = new LuaMap<string, number>()

    private _isInternal = false

    private get type(): ObjectDataEntryConstructor<ObjectDataEntry<Id>> {
        return this.constructor as ObjectDataEntryConstructor<ObjectDataEntry<Id>>
    }

    public get isInternal(): boolean {
        return this._isInternal
    }

    /** @internal For use by internal systems only. */
    public set isInternal(isInternal: boolean) {
        if (isInternal) {
            internalObjectDataEntryIds.add(this.id)
        } else {
            internalObjectDataEntryIds.delete(this.id)
        }
        this._isInternal = isInternal
    }

    public static get idType(): "number" | "string" {
        return typeof this.BASE_ID == "number" ? "number" : "string"
    }

    protected static generateId(): number | string {
        throw new IllegalStateException(
            `An object type definition must override the 'generateId' static method.`,
        )
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    protected static getObjectData(map: WarMap): WarObjects {
        throw new IllegalStateException(
            `An object type definition must override the 'getObjectData' static method.`,
        )
    }

    public static getAllIdsByBaseIds<T extends ObjectDataEntry>(
        this: ObjectDataEntryAbstractConstructor<T>,
        baseIds: number | number[] | string | string[],
    ): ObjectDataEntryIdType<T>[] {
        return map(this.getAllByBaseIds(baseIds), "id") as ObjectDataEntryIdType<T>[]
    }

    public static create<T extends ObjectDataEntry>(
        this: ObjectDataEntryConstructor<T>,
        ...args:
            | [id?: number | string, properties?: ObjectDataEntryProperties<T>]
            | [properties: ObjectDataEntryProperties<T>]
    ): T

    public static create<T extends ObjectDataEntry>(
        this: ObjectDataEntryConstructor<T>,
        id?: number | string | ObjectDataEntryProperties<T>,
        properties?: ObjectDataEntryProperties<T>,
    ): T {
        if (typeof id == "object") {
            id = undefined
            properties = id
        }

        if (currentMap == undefined) {
            throw new IllegalStateException(
                `Cannot create a new object type when not compiling a map.`,
            )
        }
        const constructor = this as ObjectDataEntryConstructor<T> & typeof ObjectDataEntry
        const registry = constructor.getObjectData(currentMap)
        const baseId = this.BASE_ID
        if (baseId == 0) {
            throw new IllegalStateException(
                `An object type definition must override the BASE_ID static property.`,
            )
        }
        const object = registry.newObject(
            objectDataEntryIdToData(id ?? constructor.generateId()),
            objectDataEntryIdToData(baseId),
        )
        const objectDataEntry: T = new this(object)
        if (properties != undefined) {
            Object.assign(objectDataEntry, properties)
        }
        return objectDataEntry
    }

    public static getAllByBaseIds<T extends ObjectDataEntry>(
        this: ObjectDataEntryAbstractConstructor<T>,
        baseIds: number | number[] | string | string[],
    ): T[] {
        if (currentMap == undefined) {
            return []
        }

        const dataBaseIds = new LuaSet<string>()
        if (Array.isArray(baseIds)) {
            for (const baseId of baseIds) {
                dataBaseIds.add(objectDataEntryIdToData(baseId))
            }
        } else {
            dataBaseIds.add(objectDataEntryIdToData(baseIds))
        }

        const result: T[] = []

        const constructor = this as ObjectDataEntryAbstractConstructor<T> & typeof ObjectDataEntry
        for (const [id, object] of pairs(constructor.getObjectData(currentMap).all)) {
            if (dataBaseIds.has(object.parentId ?? id)) {
                const objectDataEntry = this.of(dataToObjectDataEntryId(id, this.idType))
                if (objectDataEntry != undefined && !objectDataEntry.isInternal) {
                    result[result.length] = objectDataEntry
                }
            }
        }

        return result
    }

    public static getAll<T extends ObjectDataEntry>(
        this: ObjectDataEntryAbstractConstructor<T>,
    ): T[] {
        if (currentMap == undefined) {
            return []
        }
        const constructor = this as unknown as typeof ObjectDataEntry
        const result: T[] = []
        for (const [id] of pairs(constructor.getObjectData(currentMap).all)) {
            const objectDataEntry = this.of(dataToObjectDataEntryId(id, this.idType))
            if (objectDataEntry != undefined && !objectDataEntry.isInternal) {
                result[result.length] = objectDataEntry as T
            }
        }
        return result
    }

    public static of<T extends ObjectDataEntry>(
        this: ObjectDataEntryAbstractConstructor<T>,
        id: number | string,
    ): T | undefined {
        if (currentMap == undefined) {
            return undefined
        }
        const constructor = this as unknown as typeof ObjectDataEntry
        const registry = constructor.getObjectData(currentMap)
        const object = registry.getObject(objectDataEntryIdToData(id))
        if (object == undefined) {
            return undefined
        }
        let objectDataEntry = objectDataEntryByObjectDataEntryId.get(
            dataToObjectDataEntryId(object.id, this.idType),
        )
        if (objectDataEntry == undefined) {
            if (
                !constructor.IS_SYNTHETIC &&
                (this.BASE_ID == 0 ||
                    dataToObjectDataEntryId(object.parentId, this.idType) == this.BASE_ID)
            ) {
                objectDataEntry = new (class AbstractObjectDataEntryView extends constructor {
                    public constructor(object: WarObject) {
                        super(object)
                    }
                })(object)
            } else {
                return undefined
            }
        } else if (!(objectDataEntry instanceof this)) {
            return undefined
        }
        return objectDataEntry as T
    }

    public constructor(protected readonly object: WarObject) {
        if (!warpack.compiletime) {
            throw new IllegalStateException("Object data entries cannot be constructed in runtime.")
        }
        objectDataEntryByObjectDataEntryId.set(this.id, this)
    }

    public get id(): Id {
        return dataToObjectDataEntryId(this.object.id, this.type.idType)
    }

    public get baseId(): Id {
        return dataToObjectDataEntryId(this.object.parentId ?? this.object.id, this.type.idType)
    }

    public get isCustom(): boolean {
        return this.object.parentId != undefined
    }

    public getFieldValue<This extends this, Args extends any[], T>(
        this: This,
        field: {
            getValue(entry: This, ...args: Args): T
        },
        ...args: Args
    ): T {
        return field.getValue(this, ...args)
    }

    public setFieldValue<This extends this, Args extends any[]>(
        this: This,
        field: {
            setValue(entry: This, ...args: Args): boolean
        },
        ...args: Args
    ): void {
        check(field.setValue(this, ...args))
    }

    protected getBooleanField(field: string): boolean {
        return dataToBoolean(this.object.getField(field))
    }

    protected setBooleanField(field: string, value: boolean): void {
        this.object.setField(field, booleanToData(value))
    }

    protected getNumberField(field: string): number {
        return dataToNumber(this.object.getField(field))
    }

    protected setNumberField(field: string, value: number): void {
        this.object.setField(field, numberToData(value))
        if (field == "levels" || field == "maxlevel" || field == "alev" || field == "glvl") {
            for (const [otherField, levelFieldParameters] of this.levelFieldParametersByField) {
                const { supplier, extractor, dataToValue, valueToData } = levelFieldParameters

                const maxAffectedLevel = this.maxAffectedLevelByField.get(otherField) ?? 0
                if (value > maxAffectedLevel) {
                    this.maxAffectedLevelByField.set(otherField, value)
                    for (const level of $range(maxAffectedLevel + 1, value)) {
                        const value = extractor(
                            supplier,
                            level - 1,
                            dataToValue(this.object.getField(`${otherField}+${level}`)),
                        )
                        this.object.setField(`${otherField}+${level}`, valueToData(value))
                    }
                }
            }
        }
    }

    protected getStringField(field: string): string {
        return dataToString(this.object.getField(field))
    }

    protected setStringField(field: string, value: string): void {
        this.object.setField(field, stringToData(value))
    }

    protected getObjectDataEntryNumericIdField<Id extends ObjectDataEntryId & number>(
        field: string,
    ): Id {
        return dataToObjectDataEntryNumericId(this.object.getField(field))
    }

    protected setObjectDataEntryNumericIdField<Id extends ObjectDataEntryId & number>(
        field: string,
        value: Id,
    ): void {
        this.object.setField(field, objectDataEntryNumericIdToData(value))
    }

    protected getAttachmentPresetField(
        modelPathField: string,
        nodeFQNField: string,
    ): AttachmentPreset | undefined {
        const modelPath = this.getStringField(modelPathField)
        if (modelPath != "") {
            const [nodeName, nodeQualifiers] = splitAttachmentNodeFQN(
                this.getStringField(nodeFQNField),
            )
            return {
                modelPath: modelPath,
                nodeName: nodeName,
                nodeQualifiers: nodeQualifiers,
            }
        }
        return undefined
    }

    protected setAttachmentPresetField(
        modelPathField: string,
        nodeFQNField: string,
        attachmentPreset: AttachmentPresetInput | undefined,
    ): void {
        this.setStringField(modelPathField, extractAttachmentPresetInputModelPath(attachmentPreset))
        this.setStringField(nodeFQNField, extractAttachmentPresetInputNodeFQN(attachmentPreset))
    }

    protected getBooleansField(field: string): boolean[] {
        return dataToBooleans(this.object.getField(field))
    }

    protected setBooleansField(field: string, values: boolean[]): void {
        this.object.setField(field, booleansToData(values))
    }

    protected getNumbersField(field: string): number[] {
        return dataToNumbers(this.object.getField(field))
    }

    protected setNumbersField(field: string, values: number[]): void {
        this.object.setField(field, numbersToData(values))
    }

    protected getStringsField(field: string): string[] {
        return dataToStrings(this.object.getField(field))
    }

    protected setStringsField(field: string, values: string[]): void {
        this.object.setField(field, stringsToData(values))
    }

    protected getObjectDataEntryNumericIdsField<Id extends ObjectDataEntryId & number>(
        field: string,
    ): Id[] {
        return dataToObjectDataEntryNumericIds(this.object.getField(field))
    }

    protected setObjectDataEntryNumericIdsField<Id extends ObjectDataEntryId & number>(
        field: string,
        values: Id[],
    ): void {
        this.object.setField(field, objectDataEntryNumericIdsToData(values))
    }

    protected getAttachmentPresetListField(
        modelPathListField: string,
        nodeFQNFields: string[],
    ): AttachmentPreset[] {
        const modelPaths = this.getStringsField(modelPathListField)
        return zip(modelPaths, nodeFQNFields, (modelPath, nodeFQNField) => {
            const [nodeName, nodeQualifiers] = splitAttachmentNodeFQN(
                this.getStringField(nodeFQNField),
            )
            return {
                modelPath: modelPath,
                nodeName: nodeName,
                nodeQualifiers: nodeQualifiers,
            } as AttachmentPreset
        })
    }

    protected setAttachmentPresetListField(
        modelPathListField: string,
        nodeFQNFields: string[],
        lengthField: string,
        attachmentPresets: AttachmentPresetInput[],
    ): void {
        this.setStringsField(
            modelPathListField,
            map(attachmentPresets, extractAttachmentPresetInputModelPath),
        )
        for (const i of $range(0, nodeFQNFields.length - 1)) {
            this.setStringField(
                nodeFQNFields[i],
                extractAttachmentPresetInputNodeFQN(attachmentPresets[i]),
            )
        }
        this.setNumberField(lengthField, attachmentPresets.length)
    }

    protected setFlagLevelFieldValue(
        fieldId: string,
        flag: 1 | 2 | 4 | 8 | 16,
        supplier: ObjectDataEntryLevelFieldValueSupplier<boolean>,
    ): void {
        this.setNumberLevelField(fieldId, (level, currentValue) => {
            const value = extractObjectDataEntryLevelFieldValue(
                supplier,
                level,
                (currentValue & flag) != 0,
            )
            return (currentValue & ~flag) | (value ? flag : 0)
        })
    }

    protected getFlagLevelFieldValue(fieldId: string, flag: 1 | 2 | 4 | 8 | 16): boolean[] {
        return this.getNumberLevelField(fieldId).map((value) => (value & flag) != 0)
    }

    protected getBooleanLevelField(field: string): boolean[] {
        return this.getLevelField(field, dataToBoolean)
    }

    protected setBooleanLevelField(
        field: string,
        values: ObjectDataEntryLevelFieldValueSupplier<boolean>,
    ): void {
        this.setLevelField(
            field,
            values,
            extractObjectDataEntryLevelFieldValue,
            dataToBoolean,
            booleanToData,
        )
    }

    protected getNumberLevelField(field: string): number[] {
        return this.getLevelField(field, dataToNumber)
    }

    protected setNumberLevelField(
        field: string,
        values: ObjectDataEntryLevelFieldValueSupplier<number>,
    ): void {
        this.setLevelField(
            field,
            values,
            extractObjectDataEntryLevelFieldValue,
            dataToNumber,
            numberToData,
        )
    }

    protected getStringLevelField(field: string): string[] {
        return this.getLevelField(field, dataToString)
    }

    protected setStringLevelField(
        field: string,
        values: ObjectDataEntryLevelFieldValueSupplier<string>,
    ): void {
        this.setLevelField(
            field,
            values,
            extractObjectDataEntryLevelFieldValue,
            dataToString,
            stringToData,
        )
    }

    protected getObjectDataEntryNumericIdLevelField<Id extends ObjectDataEntryId & number>(
        field: string,
    ): Id[] {
        return this.getLevelField(field, dataToObjectDataEntryNumericId<Id>)
    }

    protected setObjectDataEntryNumericIdLevelField<Id extends ObjectDataEntryId & number>(
        field: string,
        values: ObjectDataEntryLevelFieldValueSupplier<Id>,
    ): void {
        this.setLevelField(
            field,
            values,
            extractObjectDataEntryLevelFieldValue,
            dataToObjectDataEntryNumericId,
            objectDataEntryNumericIdToData,
        )
    }

    protected getBooleansLevelField(field: string): boolean[][] {
        return this.getLevelField(field, dataToBooleans)
    }

    protected setBooleansLevelField(
        field: string,
        values: ObjectDataEntryLevelFieldValueSupplier<boolean[]>,
    ): void {
        this.setLevelField(
            field,
            values,
            extractObjectDataEntryLevelArrayFieldValue,
            dataToBooleans,
            booleansToData,
        )
    }

    protected getNumbersLevelField(field: string): number[][] {
        return this.getLevelField(field, dataToNumbers)
    }

    protected setNumbersLevelField(
        field: string,
        values: ObjectDataEntryLevelFieldValueSupplier<number[]>,
    ): void {
        this.setLevelField(
            field,
            values,
            extractObjectDataEntryLevelArrayFieldValue,
            dataToNumbers,
            numbersToData,
        )
    }

    protected getStringsLevelField(field: string): string[][] {
        return this.getLevelField(field, dataToStrings)
    }

    protected setStringsLevelField(
        field: string,
        values: ObjectDataEntryLevelFieldValueSupplier<string[]>,
    ): void {
        this.setLevelField(
            field,
            values,
            extractObjectDataEntryLevelArrayFieldValue,
            dataToStrings,
            stringsToData,
        )
    }

    protected getObjectDataEntryNumericIdsLevelField<T extends ObjectDataEntryId & number>(
        field: string,
    ): T[][] {
        return this.getLevelField(field, dataToObjectDataEntryNumericIds<T>)
    }

    protected setObjectDataEntryNumericIdsLevelField<T extends ObjectDataEntryId & number>(
        field: string,
        values: ObjectDataEntryLevelFieldValueSupplier<T[]>,
    ): void {
        this.setLevelField(
            field,
            values,
            extractObjectDataEntryLevelArrayFieldValue,
            dataToObjectDataEntryNumericIds<T>,
            objectDataEntryNumericIdsToData<T>,
        )
    }

    private getLevelField<T>(
        field: string,
        dataToValue: (data: string | number | undefined, idType: "number" | "string") => T,
    ): T[] {
        const values: T[] = []
        const object = this.object
        for (const level of $range(1, tonumber(object.getField("levels")) ?? 1)) {
            values[level - 1] = dataToValue(object.getField(`${field}+${level}`), "number")
        }
        return values
    }

    private setLevelField<T extends string | number | boolean | undefined | Record<string, any>>(
        field: string,
        supplier: ObjectDataEntryLevelFieldValueSupplier<T>,
        extractor: (
            supplier: ObjectDataEntryLevelFieldValueSupplier<T>,
            level: number,
            value: T,
        ) => T,
        dataToValue: (data: string | number | undefined) => T,
        valueToData: (value: T) => string | number,
    ): void {
        const levelFieldParameters: LevelFieldParameters<T> = {
            supplier,
            extractor,
            dataToValue,
            valueToData,
        }
        if (typeof supplier == "function") {
            const previousLevelFieldParameters = this.levelFieldParametersByField.get(field)
            if (previousLevelFieldParameters != undefined) {
                const previousSupplier = previousLevelFieldParameters.supplier
                levelFieldParameters.supplier = (level, currentValue) => {
                    return supplier(level, extractor(previousSupplier, level, currentValue))
                }
                levelFieldParameters.dataToValue = previousLevelFieldParameters.dataToValue
            }
        }
        this.levelFieldParametersByField.set(field, levelFieldParameters)

        const object = this.object

        const maxAffectedLevel = max(
            this.maxAffectedLevelByField.get(field) ?? 0,
            tonumber(object.getField("levels")) ?? tonumber(object.getField("maxlevel")) ?? 0,
        )
        this.maxAffectedLevelByField.set(field, maxAffectedLevel)

        for (const level of $range(1, maxAffectedLevel)) {
            const value = extractor(
                supplier,
                level - 1,
                dataToValue(object.getField(`${field}+${level}`)),
            )
            object.setField(`${field}+${level}`, valueToData(value))
        }
    }
}

// Converters

const booleanToData = (value: boolean): number => {
    return value ? 1 : 0
}

const dataToBoolean = (data: number | string | undefined): boolean => {
    return (tonumber(data) ?? 0) == 1
}

const numberToData = (value: number): number => {
    return value
}

const dataToNumber = (data: number | string | undefined): number => {
    return tonumber(data) ?? 0
}

const stringToData = (value: string): string => {
    return value
}

const dataToString = (data: number | string | undefined): string => {
    return tostring(data ?? "")
}

const objectDataEntryNumericIdToData = (value: number): string => {
    return value == 0 ? "" : string.pack(">I4", value)
}

const dataToObjectDataEntryNumericId = <Id extends ObjectDataEntryId & number>(
    data: number | string | undefined,
): Id => {
    const dataString = dataToString(data)
    if (isDataNotBlank(dataString)) {
        return string.unpack(">I4", dataString)[0]
    } else {
        return 0 as Id
    }
}

const objectDataEntryIdToData = (value: number | string): string => {
    return typeof value == "number" ? objectDataEntryNumericIdToData(value) : value
}

const dataToObjectDataEntryId = <Id extends ObjectDataEntryId>(
    data: number | string | undefined,
    type: "number" | "string",
): Id => {
    if (type == "number") {
        return dataToObjectDataEntryNumericId(data) as Id
    }
    return dataToString(data) as Id
}

const booleansToData = (value: boolean[]): string => {
    return value.map((boolean) => booleanToData(boolean)).join(",")
}

const dataToBooleans = (data: number | string | undefined): boolean[] => {
    return dataToString(data)
        .split(",")
        .filter(isDataNotBlank)
        .map((data) => dataToBoolean(data))
}

const numbersToData = (value: number[]): string => {
    return value.map((number) => numberToData(number)).join(",")
}

const dataToNumbers = (data: number | string | undefined): number[] => {
    return dataToString(data)
        .split(",")
        .filter(isDataNotBlank)
        .map((data) => dataToNumber(data))
}

const stringsToData = (value: string[]): string => {
    return value.map((string) => stringToData(string)).join(",")
}

const dataToStrings = (data: number | string | undefined): string[] => {
    return dataToString(data)
        .split(",")
        .filter(isDataNotBlank)
        .map((data) => dataToString(data))
}

const objectDataEntryNumericIdsToData = <T extends ObjectDataEntryId & number>(
    value: T[],
): string => {
    return value
        .map((objectDataEntryId) => objectDataEntryNumericIdToData(objectDataEntryId))
        .join(",")
}

const dataToObjectDataEntryNumericIds = <T extends ObjectDataEntryId & number>(
    data: number | string | undefined,
): T[] => {
    return dataToString(data)
        .split(",")
        .filter(isDataNotBlank)
        .map((data) => dataToObjectDataEntryNumericId<T>(data))
}

const isDataNotBlank = function (this: any, data: string): boolean {
    return data.isNotBlank() && data != "_"
}
