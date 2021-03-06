import { FieldMeta, FieldValue } from "../common/common.types";
import { DEFAULT_META } from "../util/meta.util";
import { StateMapList, ValueMapList } from "./field-list.types";
import { v4 as uuidv4 } from 'uuid';

export namespace FieldListHelpers {
	
	export const generateMetaFromValue = <F extends FieldValue>(value: F, defaultMeta?: Partial<typeof DEFAULT_META>) => {
		const meta: FieldMeta<F> = {
			...DEFAULT_META,
			...(defaultMeta ?? {}),
			_id: uuidv4(),
			value: value as any,
		}
		return meta
	}

	export const generateStateFromValues = <V extends ValueMapList>(valueMapList: V, defaultMeta?: Partial<typeof DEFAULT_META>) => {
		const initialState = {
			customData: {},
			listError: undefined,
			items: [],
			wasTouched: false,
		} as StateMapList<V>;

		for (const i in valueMapList) {
			const item = valueMapList[i]

			for (const key in item) {
				const value = item[key];
				const meta = FieldListHelpers.generateMetaFromValue(value, defaultMeta)

				initialState.items[i] = { ...(initialState.items[i] ?? {}), [key]: meta }
			}
		}

		return initialState;
	}
}