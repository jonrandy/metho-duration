import * as Metho from "metho"

// Duration Unit definitions
const DURATION_UNITS = [
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
export const duration = (...parts) => {
	const total = parts.reduce((total, current) => total + current, 0)
	const newDuration = (...durs) => duration(total, ...durs)
	return Object.assign(newDuration, {
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
	})
}

// Safely extend the built-in Number prototype to allow creation of duration types directly from numbers (3[hr])
const syms = {}
DURATION_UNITS.forEach(({ id, ms }) => {
	syms[id] = Metho.add(Number.prototype, function () {
		return duration(this * ms)
	}, { symbolName: id })
})
export const { ms, sec, min, hr, day, wk } = syms

// Safely extend built-in Date prototype to allow adding durations to dates
export const addTime = Metho.add(Date.prototype, function addTime(duration) {
	return new Date(+this + duration)
})

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

