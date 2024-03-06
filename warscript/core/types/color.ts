const floor = math.floor
const min = math.min
const max = math.max
const format = string.format
const pack = string.pack

const cache: Record<string, Color | undefined> = {}

export class Color {
    private constructor(
        public readonly r: number,
        public readonly g: number,
        public readonly b: number,
        public readonly a: number,
        key: string
    ) {
        cache[key] = this
    }

    public static readonly white = Color.of(255, 255, 255, 255)
    public static readonly black = Color.of(0, 0, 0, 255)
    public static readonly gold = Color.of(255, 204, 0, 255)
    public static readonly silver = Color.of(195, 219, 255, 255)

    public toString(): string {
        return `color(${this.r}, ${this.g}, ${this.b}, ${this.a})`
    }

    public get hexCode(): string {
        const code = format("%02x%02x%02x%02x", this.a, this.r, this.g, this.b)
        rawset(this, "hexCode", code)
        return code
    }

    public static lerp(lhs: Color, rhs: Color, t: number): Color {
        return Color.of(
            lhs.r * (1 - t) + rhs.r * t,
            lhs.g * (1 - t) + rhs.g * t,
            lhs.b * (1 - t) + rhs.b * t,
            lhs.a * (1 - t) + rhs.a * t
        )
    }

    public static of(red: number, green: number, blue: number, alpha?: number): Color {
        red = max(0, min(floor(red + 0.5), 255))
        green = max(0, min(floor(green + 0.5), 255))
        blue = max(0, min(floor(blue + 0.5), 255))
        alpha = max(0, min(floor(alpha ?? 255 + 0.5), 255))
        const key = pack("=BBBB", red, green, blue, alpha)
        return cache[key] ?? new Color(red, green, blue, alpha, key)
    }
}
