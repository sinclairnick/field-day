import { FieldActions, FieldMeta, FieldProps, FieldValue } from "../common/common.types";
import { FieldListHelpers } from "./field-list.constants";

export type ValueMapList = { [key: string]: FieldValue }[]

export type StateMapList<V extends ValueMapList> = {
	listError: string | undefined
	customData: { [key: string]: any }
	items: Array<{
		[key in keyof V[number]]: FieldMeta<V[number][key]>
	}>
}

export type FieldMapList<V extends ValueMapList> = Array<{
	[key in keyof V[number]]: {
		meta: FieldMeta<V[number][key]> & { isDirty: boolean },
		actions: FieldActions<V[number][key]>,
		props: FieldProps<V[number][key]>
	}
}>

export type UseFieldListOptions<I extends ValueMapList> = {
	validateList?: (meta: StateMapList<I>["items"]) => string | void | undefined,
	validateRow?: (rowMeta: StateMapList<I>["items"][number], index: number, listMeta: StateMapList<I>["items"]) => Partial<{ [key in keyof I[number]]: string | void | undefined } | void | undefined>
	validationDelay?: number
	initialValues?: {
		values: I,
		resetState?: boolean,
		defaultMeta?: Parameters<typeof FieldListHelpers["generateMetaFromValue"]>[1]
	} | undefined
}