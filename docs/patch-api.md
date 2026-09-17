# New patch wrapper API

The wrappers below expose the additions from the supplied `common.j` and
`blizzard.j`. Import classes from their modules, as with the existing API.
Native functions are captured in module-local constants.

Unit extensions are implemented in `engine/internal/unit/inventory.ts`, `extended-inventory.ts`,
`equipment-inventory.ts`, and `appearance.ts`. Both public unit entry points,
`engine/unit` and `core/types/unit`, install them. Code importing the internal
base class directly must also import the extension it uses. This keeps the base
Lua module below the compiler's local-variable limit.

## Inventory and equipment

Units expose three cached, live collections. Indices are zero-based, empty slots
return `undefined`, and iteration includes empty slots through the collection's
full capacity. `.length` is the number of slots, not the number of occupied slots.

| Collection                      | Slot access                                                | Operations                                                                                                                                                 |
| ------------------------------- | ---------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `unit.inventory: UnitInventory` | `unit.inventory[0]`, up to six slots; assignment supported | `findSlot(item)`                                                                                                                                           |
| `unit.extendedInventory: UnitExtendedInventory`             | `unit.extendedInventory[0]`, capacity from the engine; read-only slots   | `has(item)`, `findSlot(item)`                                                                                                                              |
| `unit.equipmentInventory: UnitEquipmentInventory` | `unit.equipmentInventory[EquipmentSlot.HEAD]`; read-only slots      | `equip(item)`, `unequip(item)`, `unequipSlot(slot)`, `has(item)`, `hasAny()`, `isSlotEmpty(slot)`, `hasType(type)`, `canEquipType(type)`, `findSlot(item)` |

`findSlot` returns the zero-based slot or `undefined`. Equipment operations let the
engine choose the destination slot. No native is available for exact extended-inventory slot
assignment, so the extended inventory view is read-only.

This is a breaking rename: replace `Unit.items` with `Unit.inventory`,
`UnitItems` with `UnitInventory`, and imports of `engine/internal/unit/item` with
`engine/internal/unit/inventory`. The earlier flat extended-inventory/equipment-inventory methods are
replaced by the collection API above.

`EquipmentSlot`, `EquipmentType`, and `ItemTag` are exported from their respective
modules under `engine/object-data/auxiliary`.

```ts
import { EquipmentSlot } from "warscript/engine/object-data/auxiliary/equipment-slot"
import { Unit } from "warscript/engine/unit"

Unit.itemEquippedEvent.addListener((unit, item) => {
    const headItem = unit.equipmentInventory[EquipmentSlot.HEAD]
    // React to the equipment change here.
})
```

`Unit.itemEquippedEvent` and `Unit.itemUnequippedEvent` deliver `(unit, item)`.
They follow the existing suppression rules for dummy units and ignored items.
`Unit.itemStackedEvent` additionally delivers `previousTargetCharges` as its
fourth argument, after `(unit, target, source)`.

`Item` has `isOwned`, `isInInventory`, `isInExtendedInventory`, `isInEquipmentInventory`, `equipmentType`, `tag`, and a `color` setter.
`Item.chooseRandomType(level, equipmentType?, tag?, itemType?)` returns a matching
item type ID, or `undefined` for the native zero result.

## Abilities, attacks and animation

- `UnitAbility.cooldownRemainingPercent` and `cooldownRemaining` read and update
  the remaining cooldown of that instance. `startCooldown(duration)` starts its
  cooldown explicitly.
- Percentage values use the native scale without normalization. Duration values
  use the native duration units.
- `unit.firstWeapon.resetAttack()` and `unit.secondWeapon.resetAttack()` select
  the corresponding zero-based weapon index.
- `Unit.setAurasEnabled(enabled, affectsUI?)` controls auras.
- `Unit.getAnimationDuration(nameOrIndex)` selects the string or index native.
- `Unit.isHeroGlowAllowed`, `maximumFlyHeight`, `showsAirToGroundIndicator`, and
  `alwaysDisplaysHealth` expose the new unit settings.
- `Effect.setAnimation`, `queueAnimation`, and the `animationBlendTime` setter
  expose named effect animations and blending.

## Input and frames

`LocalClient` exposes `isKeyPressed`, `isMetaKeyPressed`, `isMouseButtonPressed`,
`mouseScreenX/Y`, `mouseFrameX/Y`, `pixelToFrameX/Y`, and `frameToPixelX/Y`.
The modifier argument uses the same `oskeymeta` mask as player key events.
`Frame.autoScroll` is a setter for TEXTAREA frames.

