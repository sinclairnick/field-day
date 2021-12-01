import { FieldMeta, FieldValue } from "../common/common.types"
import { DEFAULT_META } from "../util/meta.util"

export namespace FieldHelpers {

	export const generateMetaFromValue = <V extends FieldValue>(value: V, defaultMeta?: Partial<typeof DEFAULT_META>) => {
		const meta: FieldMeta<V> = {
			...DEFAULT_META,
			...(defaultMeta ?? {}),
			value: value as any,
		}
		return meta
	}

}