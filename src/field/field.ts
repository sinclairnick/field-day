import { atom, useAtom } from "jotai";
import { isEqual } from "lodash";
import { useEffect, useState } from "react";
import { FieldActions, FieldMeta, FieldProps, FieldValue, Widen } from "..";
import { usePrevious } from "../common/common.constants";
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
				const error = opts?.validate?.(state) ?? undefined
				setState({ ...state, error })
			}
		}

		const actions: FieldActions<FieldValue> = {
			setMeta: (updates) => {
				setState({ ...state, ...updates as any })
			},
		}

		const props: FieldProps<I> = {
			onBlur: () => {
				actions.setMeta({ isFocussed: false, wasTouched: true })
			},
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
		}

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

export const useField = <I extends FieldValue>(opts: UseFieldOptions<I>) => {

}