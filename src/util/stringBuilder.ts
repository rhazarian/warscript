const tostring = _G.tostring
const concat = table.concat

export class StringBuilder {
    private readonly s: string[] = []
    private i = 0

    public append<T>(v: T): StringBuilder {
        const i = this.i + 1
        this.s[i - 1] = tostring(v)
        this.i = i
        return this
    }

    public clear(): void {
        this.i = 0
    }

    public toString(): string {
        return concat(this.s, "", 1, this.i)
    }
}
