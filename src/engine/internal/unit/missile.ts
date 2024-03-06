import { Unit } from "../unit"
import { MISSILE_DATA_BY_UNIT_TYPE_ID } from "../unit-missile-data"

const getUnitFlyHeight = GetUnitFlyHeight
const getUnitX = GetUnitX
const getUnitY = GetUnitY
const getUnitZ = BlzGetUnitZ

declare module "../unit" {
    interface Unit {
        readonly missileLaunchOffsetX: number
    }
}
Object.defineProperty(Unit.prototype, "missileLaunchOffsetX", {
    get(this: Unit): number {
        return MISSILE_DATA_BY_UNIT_TYPE_ID.get(this.typeId).launchOffsetX
    },
})

declare module "../unit" {
    interface Unit {
        readonly missileLaunchOffsetY: number
    }
}
Object.defineProperty(Unit.prototype, "missileLaunchOffsetY", {
    get(this: Unit): number {
        return MISSILE_DATA_BY_UNIT_TYPE_ID.get(this.typeId).launchOffsetY
    },
})

declare module "../unit" {
    interface Unit {
        readonly missileLaunchOffsetZ: number
    }
}
Object.defineProperty(Unit.prototype, "missileLaunchOffsetZ", {
    get(this: Unit): number {
        return MISSILE_DATA_BY_UNIT_TYPE_ID.get(this.typeId).launchOffsetZ
    },
})

declare module "../unit" {
    interface Unit {
        readonly missileImpactOffsetZ: number
    }
}
Object.defineProperty(Unit.prototype, "missileImpactOffsetZ", {
    get(this: Unit): number {
        return MISSILE_DATA_BY_UNIT_TYPE_ID.get(this.typeId).impactOffsetZ
    },
})

declare module "../unit" {
    interface Unit {
        readonly missileLaunchX: number
    }
}
Object.defineProperty(Unit.prototype, "missileLaunchX", {
    get(this: Unit): number {
        // TODO: fix, should use unit facing angle
        return getUnitX(this.handle) + MISSILE_DATA_BY_UNIT_TYPE_ID.get(this.typeId).launchOffsetX
    },
})

declare module "../unit" {
    interface Unit {
        readonly missileLaunchY: number
    }
}
Object.defineProperty(Unit.prototype, "missileLaunchY", {
    get(this: Unit): number {
        // TODO: fix, should use unit facing angle
        return getUnitY(this.handle) + MISSILE_DATA_BY_UNIT_TYPE_ID.get(this.typeId).launchOffsetY
    },
})

declare module "../unit" {
    interface Unit {
        readonly missileLaunchZ: number
    }
}
Object.defineProperty(Unit.prototype, "missileLaunchZ", {
    get(this: Unit): number {
        const handle = this.handle
        return (
            getUnitZ(handle) +
            getUnitFlyHeight(handle) +
            MISSILE_DATA_BY_UNIT_TYPE_ID.get(this.typeId).launchOffsetZ
        )
    },
})

declare module "../unit" {
    interface Unit {
        readonly missileImpactZ: number
    }
}
Object.defineProperty(Unit.prototype, "missileImpactZ", {
    get(this: Unit): number {
        const handle = this.handle
        return (
            getUnitZ(handle) +
            getUnitFlyHeight(handle) +
            MISSILE_DATA_BY_UNIT_TYPE_ID.get(this.typeId).impactOffsetZ
        )
    },
})
