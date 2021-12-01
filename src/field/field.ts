import { atom, useAtom } from "jotai";
import { isEqual } from "lodash";
import { useEffect, useState } from "react";
import { FieldActions, FieldMeta, FieldValue } from "..";
import { generateFieldProps, usePrevious } from "../common/common.constants";
import { Widen } from "../util/util.types";
import { UseFieldOptions } from "./field.types";

const generateMetaFromValue = <V extends FieldValue>(value: V) => {
	const meta: FieldMeta<V> = {
		error: undefined,
		isFocussed: false,
		value: value as any,
		wasTouched: false,
	}
	return meta
}


class Wrapper<T extends FieldValue> {
	wrapped() {
		return createField<T>({} as T)
	}
}
export type UseFieldHook<T extends FieldValue> = ReturnType<Wrapper<T>["wrapped"]>
export type FieldObject<T extends FieldValue> = ReturnType<UseFieldHook<T>>

export const createField = <V extends FieldValue>(_initialValue: V) => {
	type I = Widen<V>
	const _initialState = generateMetaFromValue(_initialValue)
	const fieldAtom = atom(_initialState as FieldMeta<I>)

	const useField = (opts?: UseFieldOptions<I>) => {
		const [initialValue, setInitialValue] = useState(_initialValue as I)
		const [initialState, setInitialState] = useState(_initialState as FieldMeta<I>)
		const [state, setState] = useAtom(fieldAtom)

		const { value } = state

		const previousState = usePrevious(state)
		const hasStateChange = !isEqual(previousState, state)

		const otherActions = {
			reset: () => { setState(initialState) },
			setState,
			setInitialValue: (value: I, opts?: { resetState?: boolean }) => {
				const { resetState = true } = opts ?? {}
				setInitialValue(value)
				const newInitialState = generateMetaFromValue(value)
				setInitialState(newInitialState)
				if (resetState) {
					setState(newInitialState)
				}
			},
			validate: () => {
				const error = opts?.validate?.(state)
				setState({ ...state, error: error ?? undefined })
			}
		}

		const actions: FieldActions<FieldValue> = {
			setMeta: (updates) => {
				setState({ ...state, ...updates as any })
			},
		}

		const props = generateFieldProps(value, actions)

		useEffect(() => {
			if (hasStateChange) {
				otherActions.validate()
			}
		}, [hasStateChange, otherActions.validate])

		return {
			actions: {
				...actions,
				...otherActions
			},
			props,
			meta: { ...state, isDirty: initialValue !== state.value }
		}

	}

	return useField
}