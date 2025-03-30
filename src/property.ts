import { BinaryReader } from "./binaryreader"
import { BinaryWriter } from "./binarywriter"
import { Player } from "./core/types/player"
import { Timer } from "./core/types/timer"
import { Event } from "./event"
import * as file from "./file"
import { synchronize } from "./network"
import * as base64 from "./utility/base64"
import * as lzw from "./utility/lzw"
import { require } from "./utility/preconditions"

const invoke = Event.invoke

export class PersistentPropertiesConfig {
    public static defaultFileName: string = ""
}

const enum PropertyPropertyKey {
    DEFAULT_VALUE,
    VALUE,
    IS_CHANGED,
}

export class Property<T> {
    public readonly valueChangeEvent = new Event<[newValue: T, oldValue: T]>()

    private [PropertyPropertyKey.DEFAULT_VALUE]: T
    private [PropertyPropertyKey.VALUE]: T
    private [PropertyPropertyKey.IS_CHANGED]?: true

    public constructor(defaultValue: T) {
        this[PropertyPropertyKey.DEFAULT_VALUE] = defaultValue
        this[PropertyPropertyKey.VALUE] = defaultValue
    }

    public get defaultValue(): T {
        return this[PropertyPropertyKey.DEFAULT_VALUE]
    }

    public set defaultValue(defaultValue: T) {
        const oldDefaultValue = this[PropertyPropertyKey.DEFAULT_VALUE]
        if (defaultValue != oldDefaultValue) {
            this[PropertyPropertyKey.DEFAULT_VALUE] = defaultValue
            if (!this[PropertyPropertyKey.IS_CHANGED]) {
                this[PropertyPropertyKey.VALUE] = defaultValue
                invoke(this.valueChangeEvent, defaultValue, oldDefaultValue)
            }
        }
    }

    public get value(): T {
        return this.get()
    }

    public set value(value: T) {
        this.set(value)
    }

    public get isChanged(): boolean {
        return this[PropertyPropertyKey.IS_CHANGED] == true
    }

    public reset(): boolean {
        if (this[PropertyPropertyKey.IS_CHANGED]) {
            this[PropertyPropertyKey.IS_CHANGED] = undefined

            const defaultValue = this[PropertyPropertyKey.DEFAULT_VALUE]
            const oldValue = this[PropertyPropertyKey.VALUE]

            if (defaultValue != oldValue) {
                this[PropertyPropertyKey.VALUE] = defaultValue
                invoke(this.valueChangeEvent, defaultValue, oldValue)
            }

            return true
        }
        return false
    }

    public set(value: T): boolean {
        this[PropertyPropertyKey.IS_CHANGED] = true
        const oldValue = this[PropertyPropertyKey.VALUE]
        this[PropertyPropertyKey.VALUE] = value
        if (value != oldValue) {
            invoke(this.valueChangeEvent, value, oldValue)
            return true
        }
        return false
    }

    public get(): T {
        return this[PropertyPropertyKey.VALUE]
    }
}

const enum PlayerPropertyPropertyKey {
    DEFAULT_VALUE,
    VALUE_BY_PLAYER,
    IS_CHANGED_BY_PLAYER,
}

export class PlayerProperty<T> {
    public readonly valueChangeEvent = new Event<[player: Player, newValue: T, oldValue: T]>()

    private readonly [PlayerPropertyPropertyKey.DEFAULT_VALUE]: T
    private readonly [PlayerPropertyPropertyKey.VALUE_BY_PLAYER]: LuaMap<Player, T>
    private readonly [PlayerPropertyPropertyKey.IS_CHANGED_BY_PLAYER]: LuaSet<Player>

    public constructor(defaultValue: T) {
        this[PlayerPropertyPropertyKey.DEFAULT_VALUE] = defaultValue
        this[PlayerPropertyPropertyKey.VALUE_BY_PLAYER] = new LuaMap<Player, T>()
        this[PlayerPropertyPropertyKey.IS_CHANGED_BY_PLAYER] = new LuaSet()
    }

    public isChanged(player: Player): boolean {
        return this[PlayerPropertyPropertyKey.IS_CHANGED_BY_PLAYER].has(player)
    }

