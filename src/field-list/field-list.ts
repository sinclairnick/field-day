import { atom, useAtom } from "jotai";
import { FieldActions, FieldMeta, FieldProps, FieldValue } from "../common/common.types";
import { FieldMapList, StateMapList, ValueMapList } from "./field-list.types";

const generateMetaFromValue = <F extends FieldValue>(value: F) => {
	const meta: FieldMeta<typeof value> = {
		error: undefined,
		isFocussed: false,
		value: value as any,
		wasTouched: false,
	}
	return meta
}

const generateStateFromValues = <V extends ValueMapList>(valueMapList: V) => {
	const initialState = {
		items: [],
		wasTouched: false,
	} as StateMapList<V>;

	for (const i in valueMapList) {
		const item = valueMapList[i]

		for (const key in item) {
			const value = item[key];
			const meta = generateMetaFromValue(value)

			initialState.items[i] = { ...(initialState.items[i] ?? {}), [key]: meta }
		}
	}

	return initialState;
};


export const createFieldList = <I extends ValueMapList>(initialValues: I) => {
	const initialState = generateStateFromValues(initialValues)
	const fieldListAtom = atom(initialState);

	const useForm = () => {
		const [_state, setState] = useAtom(fieldListAtom)

		const state = _state as StateMapList<I>; // Jotai removes type info

		const listActions = {
			append: (values: I[number]) => {
				const newItem = {} as StateMapList<I>["items"][number]
				for (const key in values) {
					const meta = generateMetaFromValue(values[key])
					newItem[key] = meta
				}
				setState({
					...state,
					items: [...state.items, newItem]
				})
			},
			insert: (index: number, values: I[number]) => {
				const newItem = {} as StateMapList<I>["items"][number]
				for (const key in values) {
					const meta = generateMetaFromValue(values[key])
					newItem[key] = meta
				}
				const newItems = [...state.items]
				newItems.splice(index, 0, newItem)
				setState({ ...state, items: newItems })
			},
			remove: (index: number) => {
				const newItems = state.items.filter((_, i) => i !== index)
				setState({ ...state, items: newItems })
			},
			reset: (to?: StateMapList<I>) => {
				setState(to ?? initialState)
			},
			set: (index: number, values: StateMapList<I>["items"][number]) => {
				const newItems = [...state.items].map((x, i) => i === index ? values : x)
				setState({ ...state, items: newItems })
			}
		}

		const fields = [] as FieldMapList<I>;
		for (const i in state.items) {
			const item = state.items[i]
			if (fields[i] === undefined) {
				fields[i] = {} as any
			}
			for (const key in item) {
				type ValueType = I[number][typeof key];
				const value = item[key].value;

				const actions: FieldActions<FieldValue> = {
					setMeta: (updates) => {
						const newItems = [...state.items]
						newItems[i][key] = { ...newItems[i][key], ...updates }
						setState({ ...state, items: newItems });
					}
				};

				const props: FieldProps<ValueType> = {
					onBlur: () => actions.setMeta({ isFocussed: false, wasTouched: true }),
					onChange: (e) => {
						if (typeof value === 'boolean' && 'checked' in e.target) {
							actions.setMeta({ value: e.target.checked });
							return;
						}
						if ('value' in e.target) {
							actions.setMeta({ value: e.target.value });
							return;
						}
					},
					onFocus: () => actions.setMeta({ isFocussed: true }),
					checked: typeof value === 'boolean' ? value : (undefined as any),
					value: typeof value === 'boolean' ? undefined : (value as any),
				};
				const meta = item[key];
				const isDirty = initialValues[i]?.[key] !== meta.value
				fields[i][key] = { meta: { ...meta, isDirty }, props, actions };
			}
		}

		const listMeta: Omit<FieldMeta<any>, "value"> & { isDirty: boolean } = {
			error: undefined,
			isDirty: false,
			isFocussed: false,
			wasTouched: false
		}

		for (const i in fields) {
			const item = fields[i]
			for (const key in item) {
				const { meta } = item[key]
				if (meta.error) listMeta.error = meta.error
				if (meta.isDirty) listMeta.isDirty = meta.isDirty
				if (meta.isFocussed) listMeta.isFocussed = meta.isFocussed
				if (meta.wasTouched) listMeta.wasTouched = meta.wasTouched
			}
		}

		return {
			fields,
			meta: listMeta,
			actions: listActions,
			setState
		}
	}

	return useForm
}