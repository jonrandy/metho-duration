import * as Metho from "metho"

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

export const duration = (...parts) => {
	const total = parts.reduce((total, current) => total + current, 0)
	const newDuration = (...durs) => duration(total, ...durs)
	return Object.assign(newDuration, {
		toString: (omitZeroParts = true) => _toString(total, omitZeroParts),
		valueOf: () => total,
		get parts() {
			return _toParts(total)
		},
		toStringParts(omitZeroParts = true) {
			return _toStringParts(total, omitZeroParts)
		},
	})
}

const syms = {}
DURATION_UNITS.forEach(({ id, ms }) => {
	syms[id] = Metho.add(Number.prototype, function () {
		return duration(this * ms)
	})
})
export const { ms, sec, min, hr, day, wk } = syms


const _toParts = i => {
	const res = {}
	DURATION_UNITS.forEach(({ id, ms }) => {
		res[id] = ~~(i / ms)
		i -= res[id] * ms
	})
	return res
}

const _toStringParts = (i, omitZeroParts = true) => {
	const toJoin = [],
		parts = _toParts(i)
	let gotOne = 0
	DURATION_UNITS.forEach(({ id, nouns }) => {
		const v = parts[id]
		gotOne = gotOne || v
		if (v || (gotOne && !omitZeroParts)) toJoin.push(`${v} ${v == 0 || v > 1 ? nouns[1] : nouns[0]}`)
	})
	return toJoin
}

const _toString = (i, omitZeroParts = true) => _toStringParts(i, omitZeroParts).join` `

