import { AttributesHolder } from "../../attributes"

const getTerrainType = GetTerrainType
const setTerrainType = SetTerrainType
const getTerrainVariance = GetTerrainVariance

const abs = math.abs
const type = math.type
const ult = math.ult

const tileCellById: Record<number, TileCell | undefined> = {}

export class TileCell extends AttributesHolder implements Readonly<Vec2> {
    protected constructor(
        private readonly id: number,
        public readonly x: number,
        public readonly y: number,
        public readonly z: undefined,
    ) {
        super()
        tileCellById[id] = this
    }

    public get up(): TileCell {
        return TileCell.of(this.x, this.y + 128)
    }

    public get down(): TileCell {
        return TileCell.of(this.x, this.y - 128)
    }

    public get left(): TileCell {
        return TileCell.of(this.x - 128, this.y)
    }

    public get right(): TileCell {
        return TileCell.of(this.x + 128, this.y)
    }

    public get terrainTypeId(): number {
        return getTerrainType(this.x, this.y)
    }

    public set terrainTypeId(terrainTypeId: number) {
        const x = this.x
        const y = this.y
        setTerrainType(x, y, terrainTypeId, getTerrainVariance(x, y), 1, 1)
    }

    public get terrainVariance(): number {
        return getTerrainVariance(this.x, this.y)
    }

    public set terrainVariance(terrainVariance: number) {
        const x = this.x
        const y = this.y
        setTerrainType(x, y, getTerrainType(x, y), terrainVariance, 1, 1)
    }

    public randomizeTerrainVariance(): void {
        const x = this.x
        const y = this.y
        setTerrainType(x, y, getTerrainType(x, y), -1, 1, 1)
    }

    public isInRangeOf(x: number, y: number, range: number): boolean
    public isInRangeOf(tileCell: TileCell, range: number): boolean

    public isInRangeOf(x: number | TileCell, y: number, range?: number): boolean {
        if (range == undefined) {
            range = y
            y = (x as TileCell).y
            x = (x as TileCell).x
        }
        const dx = this.x - (x as number)
        const dy = this.y - y
        if (type(dx) == "float" || type(dy) == "float" || type(range) == "float") {
            return dx.toFloat() * dx + dy.toFloat() * dy <= range.toFloat() * range
        }
        // Combat integer overflow that can happen during multiplication.
        return abs(dx) <= range && abs(dy) <= range && !ult(range * range, dx * dx + dy * dy)
    }

    public static getInRect(minX: number, minY: number, maxX: number, maxY: number): TileCell[] {
        const minXId = math.idiv(minX + 64, 128)
        minX = minXId * 128
        maxX = math.idiv(maxX + 64, 128) * 128
        const minYId = math.idiv(minY + 64, 128)
        let yId = minYId * 32768
        const tiles: TileCell[] = []
        let i = 1
        for (const y of $range(minYId * 128, math.idiv(maxY + 64, 128) * 128, 128)) {
            let xId = minXId
            for (const x of $range(minX, maxX, 128)) {
                tiles[i - 1] = tileCellById[yId + xId] ?? new TileCell(yId + xId, x, y, undefined)
                ++i
                ++xId
            }
            yId += 32768
        }
        return tiles
    }

    public static getInRange(x: number, y: number, range: number): TileCell[] {
        const minXId = math.idiv(x - range + 64, 128)
        const minX = minXId * 128
        const maxX = math.idiv(x + range + 64, 128) * 128
        const rangeSq = range * range
        const tiles: TileCell[] = []
        let i = 1
        const minYId = math.idiv(y - range + 64, 128)
        let yId = minYId * 32768
        for (const cellY of $range(minYId * 128, math.idiv(y + range + 64, 128) * 128, 128)) {
            const dy = cellY - y
            const dySq = dy * dy
            let xId = minXId
            for (const cellX of $range(minX, maxX, 128)) {
                const dx = cellX - x
                if (dx * dx + dySq <= rangeSq) {
                    tiles[i - 1] =
                        tileCellById[yId + xId] ?? new TileCell(yId + xId, cellX, cellY, undefined)
                    ++i
                }
                ++xId
            }
            yId += 32768
        }
        return tiles
    }

    public static of(this: void, x: number, y: number): TileCell {
        const xId = math.idiv(x + 64, 128)
        const yId = math.idiv(y + 64, 128)
        const id = yId * 32768 + xId
        return tileCellById[id] ?? new TileCell(id, xId * 128, yId * 128, undefined)
    }
}