These input and coordinate results are local. Synchronize decisions before using
them to modify shared game state. These methods do not register timers or create
frames. Register UI listeners and create handles synchronously, before local UI
callbacks use them.

## Camera and cinematics

- `Camera.cameraType`, `addBlocker(rect)`, and `setBlockerEnabled(rect, enabled)`.
- `CameraField.depthOfFieldDistance`, `depthOfFieldScale`, and `absoluteZ`, plus
  `field.isControlledByInput`.
- `PlayerCamera.cameraType`, `depthOfFieldDistance`, `depthOfFieldScale`,
  `absoluteZ`, `setFieldControlledByInput`, `isFieldControlledByInput`,
  `setBlockerEnabled`, and `applySetup`. These respect the existing local-player
  guard; remote getters return `0` or `false`.
- `CameraSetup.create()` produces a setup with `cameraType`, `getField`,
  `setField`, `setDestination`, and `apply`. Creation must be synchronized.
  The engine provides no destruction native for camera setups.
- `ModelCinematic.preload`, `play`, `shotCount`, `currentShot`, `remainingTime`,
  and the `enabled` setter control the engine's model cinematic playback.

Camera type identifiers and model cinematic rotation are passed through without
inventing undocumented enum values or converting units.

## Environment and objects

`TerrainFog.configure` accepts partial settings: `style`, `zStart`, `zEnd`,
`density`, `heightStart`, `heightEnd`, `linearStart`, `linearEnd`,
`maxLinearDensity`, `drawOverSky`, and `color`. Each also has a static setter.
`FogStyle` includes all six styles from the new declarations.

`Water.configure` accepts partial HD settings: `color`, `colorOverride`,
`vertexDisplacement`, `minOpacity`, `maxOpacity`, `reflectivity`, `emissivity`,
`edgeSoftness`, `waveStrength`, and `environmentMapStrength`. Each also has a
static setter. Numeric settings retain their native scales.

Both configuration methods preserve omitted settings and accept explicit `0` and
`false`. Colors use the existing `Color` class; terrain fog converts its RGB
channels to 0–1, while water uses 0–255.

`Doodad.count`, `at(index)`, and `getAll()` expose placed doodads. Instances have
`typeId`, `variation`, `x/y/z`, `scaleX/Y/Z`, `yaw/pitch/roll`, `usesModelAxes`, a
`color` setter, and `setAnimation(name, random?)`. Indices are zero-based and
out-of-range indices return `undefined`. Rotation getters preserve native units.
`Doodad.setColorInRange` and `setColorInRect` support batch coloring.

`Destructable.create` and `createZ` accept an optional final parameters object:

```ts
import { Destructable } from "warscript/core/types/destructable"
import { PlayerColor } from "warscript/core/types/playerColor"

const object = Destructable.createZ(typeId, x, y, z, facing, scale, variation, {
    skinId,
    pitch,
    roll,
    color: PlayerColor.black,
    dead: false,
})
```

These options cover the native alive/dead, height, skin, rotation and color
creation variants. Pitch and roll retain native units. Instances also have
`color` and `vertexColor` setters; `vertexColor` accepts RGBA through `Color`.

`Terrain.isPathableEx` returns the new native's boolean without inversion.
`Terrain.minimumShadowCastingPointLightCount` exposes the shadow-light setting.

## Other additions

- `TriggerEvent.isRunning` and `interrupt()` use the underlying trigger only
  while it exists; reading or interrupting an unused event does not initialize it.
- `Player.setRaceSkin(racePreference)` accepts the new race preference as well.
- `PlayerColor.black` uses `PLAYER_COLOR_BLACK`.
- `Sound.start(milliseconds?, fadeIn?)` supports an explicit fade-in flag.
- `Music.thematicVolume`, `pauseThematicOnFocusLost`, and
  `setVolumeGroup(group, scale)` expose the audio controls and new volume groups.

## Validation

Run `npm run test:patch-wrappers`, TypeScript checking, and the TSTL
build. The contract tests check routing, conversion, defaults, local-player
guards, and trigger lifetime. They do not establish engine behavior. Verify
equipment transitions, rendering, native interruption, cooldown semantics, and
multiplayer synchronization in Warcraft with the new patch.
