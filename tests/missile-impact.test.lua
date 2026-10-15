-- Run after tstl: node_modules/.bin/warpack exec tests/missile-impact.test.lua
-- Tests the emitted Lua of the shared missile impact: the on-missile-impact behaviors of one cast
-- all find the impact the first of them started (one missile per cast, every effect applied on
-- its arrival), while another caster or another cast gets its own.
package.path = "dist/?.lua;node_modules/typescript-to-lua/dist/lualib/universal/?.lua;" .. package.path

local errors = {}
warpack = { safeCall = function(callback, ...)
    local ok, err = pcall(callback, ...)
    if not ok then
        errors[#errors + 1] = err
    end
    return ok
end }

-- The zero timer: callbacks added while a batch is being invoked only run in the next batch,
-- which is what the impact bookkeeping relies on.
local pending = {}
package.loaded["core.types.timer"] = { Timer = { run = function(_, callback, ...)
    pending[#pending + 1] = { callback = callback, args = table.pack(...) }
end } }
local function runZeroTimer()
    local batch = pending
    pending = {}
    for _, entry in ipairs(batch) do
        entry.callback(table.unpack(entry.args, 1, entry.args.n))
    end
end

-- The events the module hooks to tell two impacts of the same ability apart: the internal one,
-- which every public impact event of a real impact is derived from, and the public common one,
-- which an emulated impact invokes on its own.
local function newEvent()
    local event = { byPriority = {} }
    function event.addListener(_, priority, listener)
        event.byPriority[#event.byPriority + 1] = { priority = priority, listener = listener }
        table.sort(event.byPriority, function(a, b) return a.priority > b.priority end)
    end
    function event.invoke(caster, ability)
        for _, entry in ipairs(event.byPriority) do
            entry.listener(caster, ability)
        end
    end
    return event
end

local internalEvent, commonEvent = newEvent(), newEvent()
package.loaded["engine.internal.unit.ability"] = { internalAbilityImpactEvent = internalEvent }
package.loaded["engine.internal.unit"] = { Unit = { abilityImpactEvent = commonEvent } }

local module = require("engine.internal.mechanics.missile-impact")
assert(#internalEvent.byPriority == 2, "the start and the end of a real impact are not hooked")
assert(internalEvent.byPriority[1].priority == 999999, "the start must run before the handlers")
assert(internalEvent.byPriority[2].priority == -999999, "the end must run after the handlers")
assert(#commonEvent.byPriority == 1 and commonEvent.byPriority[1].priority == -999999,
    "the end of a standalone impact event is not hooked")

-- A real impact: the internal event dispatches the public ones, the common one among them.
local function realImpact(caster, ability, handlers)
    local started, finished = false, false
    for _, entry in ipairs(internalEvent.byPriority) do
        if entry.priority == 999999 then
            entry.listener(caster, ability)
            started = true
            commonEvent.invoke(caster, ability) -- the public events, dispatched within the impact
            handlers(caster, ability)
        else
            entry.listener(caster, ability)
            finished = true
        end
    end
    assert(started and finished)
end
local getMissileImpact, applyMissileImpact = module.getMissileImpact, module.applyMissileImpact

local ability, otherAbility = { id = "ability" }, { id = "other ability" }
local caster, otherCaster = { id = "caster" }, { id = "other caster" }

-- === One cast, two behaviors: one missile, both effects ===

local applied = {}
local function effect(name)
    return function() applied[#applied + 1] = name end
end

local first, firstRequiresLaunch = getMissileImpact(ability, caster)
assert(firstRequiresLaunch == true, "the first behavior has to launch the missile")
first.effects[#first.effects + 1] = effect("buff")

local second, secondRequiresLaunch = getMissileImpact(ability, caster)
assert(second == first, "the second behavior must join the missile of the first")
assert(secondRequiresLaunch == false, "the second behavior must not launch a missile of its own")
second.effects[#second.effects + 1] = effect("heal")

applyMissileImpact(first)
assert(#applied == 2 and applied[1] == "buff" and applied[2] == "heal",
    "both effects apply, in the order they were added")

-- === Another caster of the same ability gets its own missile ===

local other, otherRequiresLaunch = getMissileImpact(ability, otherCaster)
assert(other ~= first and otherRequiresLaunch == true, "an item ability used by another unit")

-- Another ability as well.
local unrelated, unrelatedRequiresLaunch = getMissileImpact(otherAbility, caster)
assert(unrelated ~= first and unrelatedRequiresLaunch == true)

-- === The same unit casting the same ability again in the same thread ===
-- Two impacts can be dispatched before the zero timer runs; each is a missile of its own.

applied = {}
local casts = {}
local function cast(caster, ability)
    local impact, requiresLaunch = getMissileImpact(ability, caster)
    casts[#casts + 1] = { impact = impact, requiresLaunch = requiresLaunch }
    return impact
end

-- Two real impacts: the public events of each are dispatched within their own internal one.
realImpact(caster, ability, function()
    -- A behavior on the common event and one on a target event share the impact of this cast.
    local onImpact = cast(caster, ability)
    local onTargetImpact = cast(caster, ability)
    assert(onTargetImpact == onImpact, "the behaviors of one impact share its missile")
end)
realImpact(caster, ability, cast)
assert(casts[3].impact ~= casts[1].impact, "a second impact must not join the first missile")
assert(casts[1].requiresLaunch and not casts[2].requiresLaunch and casts[3].requiresLaunch,
    "one missile per impact")

casts[1].impact.effects[1] = effect("first cast")
casts[3].impact.effects[1] = effect("second cast")
applyMissileImpact(casts[1].impact)
applyMissileImpact(casts[3].impact)
assert(#applied == 2 and applied[1] == "first cast" and applied[2] == "second cast",
    "each missile carries only the effects of its own cast")

-- Two emulated impacts in one thread: the common event invoked on its own, twice.
casts = {}
commonEvent.invoke(caster, ability)
local emulated = cast(caster, ability)
commonEvent.invoke(caster, ability) -- the first emulated impact is through
local emulatedAgain, emulatedAgainRequiresLaunch = getMissileImpact(ability, caster)
assert(emulatedAgain ~= emulated, "a second emulated impact must not join the first missile")
assert(emulatedAgainRequiresLaunch == true, "the second emulated impact launches its own missile")

-- === The next cast is a new impact ===

runZeroTimer()
local next_, nextRequiresLaunch = getMissileImpact(ability, caster)
assert(next_ ~= first, "the next cast must not reuse the impact of the previous one")
assert(nextRequiresLaunch == true, "the next cast launches its own missile")
assert(#next_.effects == 0, "a fresh impact carries no effects")

-- Forgetting an impact must not forget the one that replaced it.
runZeroTimer()
local third, thirdRequiresLaunch = getMissileImpact(ability, caster)
assert(thirdRequiresLaunch == true)
runZeroTimer() -- drops `third`
local fourth = getMissileImpact(ability, caster)
assert(fourth ~= third)
local fifth, fifthRequiresLaunch = getMissileImpact(ability, caster)
assert(fifth == fourth and fifthRequiresLaunch == false, "the impact in flight is still shared")

-- === A failing effect does not keep the others from being applied ===

applied, errors = {}, {}
local impact = getMissileImpact(otherAbility, otherCaster)
impact.effects[1] = effect("before")
impact.effects[2] = function() error("effect failed") end
impact.effects[3] = effect("after")
applyMissileImpact(impact)
assert(#applied == 2 and applied[1] == "before" and applied[2] == "after", "the others still apply")
assert(#errors == 1 and tostring(errors[1]):find("effect failed", 1, true), "the error is reported")

print("missile-impact: ok")
