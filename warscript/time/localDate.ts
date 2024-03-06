import { DayOfWeek } from "./dayOfWeek"
import { Month } from "./month"
import { Year } from "./year"
import { StringBuilder } from "../util/stringBuilder"

const date = os.date
const format = string.format
const pack = string.pack
const abs = math.abs

const cache: Record<string, LocalDate | undefined> = setmetatable({}, { __mode: "v" })

/**
 * The number of days in a 400-year cycle.
 */
const DAYS_PER_CYCLE = 146097

/**
 * The number of days from year zero to year 1970.
 * There are five 400 year cycles from year zero to 2000.
 * There are 7 leap years from 1970 to 2000.
 */
const DAYS_0000_TO_1970 = DAYS_PER_CYCLE * 5 - (30 * 365 + 7)

export class LocalDate {
    private constructor(
        public readonly year: number,
        public readonly month: Month,
        public readonly dayOfMonth: number,
        private readonly key: string
    ) {
        assert(math.type(year) == "integer")
        assert(math.type(dayOfMonth) == "integer" && dayOfMonth >= 1 && dayOfMonth <= 31)

        cache[key] = this
    }

    public static now(): LocalDate {
        const info = date("*t")
        return LocalDate.of(info.year, info.month, info.day)
    }

    public static of(year: number, month: number | Month, day: number): LocalDate {
        month = typeof month == "number" ? month : month.value
        const key = pack(">i4BB", year, month, day)
        return cache[key] ?? new LocalDate(year, Month.of(month), day, key)
    }

    /**
     * Obtains an instance of {@code LocalDate} from the epoch day count.
     * <p>
     * This returns a {@code LocalDate} with the specified epoch-day.
     * The epoch-day is a simple incrementing count
     * of days where day 0 is 1970-01-01. Negative numbers represent earlier days.
     *
     * @param epochDay  the Epoch Day to convert, based on the epoch 1970-01-01
     * @return the local date
     */
    private static ofEpochDay(epochDay: number): LocalDate {
        let zeroDay = epochDay + DAYS_0000_TO_1970
        // find the march-based year
        zeroDay -= 60 // adjust to 0000-03-01 so leap day is at end of four-year cycle
        let adjust = 0
        if (zeroDay < 0) {
            // adjust negative years to positive for calculation
            const adjustCycles = math.idiv(zeroDay + 1, DAYS_PER_CYCLE) - 1
            adjust = adjustCycles * 400
            zeroDay += -adjustCycles * DAYS_PER_CYCLE
        }
        let yearEst = math.idiv(400 * zeroDay + 591, DAYS_PER_CYCLE)
        let doyEst =
            zeroDay -
            (365 * yearEst +
                math.idiv(yearEst, 4) -
                math.idiv(yearEst, 100) +
                math.idiv(yearEst, 400))
        if (doyEst < 0) {
            // fix estimate
            yearEst--
            doyEst =
                zeroDay -
                (365 * yearEst +
                    math.idiv(yearEst, 4) -
                    math.idiv(yearEst, 100) +
                    math.idiv(yearEst, 400))
        }
        yearEst += adjust // reset any negative year
        const marchDoy0 = doyEst

        // convert march-based values back to january-based
        const marchMonth0 = math.idiv(marchDoy0 * 5 + 2, 153)
        const month = ((marchMonth0 + 2) % 12) + 1
        const dom = marchDoy0 - math.idiv(marchMonth0 * 306 + 5, 10) + 1
        yearEst += math.idiv(marchMonth0, 10)

        return LocalDate.of(yearEst, month, dom)
    }

    /**
     * Resolves the date, resolving days past the end of month.
     *
     * @param year  the year to represent, validated from MIN_YEAR to MAX_YEAR
     * @param month  the month-of-year to represent, validated from 1 to 12
     * @param day  the day-of-month to represent, validated from 1 to 31
     * @return the resolved date
     */
    private static resolvePreviousValid(year: number, month: number, day: number): LocalDate {
        switch (month) {
            case 2:
                day = math.min(day, Year.isLeap(year) ? 29 : 28)
                break
            case 4:
            case 6:
            case 9:
            case 11:
                day = math.min(day, 30)
                break
        }
        return LocalDate.of(year, month, day)
    }

