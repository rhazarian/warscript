local lualib = require("lualib_bundle")

local next = _G.next
local type = _G.type

lualib.__TS__ArrayIsArray = function(value)
    return type(value) == "table" and (value[1] ~= nil or next(value) == nil) and value.constructor == nil
end

local __TS__SetDescriptor = lualib.__TS__SetDescriptor
lualib.__TS__ObjectDefineProperty = function(target, key, desc)
  local luaKey = type(key) == "number" and key + 1 or key
  local value = rawget(target, luaKey)
  local hasGetterOrSetter = desc.get ~= nil or desc.set ~= nil
  local descriptor
  if hasGetterOrSetter then
    if value ~= nil then
      error(
        "Cannot redefine property: " .. tostring(key),
        0
      )
    end
    descriptor = desc
  else
    local valueExists = value ~= nil
    local configurable
    if desc.configurable ~= nil then
      configurable = desc.configurable
    else
      configurable = valueExists
    end
    local enumerable
    if desc.enumerable ~= nil then
      enumerable = desc.enumerable
    else
      enumerable = valueExists
    end
    local writable
    if desc.writable ~= nil then
      writable = desc.writable
    else
      writable = valueExists
    end
    if desc.value ~= nil then
      value = desc.value
    end
    descriptor = {
      set = desc.set,
      get = desc.get,
      configurable = configurable,
      enumerable = enumerable,
      writable = writable,
      value = value
    }
  end
  __TS__SetDescriptor(target, luaKey, descriptor, type(target.constructor) == "table" and target.constructor.prototype == target)
  return target
end
require("cerrie.string")
require("cerrie.global.init")
require("cerrie.core.util")
compiletime(function()
    require("cerrie.string")
    require("cerrie.global.init")
    require("cerrie.core.util")
    require("cerrie.objutil.ability")
    _G.GetLocalizedString = function(source)
        return currentMap and currentMap.strings:localized(source) or source
    end
end)
