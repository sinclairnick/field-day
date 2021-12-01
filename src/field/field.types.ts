import { FieldMeta, FieldValue } from "..";

export type UseFieldOptions<V extends FieldValue> = {
	validate?: (meta: FieldMeta<V>) => string | void | undefined
}