import { FieldValue, FieldMeta, FieldProps, FieldActions } from "../common/common.types"

export type ValueMap = { [key: string]: string | boolean }

export type StateMap<V extends ValueMap> = {
	items: {
		[key in keyof V]: FieldMeta<V[key]>
	}
}

export type FieldMap<V extends ValueMap> = {
	[key in keyof V]: {
		meta: FieldMeta<V[key]> & { isDirty: boolean },
		actions: FieldActions<V[key]>,
		props: FieldProps<V[key]>
	}
}

export type UseFieldGroupOptions<I extends ValueMap> = {
	validate?: (meta: StateMap<I>["items"]) => Partial<{ [key in keyof I]: string | void | undefined }>
}