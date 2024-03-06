import { Ability } from "./ability"
import { Unit } from "./unit"
import { AttackType, DamageType } from "./unit+damage"

import { Event, EventListener } from "../../event"

declare module "./unit" {
    namespace Unit {
        const onSpellSteal: Event<[source: Unit, target: Unit, buffId: number]>
    }
}
const onSpellSteal = new Event<[source: Unit, target: Unit, buffId: number]>()
rawset(Unit, "onSpellSteal", onSpellSteal)

const countByUnit = setmetatable(new LuaMap<Unit, number>(), { __mode: "k" })
const onSpellStealCastListener: EventListener<[Unit, Ability, Unit]> = (
    caster,
    ability,
    target
) => {
    countByUnit.set(target, (countByUnit.get(target) ?? 0) + 1)
}
for (const spellStealAbilityId of postcompile(() => {
    const spellStealAbilityIds = new Set<number>()
    if (currentMap) {
        for (const [, ability] of pairs(currentMap.objects.ability.all)) {
            if ("Asps" == (ability.parentId ?? ability.id)) {
                spellStealAbilityIds.add(fourCC(ability.id))
            }
        }
    }
    return Array.from(spellStealAbilityIds)
})) {
    Unit.onUnitTargetCast[spellStealAbilityId].addListener(onSpellStealCastListener)
}

type SpellStealEvent = {
    sourceBuffIds: number[]
    sourceBuffCount: number
}
const spellStealEventStack: SpellStealEvent[] = []
Unit.onDamaging.addListener((source, target, event) => {
    if (event.amount == 0 && source != undefined) {
        const count = countByUnit.get(source) ?? 0
        if (count > 0 && event.attackType == AttackType.SPELL) {
            if (event.damageType == DamageType.UNKNOWN) {
                spellStealEventStack.push({
                    sourceBuffIds: source.buffIds,
                    sourceBuffCount: source.countBuffs(),
                })
            } else if (event.damageType == DamageType.NORMAL) {
                const spellStealEvent = spellStealEventStack.pop()
                if (spellStealEvent != undefined) {
                    if (source.countBuffs() < spellStealEvent.sourceBuffCount) {
                        for (const sourceBuffId of spellStealEvent.sourceBuffIds) {
                            if (
                                !source.hasAbility(sourceBuffId) &&
                                target.hasAbility(sourceBuffId)
                            ) {
                                if (count == 1) {
                                    countByUnit.delete(source)
                                } else {
                                    countByUnit.set(source, count - 1)
                                }
                                Event.invoke(onSpellSteal, source, target, sourceBuffId)
                                return
                            }
                        }
                    }
                    spellStealEventStack.push(spellStealEvent)
                }
            }
        }
    }
})
