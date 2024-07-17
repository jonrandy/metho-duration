import * as Metho from "metho"

export const isCleanImport = (new URL(import.meta.url)).searchParams.get('clean') !== null

// Duration Unit definitions
const DURATION_UNITS = [
	{
		id: "yr",
		ms: 1000 * 60 * 60 * 24 * 365.2422,
		nouns: ["year", "years"],
	},
	{
		id: "mon",
		ms: 1000 * 60 * 60 * 24 * 30.4375,
		nouns: ["month", "months"],
	},
	{
		id: "wk",
		ms: 1000 * 60 * 60 * 24 * 7,
		nouns: ["week", "weeks"],
	},
	{
		id: "day",
		ms: 1000 * 60 * 60 * 24,
		nouns: ["day", "days"],
	},
	{
		id: "hr",
		ms: 1000 * 60 * 60,
		nouns: ["hour", "hours"],
	},
	{
		id: "min",
		ms: 1000 * 60,
		nouns: ["minute", "minutes"],
	},
	{
		id: "sec",
		ms: 1000,
		nouns: ["second", "seconds"],
	},
	{
		id: "ms",
		ms: 1,
		nouns: ["millisecond", "milliseconds"],
	},
]
const DURATION_UNITS_BY_ID = DURATION_UNITS.reduce((units, unit)=>(units[unit.id] = unit, units), {})


// Our composable 'duration' data type
const duration = (...parts) => {
	const total = parts.reduce((total, current) => total + current, 0)
	const t = []
	t.push( (...durs) => duration(total, ...durs) )
	return Object.assign(t[0], {
		toString: (omitZeroParts = true) => _toString(total, omitZeroParts),
		valueOf: () => total,
		in: (...units) => {
			const res = units.map(unit => total / DURATION_UNITS_BY_ID[unit.description].ms)
			return res.length == 1 ? res[0] : res
		},
		get parts() {
			return _toParts(total)
		},
		toStringParts(omitZeroParts = true) {
			return _toStringParts(total, omitZeroParts)
		},
		from(startDate) {
			return new Date(+startDate + total)
		},
		before(startDate) {
			return new Date(+startDate - total)
		}
	})
}

// covenience function to get duration between two dates
const timeBetween = (start, end) => {
	// timestamps (string or number) or date objects will work
	start = +start
	end = +end
	if (start > end) [start, end] = [end, start]
	return duration(end - start)
}

// Safely extend the built-in Number prototype to allow creation of duration types directly from numbers (3[hr])
const syms = {}
DURATION_UNITS.forEach(({ id, ms }) => {
	syms[id] = Metho.add(Number.prototype, function () {
		return duration(this * ms)
	}, { symbolName: id })
})
const { ms, sec, min, hr, day, wk, mon, yr } = syms

// // Safely extend built-in Date prototype to allow adding durations to dates
// export const addTime = Metho.add(Date.prototype, function addTime(duration) {
// 	return new Date(+this + duration)
// })

// convert a duration to an array of unit parts [w, d, h, m, s, ms]
const _toParts = i => {
	const res = []
	DURATION_UNITS.forEach(({ id, ms }) => {
		const bit = ~~(i / ms)
		res.push(bit)
		i -= bit * ms
	})
	return res
}

// convert a duration to string parts (readable) - optionally omitting zero valued units
const _toStringParts = (i, omitZeroParts = true) => {
	const toJoin = [],
		parts = _toParts(i)
	let gotOne = 0
	DURATION_UNITS.forEach(({ id, nouns }, index) => {
		const v = parts[index]
		gotOne = gotOne || v
		if (v || (gotOne && !omitZeroParts)) toJoin.push(`${v} ${v == 0 || v > 1 ? nouns[1] : nouns[0]}`)
	})
	return toJoin
}

// convert a duration to a single readable string - optionally omitting zero valued units
const _toString = (i, omitZeroParts = true) => _toStringParts(i, omitZeroParts).join` `

// a global convenience to get current UNIX timestamp - shorter than Date.now() (don't do it if ?clean)
if (!isCleanImport) {
	Object.defineProperty(window, "now", {
	  get() { return +(new Date()) }
	})
}


export default {
	duration,
	ms,
	sec,
	min,
	hr,
	day,
	wk,
	mon,
	yr,
	timeBetween,
}