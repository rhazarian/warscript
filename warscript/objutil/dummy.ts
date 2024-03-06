import { AbilityDefinitionPermanentInvisibility } from "./ability"
import { UnitDefinition } from "./unit"

import * as idgen from "./idgen"

export const dummyUnitId = compiletime(() => {
    const disableAutoAcquireAttackTargetsAbility = new AbilityDefinitionPermanentInvisibility()
    disableAutoAcquireAttackTargetsAbility.name =
        "[Warscript/Dummy] Disable Auto-Acquire Attack Targets"
    disableAutoAcquireAttackTargetsAbility.autoAcquireAttackTargets = false
    disableAutoAcquireAttackTargetsAbility.durationNormal = -1
    disableAutoAcquireAttackTargetsAbility.durationHero = -1
    const dummy = new UnitDefinition("ewsp", idgen.unit(), {
        name: "[Warscript/Dummy] Unit",
        model: "",
        foodCost: 0,
        movementType: "none",
        maxMana: 999999,
        abilitiesNormal: ["Avul", "Aloc", "AInv", disableAutoAcquireAttackTargetsAbility.id],
    })
    const weapon = dummy.weapons[0]
    weapon.enabled = true
    weapon.attackBackswing = 0
    weapon.attackPoint = 0
    weapon.cooldown = 0
    weapon.range = 99999
    weapon.attackType = "spells" // must be able to target ethereal
    weapon.weaponType = "instant"
    weapon.baseDamage = -1
    weapon.diceNumber = 1
    weapon.diceSides = 1
    weapon.targetsAllowed = ["ground", "air", "structure", "ward", "vulnerable", "invulnerable"]
    return fourCC(dummy.id)
})
