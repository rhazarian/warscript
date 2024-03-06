const unpack = string.unpack

export class BinaryReader {
    private readonly s: string
    private i = 1

    constructor(data: string) {
        this.s = data
    }

    public read(fmt: string): any {
        const [value, pos] = unpack(`>${fmt}`, this.s, this.i)
        this.i = pos
        return value
    }

    public readBytes(size: number): string {
        return this.read(`c${size}`)
    }

    public readDouble(): number {
        return this.read("d")
    }

    public readFloat(): number {
        return this.read("f")
    }

    public readInt16(): number {
        return this.read("h")
    }

    public readInt32(): number {
        return this.read("i4")
    }

    public readInt8(): number {
        return this.read("b")
    }

    public readString(): string {
        return this.read("z")
    }

    public readUInt16(): number {
        return this.read("H")
    }

    public readUInt32(): number {
        return this.read("I4")
    }

    public readUInt8(): number {
        return this.read("B")
    }

    public readObject<T>(clazz: { deserialize(reader: BinaryReader): T }): T {
        return clazz.deserialize(this)
    }
}
