import { atom, useAtom } from "jotai";
import merge from "lodash/merge";
import cloneDeep from "lodash/cloneDeep";
import { useState } from "react";
import { FieldActions, FieldMeta, FieldValue } from "../common/common.types";
import { FieldMapList, StateMapList, ValueMapList } from "./field-list.types";
import { generateFieldProps, usePrevious } from "../common/common.constants";
import { UseFieldListOptions } from "..";
import { isEqual } from "lodash";
import { DeepPartial, Widen } from "../util/util.types";
import { useDelayedEffect } from "../util/use-delayed-effect";

const generateMetaFromValue = <F extends FieldValue>(value: F) => {
	const meta: FieldMeta<typeof value> = {
		error: undefined,
		isFocussed: false,
		value: value as any,
		wasTouched: false,
		customData: {}
	}
	return meta
}

const generateStateFromValues = <V extends ValueMapList>(valueMapList: V) => {
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
			const meta = generateMetaFromValue(value)

			initialState.items[i] = { ...(initialState.items[i] ?? {}), [key]: meta }
		}
	}

	return initialState;
};

class Wrapper<T extends ValueMapList> {
	wrapped() {
		return createFieldList<T>({} as T)
	}
}

export type UseFieldListHook<T extends ValueMapList> = ReturnType<Wrapper<T>["wrapped"]>
export type FieldListObject<T extends ValueMapList> = ReturnType<UseFieldListHook<T>>

export const createFieldList = <V extends ValueMapList>(_initialValues: V) => {
	type I = Widen<V>
	const _initialState = generateStateFromValues(_initialValues as I)
	const fieldListAtom = atom(_initialState);

	const useFieldList = (opts?: UseFieldListOptions<I>) => {
		const [initialValues, setInitialValues] = useState(_initialValues as I)
		const [initialState, setInitialState] = useState(_initialState)
		const { validationDelay = 100 } = opts ?? {}

		const [state, setState] = useAtom(fieldListAtom)

		const previousState = usePrevious(state)
		const hasStateChanged = !isEqual(previousState, state)

		const listActions = {
			validate: () => {
				const newState = { ...state }
				for (const idx in state.items) {
					const item = state.items[idx]
					const errors = opts?.validateRow?.(item, Number(idx), state.items)
					for (const key in state.items[idx]) {
						const error = errors?.[key]
						newState.items[idx][key].error = error ?? undefined
					}
				}
				const listError = opts?.validateList?.(state.items)
				newState.listError = listError ?? undefined
				setState(newState)
			},
			setInitialValues: (values: I, opts?: { resetState?: boolean }) => {
				const { resetState = true } = opts ?? {}
				setInitialValues(values)
				const newInitialState = generateStateFromValues(values)
				setInitialState(newInitialState)
				if (resetState) {
					setState(newInitialState)
				}
			},
			updateState: (to: DeepPartial<StateMapList<I>>) => {
				setState(merge({ ...initialState }, { ...to }))
			},
			setState,
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
				const newItems = cloneDeep(state.items).map((x, i) => i === index ? values : x)
				setState({ ...state, items: newItems })
			}
		}

		useDelayedEffect(() => {
			if (hasStateChanged) {
				listActions.validate()
			}
		}, [hasStateChanged, listActions.validate], validationDelay)

		const fields = [] as FieldMapList<I>;
		for (const i in state.items) {
			const item = state.items[i]
			if (fields[i] === undefined) {
				fields[i] = {} as any
			}
			for (const key in item) {
				const value = item[key].value;

				const actions: FieldActions<FieldValue> = {
					setMeta: (updates) => {
						const newItems = [...state.items]
						newItems[i][key] = { ...newItems[i][key], ...updates }
						setState({ ...state, items: newItems });
					}
				};

				const props = generateFieldProps(value, actions)

				const meta = item[key];
				const isDirty = initialValues[i]?.[key] !== meta.value
				fields[i][key] = { meta: { ...meta, isDirty }, props, actions };
			}
		}

		const listMeta: Omit<FieldMeta<any>, "value"> & { isDirty: boolean } = {
			error: undefined,
			isDirty: false,
			isFocussed: false,
			wasTouched: false,
			customData: state.customData
		}

		for (const i in fields) {
			const item = fields[i]
			for (const key in item) {
				const { meta } = item[key]
				if (listMeta.error === undefined && meta.error !== undefined) listMeta.error = meta.error
				if (meta.isDirty) listMeta.isDirty = meta.isDirty
				if (meta.isFocussed) listMeta.isFocussed = meta.isFocussed
				if (meta.wasTouched) listMeta.wasTouched = meta.wasTouched
			}
		}

		return {
			fields,
			meta: listMeta,
			actions: listActions,
		}
	}

	return useFieldList
}