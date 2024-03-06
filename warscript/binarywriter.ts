const pack = string.pack
const concat = table.concat
const unpack = table.unpack

export class BinaryWriter {
    private readonly v: (string | number)[] = []
    private readonly f: string[] = [">"]

    private i = 1

    public toString(): string {
        return pack(concat(this.f), ...unpack(this.v, 2, this.i))
    }

    public write(fmt: string, value: number): void {
        const i = this.i + 1
        this.f[i - 1] = fmt
        this.v[i - 1] = value
        this.i = i
    }

    public writeBytes(value: string): void {
        const i = this.i + 1
        this.f[i - 1] = `c${value.length}`
        this.v[i - 1] = value
        this.i = i
    }

    public writeDouble(value: number): void {
        const i = this.i + 1
        this.f[i - 1] = "d"
        this.v[i - 1] = value
        this.i = i
    }

    public writeFloat(value: number): void {
        const i = this.i + 1
        this.f[i - 1] = "f"
        this.v[i - 1] = value
        this.i = i
    }

    public writeInt16(value: number): void {
        const i = this.i + 1
        this.f[i - 1] = "h"
        this.v[i - 1] = value
        this.i = i
    }

    public writeInt32(value: number): void {
        const i = this.i + 1
        this.f[i - 1] = "i4"
        this.v[i - 1] = value
        this.i = i
    }

    public writeInt8(value: number): void {
        const i = this.i + 1
        this.f[i - 1] = "b"
        this.v[i - 1] = value
        this.i = i
    }

    public writeString(value: string): void {
        const i = this.i + 1
        this.f[i - 1] = "z"
        this.v[i - 1] = value
        this.i = i
    }

    public writeUInt16(value: number): void {
        const i = this.i + 1
        this.f[i - 1] = "H"
        this.v[i - 1] = value
        this.i = i
    }

    public writeUInt32(value: number): void {
        const i = this.i + 1
        this.f[i - 1] = "I4"
        this.v[i - 1] = value
        this.i = i
    }

    public writeUInt8(value: number): void {
        const i = this.i + 1
        this.f[i - 1] = "B"
        this.v[i - 1] = value
        this.i = i
    }

    public writeObject<T>(value: { serialize(writer: BinaryWriter): T }): T {
        return value.serialize(this)
    }
}