    public reset(player: Player): boolean {
        if (this[PlayerPropertyPropertyKey.IS_CHANGED_BY_PLAYER].has(player)) {
            this[PlayerPropertyPropertyKey.IS_CHANGED_BY_PLAYER].delete(player)

            const initialValue = this[PlayerPropertyPropertyKey.DEFAULT_VALUE]
            const oldValue = this[PlayerPropertyPropertyKey.VALUE_BY_PLAYER].get(player) as T

            this[PlayerPropertyPropertyKey.VALUE_BY_PLAYER].delete(player)
            if (initialValue != oldValue) {
                invoke(this.valueChangeEvent, player, initialValue, oldValue)
            }

            return true
        }
        return false
    }

    public set(player: Player, value: T): boolean {
        this[PlayerPropertyPropertyKey.IS_CHANGED_BY_PLAYER].add(player)
        const oldValue = this[PlayerPropertyPropertyKey.VALUE_BY_PLAYER].get(player)
        this[PlayerPropertyPropertyKey.VALUE_BY_PLAYER].set(player, value)
        if (value != oldValue) {
            invoke(this.valueChangeEvent, player, value, oldValue)
            return true
        }
        return false
    }

    public get(player: Player): T {
        return this[PlayerPropertyPropertyKey.IS_CHANGED_BY_PLAYER].has(player)
            ? (this[PlayerPropertyPropertyKey.VALUE_BY_PLAYER].get(player) as T)
            : this[PlayerPropertyPropertyKey.DEFAULT_VALUE]
    }
}

// Persistent properties.

const NULL_VALUE = {} as NULL_VALUE
type NULL_VALUE = { readonly __nullValue: unique symbol }

let loadedValueById: LuaMap<number, NULL_VALUE | boolean | number | string> | undefined

const loadedValueByIdByPlayer = new LuaMap<
    Player,
    LuaMap<number, NULL_VALUE | boolean | number | string>
>()

const localValueById = new LuaMap<number, NULL_VALUE | boolean | number | string>()

const persistentPropertyById = new LuaMap<number, PersistentProperty<any>>()

const persistentPlayerPropertyById = new LuaMap<number, PersistentPlayerProperty<any>>()

export class PersistentProperty<
    T extends undefined | boolean | number | string,
> extends Property<T> {
    public constructor(
        public readonly id: number,
        defaultValue: T,
        valueChangeEventListener?: (newValue: T, oldValue: T) => void,
    ) {
        super(defaultValue)
        require(!persistentPropertyById.has(id) && !persistentPlayerPropertyById.has(id))
        persistentPropertyById.set(id, this)
        if (valueChangeEventListener != undefined) {
            this.valueChangeEvent.addListener(valueChangeEventListener)
        }

        const value = loadedValueById?.get(id)
        if (value != undefined) {
            this.set((value == NULL_VALUE ? undefined : value) as any)
        }
    }

    public override reset(): boolean {
        if (super.reset()) {
            localValueById.delete(this.id)
            savePropertyValues()
            return true
        }
        return false
    }

    public override set(value: T): boolean {
        if (super.set(value)) {
            localValueById.set(this.id, value == undefined ? NULL_VALUE : value)
            savePropertyValues()
            return true
        }
        return false
    }
}

export class PersistentPlayerProperty<
    T extends string | number | boolean,
> extends PlayerProperty<T> {
    public constructor(
        public readonly id: number,
        initialValue: T,
        valueChangeEventListener?: (player: Player, newValue: T, oldValue: T) => void,
    ) {
        super(initialValue)
        require(!persistentPropertyById.has(id) && !persistentPlayerPropertyById.has(id))
        persistentPlayerPropertyById.set(id, this)
        if (valueChangeEventListener != undefined) {
            this.valueChangeEvent.addListener(valueChangeEventListener)
        }

        for (const player of Player.all) {
            const value = loadedValueByIdByPlayer?.get(player)?.get(id)
            if (value != undefined) {
                this.set(player, (value == NULL_VALUE ? undefined : value) as any)
            }
        }
    }

    public override reset(player: Player): boolean {
        if (super.reset(player)) {
            if (player.isLocal) {
                localValueById.delete(this.id)
            }
            savePropertyValues(player)
            return true
        }
        return false
    }

    public override set(player: Player, value: T): boolean {
        if (super.set(player, value)) {
            if (player.isLocal) {
                localValueById.set(this.id, value)
            }
            savePropertyValues(player)
            return true
        }
        return false
    }
}

