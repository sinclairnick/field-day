import { FieldMeta, FieldValue } from "..";
import { FieldHelpers } from "./field.constants";

export type UseFieldOptions<V extends FieldValue> = {
	validate?: (meta: FieldMeta<V>) => string | void | undefined
	validationDelay?: number
	initialValue?: {
		value: V,
		resetState?: boolean,
		defaultMeta?: Parameters<typeof FieldHelpers["generateMetaFromValue"]>[1]
	}
}