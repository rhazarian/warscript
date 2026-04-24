local error = _G.error
local getmetatable = _G.getmetatable
local ipairs = _G.ipairs
local tableconcat = table.concat

_G.ipairs = function(t)
    local metatable = getmetatable(t)
    if metatable and metatable.__ipairs then
        return metatable.__ipairs(t)
    end
    return ipairs(t)
end

_G.assert = function(v, ...)
    if (!v) then
       error(tableconcat({ ... }))
    end
    return v, ...
end
