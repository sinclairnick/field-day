import { atom, useAtom } from "jotai";
import { isEqual } from "lodash";
import { useState } from "react";
import { FieldActions, FieldMeta, FieldValue } from "..";
import { generateFieldProps, usePrevious } from "../common/common.constants";
import { useDelayedEffect } from "../util/use-delayed-effect";
import { Widen } from "../util/util.types";
import { FieldHelpers } from "./field.constants";
import { UseFieldOptions } from "./field.types";



class Wrapper<T extends FieldValue> {
	wrapped() {
		return createField<T>({} as T)
	}
}
export type UseFieldHook<T extends FieldValue> = ReturnType<Wrapper<T>["wrapped"]>
export type FieldObject<T extends FieldValue> = ReturnType<UseFieldHook<T>>

export const createField = <V extends FieldValue>(_initialValue: V) => {
	type I = Widen<V>
	const _initialState = FieldHelpers.generateMetaFromValue(_initialValue)
	const fieldAtom = atom(_initialState as FieldMeta<I>)

	const useField = (opts?: UseFieldOptions<I>) => {
		const [initialValue, setInitialValue] = useState(_initialValue as I)
		const [initialState, setInitialState] = useState(_initialState as FieldMeta<I>)
		const [state, setState] = useAtom(fieldAtom)
		const { validationDelay = 100 } = opts ?? {}

		const { value } = state

		const previousState = usePrevious(state)
		const hasStateChange = !isEqual(previousState, state)

		const otherActions = {
			reset: () => { setState(initialState) },
			setState,
			setInitialValue: (
				value: I,
				opts?: {
					resetState?: boolean
					defaultMeta?: Parameters<typeof FieldHelpers["generateMetaFromValue"]>[1]
				}
			) => {
				const { resetState = true } = opts ?? {}
				setInitialValue(value)
				const newInitialState = FieldHelpers.generateMetaFromValue(value, opts?.defaultMeta)
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

		useDelayedEffect(() => {
			if (hasStateChange) {
				otherActions.validate()
			}
		}, [hasStateChange, otherActions.validate], validationDelay)

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