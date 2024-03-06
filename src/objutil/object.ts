import * as idgen from "./idgen"

export type LevelFieldValueProvider<T> = T | T[] | ((level: number, value: T) => T)

export namespace ObjectDefinition {
    export type TargetType =
        | "air"
        | "alive"
        | "allies"
        | "ancient"
        | "dead"
        | "debris"
        | "decoration"
        | "enemies"
        | "friend"
        | "ground"
        | "hero"
        | "invulnerable"
        | "item"
        | "mechanical"
        | "neutral"
        | "nonancient"
        | "none"
        | "nonhero"
        | "nonsapper"
        | "notself"
        | "organic"
        | "player"
        | "sapper"
        | "self"
        | "structure"
        | "terrain"
        | "tree"
        | "vulnerable"
        | "wall"
        | "ward"
}

export class ObjectDefinition {
    protected constructor(protected readonly object: WarObject) {}

    protected setBooleanField(field: string, value: boolean): void {
        this.object.setField(field, value ? 1 : 0)
    }

    protected getBooleanField(field: string): boolean {
        return (tonumber(this.object.getField(field) ?? 0) ?? 0) != 0
    }

    protected setNumberField(field: string, value: number): void {
        this.object.setField(field, value)
    }

    protected getNumberField(field: string): number {
        return tonumber(this.object.getField(field) ?? 0) ?? 0
    }

    protected setStringField(field: string, value: string): void {
        this.object.setField(field, value)
    }

    protected getStringField(field: string): string {
        return tostring(this.object.getField(field) ?? "")
    }

    protected getStringListField(field: string): string[] {
        const value = this.getStringField(field)
        return value == "" || value == "_" ? [] : value.split(",")
    }

    protected setBooleanLevelField(
        field: string,
        values: boolean | boolean[] | ((level: number, value: boolean) => boolean)
    ): void {
        this.setLevelField(
            field,
            Array.isArray(values)
                ? values.map((value) => (value ? 1 : 0))
                : (level, value) => {
                      return typeof values == "function"
                          ? values(level, (tonumber(value ?? 0) ?? 0) != 0)
                              ? 1
                              : 0
                          : values
                          ? 1
                          : 0
                  }
        )
    }

    protected getBooleanLevelField(field: string): boolean[] {
        return this.getLevelField(field).map((value) => (tonumber(value) ?? 0) != 0)
    }

    protected setNumberLevelField(
        field: string,
        values: number | number[] | ((level: number, value: number) => number)
    ): void {
        this.setLevelField(
            field,
            Array.isArray(values)
                ? values
                : (level, value) => {
                      return typeof values == "function"
                          ? values(level, tonumber(value ?? 0) ?? 0)
                          : values
                  }
        )
    }

    protected getNumberLevelField(field: string): number[] {
        return this.getLevelField(field).map((value) => tonumber(value) ?? 0)
    }

    protected setStringLevelField(
        field: string,
        values: string | string[] | ((level: number, value: string) => string)
    ): void {
        this.setLevelField(
            field,
            Array.isArray(values)
                ? values
                : (level, value) => {
                      return typeof values == "function"
                          ? values(level, tostring(value ?? ""))
                          : values
                  }
        )
    }

    protected getStringLevelField(field: string): string[] {
        return this.getLevelField(field).map((value) => tostring(value))
    }

    protected getStringListLevelField(field: string): string[][] {
        return this.getLevelField(field)
            .map((value) => tostring(value))
            .map((value) => {
                if (value == "" || value == "_") {
                    return []
                }
                return value.split(",")
            })
    }

    private getLevelField(field: string): (string | number)[] {
        const values: (string | number)[] = []
        const object = this.object
        for (const level of $range(1, tonumber(object.getField("levels")) ?? 1)) {
            values[level - 1] = object.getField(`${field}+${level}`) ?? ""
        }
        return values
    }

    private setLevelField(
        field: string,
        values:
            | (string | number | undefined)[]
            | ((level: number, value: string | number | undefined) => string | number | undefined)
            | string
            | number
            | undefined
    ): void {
        const object = this.object
        for (const level of $range(
            1,
            tonumber(object.getField("levels")) ?? tonumber(object.getField("maxlevel")) ?? 0
        )) {
            const value = ObjectDefinition.getLevelFieldValue<string | number | undefined>(
                level - 1,
                object.getField(`${field}+${level}`),
                values
            )
            object.setField(`${field}+${level}`, value)
        }
    }

    protected static getLevelFieldValue<
        T extends ObjectDefinition | string | number | boolean | undefined
    >(level: number, value: T, values: LevelFieldValueProvider<T>): T {
        return Array.isArray(values)
            ? values[level]
            : typeof values == "function"
            ? values(level, value)
            : values
    }

    protected static getLevelArrayFieldValue<
        T extends ObjectDefinition | string | number | boolean | undefined
    >(level: number, value: T[], values: LevelFieldValueProvider<T[]>): T[] {
        return typeof values == "function"
            ? values(level, value)
            : Array.isArray(values[0])
            ? values[0]
            : (values as T[])
    }
}

interface ObjectConstructor {
    [index: string]: string | number | undefined
}

export enum ObjectType {
    ABILITY,
    ITEM,
    UNIT,
    DESTRUCTABLE,
    DOODAD,
    BUFF,
    UPGRADE,
}

type ObjectTypeEnum = typeof ObjectType

const map: {
    [objectType: number]: {
        getObjects: (objects: WarMapObjects) => WarObjects
        idgen: () => string
    }
} = {
    [ObjectType.ABILITY]: {
        getObjects: (objects) => objects.ability,
        idgen: idgen.ability,
    },
    [ObjectType.ITEM]: {
        getObjects: (objects) => objects.item,
        idgen: idgen.item,
    },
    [ObjectType.UNIT]: {
        getObjects: (objects) => objects.unit,
        idgen: idgen.unit,
    },
    [ObjectType.DESTRUCTABLE]: {
        getObjects: (objects) => objects.destructable,
        idgen: idgen.destructable,
    },
    [ObjectType.DOODAD]: {
        getObjects: (objects) => objects.doodad,
        idgen: idgen.doodad,
    },
    [ObjectType.BUFF]: {
        getObjects: (objects) => objects.buff,
        idgen: idgen.buff,
    },
    [ObjectType.UPGRADE]: {
        getObjects: (objects) => objects.upgrade,
        idgen: idgen.upgrade,
    },
}

export function createObject(
    objectType: ObjectType,
    newId: string,
    base: string,
    ctor?: ObjectConstructor
): WarObject

export function createObject(
    objectType: ObjectType,
    base: string,
    ctor?: ObjectConstructor
): WarObject

export function createObject(
    objectType: ObjectType,
    newIdOrBase: string,
    baseOrCtor?: string | ObjectConstructor,
    ctor?: ObjectConstructor
): WarObject {
    if (typeof baseOrCtor == "string") {
        return createObjectImpl(objectType, newIdOrBase, baseOrCtor, ctor ?? {})
    } else {
        return createObjectImpl(objectType, map[objectType].idgen(), newIdOrBase, baseOrCtor ?? {})
    }
}

function createObjectImpl(
    objectType: ObjectType,
    newId: string,
    base: string,
    ctor: ObjectConstructor
): WarObject {
    if (!currentMap) {
        error("objects can only be created when a map is active")
    }

    const objects = map[objectType].getObjects(currentMap.objects)

    const object = objects.newObject(newId, base)

    for (const [field, value] of pairs(ctor)) {
        object.setField(field as string, value)
    }

    return object
}
