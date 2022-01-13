import { FieldMeta, FieldValue } from "../common/common.types"
import { DEFAULT_META } from "../util/meta.util"
import { v4 as uuidv4 } from 'uuid';
export namespace FieldHelpers {

	export const generateMetaFromValue = <V extends FieldValue>(value: V, defaultMeta?: Partial<typeof DEFAULT_META>) => {
		const meta: FieldMeta<V> = {
			...DEFAULT_META,
			...(defaultMeta ?? {}),
			_id: uuidv4(),
			value: value as any,
		}
		return meta
	}

}