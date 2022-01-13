import { FieldMeta, StateMap, ValueMap } from "..";
import { DEFAULT_META } from "../util/meta.util";
import { v4 as uuidv4 } from 'uuid';

export namespace FieldGroupHelpers {
	
	export const generateStateFromValues = <V extends ValueMap>(valueMap: V, defaultMeta?: Partial<typeof DEFAULT_META>) => {
		const initialState = {
			items: {},
		} as StateMap<V>;
		
		for (const key in valueMap) {
			const value = valueMap[key];
			type ValueType = V[typeof key];
			
			const meta: FieldMeta<ValueType> = {
				...DEFAULT_META,
				...(defaultMeta ?? {}),
				_id: uuidv4(),
				value: value as any,
			};
			initialState.items[key] = meta;
		}

		return initialState;
	};

}