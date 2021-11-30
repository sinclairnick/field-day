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