    /**
     * Gets the day-of-year field.
     * <p>
     * This method returns the primitive {@code int} value for the day-of-year.
     *
     * @return the day-of-year, from 1 to 365, or 366 in a leap year
     */
    public get dayOfYear(): number {
        return this.month.getFirstDayOfYear(this.isLeapYear) + this.dayOfMonth - 1
    }

    /**
     * Gets the day-of-week field, which is a class {@code DayOfWeek}.
     * <p>
     * This method returns the class {@link DayOfWeek} for the day-of-week.
     *
     * @return the day-of-week
     */
    public get dayOfWeek(): DayOfWeek {
        return DayOfWeek.of(math.fmod(this.toEpochDay() + 3, 7) + 1)
    }

    /**
     * Checks if the year is a leap year, according to the ISO proleptic
     * calendar system rules.
     * <p>
     * This method applies the current rules for leap years across the whole time-line.
     * In general, a year is a leap year if it is divisible by four without
     * remainder. However, years divisible by 100, are not leap years, with
     * the exception of years divisible by 400 which are.
     * <p>
     * For example, 1904 is a leap year it is divisible by 4.
     * 1900 was not a leap year as it is divisible by 100, however 2000 was a
     * leap year as it is divisible by 400.
     * <p>
     * The calculation is proleptic - applying the same rules into the far future and far past.
     * This is historically inaccurate, but is correct for the ISO-8601 standard.
     *
     * @return true if the year is leap, false otherwise
     */
    public get isLeapYear(): boolean {
        return Year.isLeap(this.year)
    }

    /**
     * Returns the length of the month represented by this date.
     * <p>
     * This returns the length of the month in days.
     * For example, a date in January would return 31.
     *
     * @return the length of the month in days
     */
    public get lengthOfMonth(): number {
        return this.month.getLength(this.isLeapYear)
    }

    /**
     * Returns the length of the year represented by this date.
     * <p>
     * This returns the length of the year in days, either 365 or 366.
     *
     * @return 366 if the year is leap, 365 otherwise
     */
    public get lengthOfYear(): number {
        return this.isLeapYear ? 366 : 365
    }

    /**
     * Returns a copy of this {@code LocalDate} with the specified number of months added.
     * <p>
     * This method adds the specified amount to the months field in three steps:
     * <ol>
     * <li>Add the input months to the month-of-year field</li>
     * <li>Check if the resulting date would be invalid</li>
     * <li>Adjust the day-of-month to the last valid day if necessary</li>
     * </ol>
     * <p>
     * For example, 2007-03-31 plus one month would result in the invalid date
     * 2007-04-31. Instead of returning an invalid result, the last valid day
     * of the month, 2007-04-30, is selected instead.
     * <p>
     * This instance is immutable and unaffected by this method call.
     *
     * @param monthsToAdd  the months to add, may be negative
     * @return a {@code LocalDate} based on this date with the months added, not null
     */
    public plusMonths(monthsToAdd: number): LocalDate {
        assert(math.type(monthsToAdd) == "integer")
        if (monthsToAdd == 0) {
            return this
        }
        const monthCount = this.year * 12 + (this.month.value - 1)
        const calcMonths = monthCount + monthsToAdd // safe overflow
        const newYear = math.idiv(calcMonths, 12)
        const newMonth = math.fmod(calcMonths, 12) + 1
        return LocalDate.resolvePreviousValid(newYear, newMonth, this.dayOfMonth)
    }

