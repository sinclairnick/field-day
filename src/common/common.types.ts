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

export type FieldValue = string | boolean | File[]

export type FormTargetEvent<T extends FieldValue> =
	T extends boolean ? { target: { checked: boolean } }
	: T extends File[] ? { target: { files: FileList } }
	: { target: { value: string } }

export type FieldMeta<T extends FieldValue> = {
	isFocussed: boolean
	wasTouched: boolean
	error: string | undefined
	value: T
}

export type FieldProps<T extends FieldValue> = {
	onChange: <E extends FormTargetEvent<T>>(e: E) => void
	onFocus: () => void
	onBlur: () => void
	value: T extends boolean ? undefined
	: T extends File[] ? never
	: T,
	checked: T extends boolean ? boolean : undefined
}

export type FieldActions<T extends FieldValue> = {
	setMeta: (meta: Partial<FieldMeta<T>>) => void,
}
