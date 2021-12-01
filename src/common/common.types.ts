export type DeepPartial<T> = T extends object
	? { [P in keyof T]?: DeepPartial<T[P]>; }
	: T

export type ToPrimitive<T> =
	T extends string ? string
	: T extends number ? number
	: T extends boolean ? boolean
	: T;
export type Widen<O> = {
	[K in keyof O]: ToPrimitive<O[K]>
}

export type FieldValue = string | boolean | FileList

export type FormTargetEvent<T extends FieldValue> = T extends boolean
	? { target: { checked: boolean } }
	: { target: { value: string } }

export type FieldMeta<T extends FieldValue> = {
	isFocussed: boolean
	wasTouched: boolean
	error: string | undefined
	value: T extends boolean ? boolean : string
}

export type FieldProps<T extends FieldValue> = {
	onChange: <E extends FormTargetEvent<T>>(e: E) => void
	onFocus: () => void
	onBlur: () => void
	value: T extends boolean ? undefined : T,
	checked: T extends boolean ? boolean : undefined
}

export type FieldActions<T extends FieldValue> = {
	setMeta: (meta: Partial<FieldMeta<T>>) => void,
}
