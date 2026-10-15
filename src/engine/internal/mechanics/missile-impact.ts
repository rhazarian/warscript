import { Ability } from "../ability"
import { Unit } from "../unit"
import { internalAbilityImpactEvent } from "../unit/ability"
import { Timer } from "../../../core/types/timer"
import { EventListenerPriority } from "../../../event"

const safeCall = warpack.safeCall

/** What an on-missile-impact behavior does once the missile of its ability arrives. */
export type MissileImpactEffect = (this: void) => void

export type MissileImpact = {
    readonly caster: Unit
    readonly effects: MissileImpactEffect[]
}

/**
 * The impact a missile is currently being launched for, per ability. The impact handlers of one
 * cast all run in the same thread, so they all find the impact the first of them started, and an
 * ability with several on-missile-impact behaviors fires one missile instead of one each.
 *
 * Dropped as soon as that impact is through, so that the next one is a missile of its own even
 * when the same unit impacts with the same ability again in the same thread.
 */
const impactByAbility = new LuaMap<Ability, MissileImpact>()

const forgetImpact = (ability: Ability, impact?: MissileImpact): void => {
    if (impact == undefined || impactByAbility.get(ability) == impact) {
        impactByAbility.delete(ability)
    }
}

/**
 * How deep the internal impact event is being dispatched, which the public impact events of a
 * real impact are all derived from: one invocation of it is one impact, however many of them it
 * dispatches.
 */
let dispatchDepth = 0

internalAbilityImpactEvent.addListener(EventListenerPriority.HIGHEST_INTERNAL, () => {
    ++dispatchDepth
})

internalAbilityImpactEvent.addListener(
    EventListenerPriority.LOWEST_INTERNAL,
    (_caster, ability) => {
        --dispatchDepth
        forgetImpact(ability)
    },
)

// An impact event invoked on its own, outside the internal one, is an impact of its own as well:
// that is how an impact is emulated (see `EmulateImpactAbilityBehavior`), and two emulated
// impacts in one thread are two impacts. Inside a real impact it is part of that one, so the
// depth is what tells the two apart.
Unit.abilityImpactEvent.addListener(EventListenerPriority.LOWEST_INTERNAL, (_caster, ability) => {
    if (dispatchDepth == 0) {
        forgetImpact(ability)
    }
})

/**
 * Returns the impact of the ability the current cast is launching a missile for, creating it if
 * this is the first behavior to ask. The second return value tells the caller whether it is the
 * one that has to launch the missile.
 *
 * The zero timer is a fallback: it drops an impact that nothing else did, which is what an
 * impact event invoked outside both the internal event and `Unit.abilityImpactEvent` leaves
 * behind.
 * @internal For use by internal systems only.
 */
export const getMissileImpact = (
    ability: Ability,
    caster: Unit,
): LuaMultiReturn<[impact: MissileImpact, isLaunchRequired: boolean]> => {
    const impact = impactByAbility.get(ability)
    // An item ability can be used by another unit within the same thread; that is its own impact.
    if (impact != undefined && impact.caster == caster) {
        return $multi(impact, false)
    }
    const newImpact: MissileImpact = { caster, effects: [] }
    impactByAbility.set(ability, newImpact)
    Timer.run(forgetImpact, ability, newImpact)
    return $multi(newImpact, true)
}

/**
 * Applies the effects of the impact, in the order their behaviors were asked for them. One
 * failing effect does not keep the others from being applied.
 * @internal For use by internal systems only.
 */
export const applyMissileImpact = (impact: MissileImpact): void => {
    const effects = impact.effects
    for (const i of $range(1, effects.length)) {
        safeCall(effects[i - 1])
    }
}
