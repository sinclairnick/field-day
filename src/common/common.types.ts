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
	/** Any custom data added to state. Empty object until user modifies */
	customData: { [key: string]: any }
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

export type BaseFieldObject<T extends FieldValue> = {
	meta: FieldMeta<T>,
	props: FieldProps<T>
	actions: FieldActions<T>
}