    /**
     * Returns a copy of this {@code LocalDate} with the specified number of weeks added.
     * <p>
     * This method adds the specified amount in weeks to the days field incrementing
     * the month and year fields as necessary to ensure the result remains valid.
     * The result is only invalid if the maximum/minimum year is exceeded.
     * <p>
     * For example, 2008-12-31 plus one week would result in 2009-01-07.
     * <p>
     * This instance is immutable and unaffected by this method call.
     *
     * @param weeksToAdd  the weeks to add, may be negative
     * @return a {@code LocalDate} based on this date with the weeks added
     */
    public plusWeeks(weeksToAdd: number): LocalDate {
        return this.plusDays(weeksToAdd * 7)
    }

    /**
     * Returns a copy of this {@code LocalDate} with the specified number of days added.
     * <p>
     * This method adds the specified amount to the days field incrementing the
     * month and year fields as necessary to ensure the result remains valid.
     * The result is only invalid if the maximum/minimum year is exceeded.
     * <p>
     * For example, 2008-12-31 plus one day would result in 2009-01-01.
     * <p>
     * This instance is immutable and unaffected by this method call.
     *
     * @param daysToAdd  the days to add, may be negative
     * @return a {@code LocalDate} based on this date with the days added
     */
    public plusDays(daysToAdd: number): LocalDate {
        assert(math.type(daysToAdd) == "integer")
        if (daysToAdd == 0) {
            return this
        }
        const dom = this.dayOfMonth + daysToAdd
        if (dom > 0) {
            if (dom <= 28) {
                return LocalDate.of(this.year, this.month.value, dom)
            } else if (dom <= 59) {
                // 59th Jan is 28th Feb, 59th Feb is 31st Mar
                const monthLen = this.lengthOfMonth
                if (dom <= monthLen) {
                    return LocalDate.of(this.year, this.month.value, dom)
                } else if (this.month.value < 12) {
                    return LocalDate.of(this.year, this.month.value + 1, dom - monthLen)
                } else {
                    return LocalDate.of(this.year + 1, 1, dom - monthLen)
                }
            }
        }

        const mjDay = this.toEpochDay() + daysToAdd
        return LocalDate.ofEpochDay(mjDay)
    }

    private toEpochDay(): number {
        const y = this.year
        const m = this.month.value
        let total = 0
        total += 365 * y
        if (y >= 0) {
            total += math.idiv(y + 3, 4) - math.idiv(y + 99, 100) + math.idiv(y + 399, 400)
        } else {
            total -= math.idiv(y, -4) - math.idiv(y, -100) + math.idiv(y, -400)
        }
        total += math.idiv(367 * m - 362, 12)
        total += this.dayOfMonth - 1
        if (m > 2) {
            total--
            if (!this.isLeapYear) {
                total--
            }
        }
        return total - DAYS_0000_TO_1970
    }

    /**
     * Outputs this date as a {@code String}, such as {@code 2007-12-03}.
     * <p>
     * The output will be in the ISO-8601 format {@code uuuu-MM-dd}.
     *
     * @return a string representation of this date
     */
    public toString(): string {
        const year = this.year
        const month = this.month.value
        const day = this.dayOfMonth
        const sb = new StringBuilder()
        if (abs(year) < 1000) {
            if (year < 0) {
                sb.append(format("-%04d", abs(year)))
            } else {
                sb.append(format("%04d", year))
            }
        } else {
            if (year > 9999) {
                sb.append("+")
            }
            sb.append(year)
        }
        return sb
            .append(month < 10 ? "-0" : "-")
            .append(month)
            .append(day < 10 ? "-0" : "-")
            .append(day)
            .toString()
    }

    private __lt(other: LocalDate): boolean {
        let cmp = this.year - other.year
        if (cmp == 0) {
            cmp = this.month.value - other.month.value
            if (cmp == 0) {
                cmp = this.dayOfMonth - other.dayOfMonth
            }
        }
        return cmp < 0
    }

    private __le(other: LocalDate): boolean {
        let cmp = this.year - other.year
        if (cmp == 0) {
            cmp = this.month.value - other.month.value
            if (cmp == 0) {
                cmp = this.dayOfMonth - other.dayOfMonth
            }
        }
        return cmp <= 0
    }
}
