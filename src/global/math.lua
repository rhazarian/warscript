local min = math.min
local max = math.max

function math.clamp(x, a, b)
    return min(max(x, a), b)
end

function math.sign(x)
    return x >= 0 and 1 or -1
end

function math.lerp(a, b, t)
    return a + (b - a) * t
end

do
    local floor = math.floor
    local insert = table.insert
    local fcomp_default = function( a,b ) return a < b end
    function table.bininsert(t, value, fcomp)
        -- Initialise compare function
        fcomp = fcomp or fcomp_default
        --  Initialise numbers
        local iStart,iEnd,iMid,iState = 1,#t,1,0
        -- Get insert position
        while iStart <= iEnd do
            -- calculate middle
            iMid = floor( (iStart+iEnd)/2 )
            -- compare
            if fcomp( value,t[iMid] ) then
                iEnd,iState = iMid - 1,0
            else
                iStart,iState = iMid + 1,1
            end
        end
        insert( t,(iMid+iState),value )
        return (iMid+iState)
    end
end

do
    -- Avoid heap allocs for performance
    local floor = math.floor
    local fcomp_default = function( a,b ) return a < b end
    function table.binsearch( tbl,value,fcomp)
        -- Initialise functions
        fcomp = fcomp or fcomp_default
        --  Initialise numbers
        local iStart,iEnd,iMid = 1,#tbl,0
        -- Binary Search
        while iStart <= iEnd do
            -- calculate middle
            iMid = floor( (iStart+iEnd)/2 )

            if value == tbl[iMid] then
                local len = #tbl
                local s, e = iMid, iMid
                while s > 1 and value == tbl[s - 1] do
                    s = s - 1
                end
                while e < len and value == tbl[e + 1] do
                    e = e + 1
                end
                return s, e
            elseif fcomp( value,  tbl[iMid]) then
                iEnd = iMid - 1
            else
                iStart = iMid + 1
            end
        end
    end
end