const enum DataType {
    NULL,
    FALSE,
    TRUE,
    INTEGER,
    FLOAT,
    STRING,
}

const savePropertyValues = (player?: Player): void => {
    if (
        (player != undefined && !player.isLocal) ||
        loadedValueById == undefined ||
        loadedValueByIdByPlayer.get(Player.local) == undefined
    ) {
        return
    }

    const writer = new BinaryWriter()
    writer.writeUInt32(0) // Write format version.
    let size = 0
    for (const [,] of localValueById) {
        ++size
    }
    writer.writeUInt32(size)
    for (const [id, value] of localValueById) {
        writer.writeInt32(id)
        if (value == NULL_VALUE) {
            writer.writeUInt8(DataType.NULL)
        } else if (value == false) {
            writer.writeUInt8(DataType.FALSE)
        } else if (value == true) {
            writer.writeUInt8(DataType.TRUE)
        } else if (typeof value == "number") {
            if (math.type(value) == "integer") {
                writer.writeUInt8(DataType.INTEGER)
                writer.writeInt32(value)
            } else {
                writer.writeUInt8(DataType.FLOAT)
                writer.writeFloat(value)
            }
        } else {
            writer.writeUInt8(DataType.STRING)
            writer.writeUInt32((value as string).length)
            writer.writeBytes(value as string)
        }
    }
    file.write(PersistentPropertiesConfig.defaultFileName, base64.encode(lzw.compress(writer.toString())))
}

const loadPropertyValues = (
    fileData: string,
    player?: Player,
): LuaMap<number, NULL_VALUE | boolean | number | string> => {
    try {
        const valueById = new LuaMap<number, NULL_VALUE | boolean | number | string>()
        const reader = new BinaryReader(lzw.decompress(base64.decode(fileData)))
        reader.readUInt32() // Read format version (unused).
        const size = reader.readUInt32()
        for (const _ of $range(1, size)) {
            const id = reader.readInt32()
            const dataType = reader.readUInt8()
            if (dataType == DataType.NULL) {
                valueById.set(id, NULL_VALUE)
            } else if (dataType == DataType.FALSE) {
                valueById.set(id, false)
            } else if (dataType == DataType.TRUE) {
                valueById.set(id, true)
            } else if (dataType == DataType.INTEGER) {
                valueById.set(id, reader.readInt32())
            } else if (dataType == DataType.FLOAT) {
                valueById.set(id, reader.readFloat())
            } else if (dataType == DataType.STRING) {
                valueById.set(id, reader.readBytes(reader.readUInt32()))
            }
        }
        for (const [id, value] of valueById) {
            const persistentProperty = persistentPropertyById.get(id)
            if (persistentProperty != undefined) {
                if (!persistentProperty.isChanged) {
                    persistentProperty.set(value == NULL_VALUE ? undefined : value)
                }
            } else if (player != undefined) {
                const persistentPlayerProperty = persistentPlayerPropertyById.get(id)
                if (persistentPlayerProperty != undefined) {
                    if (!persistentPlayerProperty.isChanged(player)) {
                        persistentPlayerProperty.set(
                            player,
                            value == NULL_VALUE ? undefined : value,
                        )
                    }
                } else if (player.isLocal) {
                    localValueById.set(id, value)
                }
            } else {
                localValueById.set(id, value)
            }
        }
        return valueById
    } catch (_) {
        return new LuaMap()
    }
}

Timer.run(() => {
    const data = file.read(PersistentPropertiesConfig.defaultFileName) ?? ""
    loadedValueById = loadPropertyValues(data)
    for (const player of Player.all) {
        synchronize(player, data).then(
            (synchronizedData) => {
                loadedValueByIdByPlayer.set(player, loadPropertyValues(synchronizedData, player))
                savePropertyValues(player)
            },
            () => {
                loadedValueByIdByPlayer.set(player, new LuaMap())
                savePropertyValues(player)
            },
        )
    }
})
