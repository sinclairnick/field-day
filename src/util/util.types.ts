export type DeepPartial<T> = T extends object
	? { [P in keyof T]?: DeepPartial<T[P]>; }
	: T

export type ToPrimitive<T> =
	T extends string ? string
	: T extends number ? number
	: T extends boolean ? boolean
	: T;

export type Widen<O> = O extends object ? {
	[K in keyof O]: ToPrimitive<O[K]>
} : ToPrimitive<O>
