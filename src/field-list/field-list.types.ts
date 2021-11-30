import { FieldActions, FieldMeta, FieldProps, FieldValue } from "../common/common.types";

export type ValueMapList = { [key: string]: FieldValue }[]

export type StateMapList<V extends ValueMapList> = {
	items: Array<{
		[key in keyof V[number]]: FieldMeta<V[number][key]>
	}>
}

export type FieldListItemActions<T extends FieldValue> = FieldActions<T> & {
	remove: () => void
}

export type FieldRowActions = {
	remove: () => void
}

export type FieldMapList<V extends ValueMapList> = Array<{
	[key in keyof V[number]]: {
		meta: FieldMeta<V[number][key]> & { isDirty: boolean },
		actions: FieldActions<V[number][key]>,
		props: FieldProps<V[number][key]>
	}
} >
