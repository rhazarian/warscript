/*
const dummyUnit = dummy as Unit
const dummyAbilityTypeId = 5

function startAbilityCooldown(unit: Unit, ability: Ability, cooldown: number) {
    for (const slot of $range(0, 5)) {
        const item = unit.itemInSlot(slot)
        if (item != null && item.getAbility(ability.typeId) == ability) {
            unit.dropItemTarget(item, dummyUnit)
            let otherAbilityIndex = 0
            let otherAbility = item.getAbilityByIndex(otherAbilityIndex)
            while (otherAbility != null) {
                dummyUnit.disableAbility(otherAbility.typeId, true)
                otherAbility = item.getAbilityByIndex(++otherAbilityIndex)
            }
            item.addAbility(dummyAbilityTypeId)
            item.getAbility(dummyAbilityTypeId)?.setField(ABILITY_RLF_COOLDOWN, cooldown)
            dummyUnit.useItem(item)
            item.removeAbility(dummyAbilityTypeId)
            dummyUnit.dropItemTarget(item, unit)
            unit.dropItemSlot(item, slot)
            return
        }
    }
    unit.startAbilityCooldown(ability.typeId, cooldown)
}
* */