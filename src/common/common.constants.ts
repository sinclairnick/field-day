import { useEffect, useRef } from "react";
import cloneDeep from "lodash/cloneDeep"
import { FieldActions, FieldProps, FieldValue } from "..";

export const usePrevious = <T>(value: T) => {
	const ref = useRef<T | null>(null);
	useEffect(() => {
		ref.current = cloneDeep(value);
	});
	return ref.current;
}


export const generateFieldProps = <V extends FieldValue>(
	value: V, actions: FieldActions<FieldValue>
): FieldProps<V> => {
	const isFileList = Array.isArray(value)
	const isBoolean = typeof value === "boolean"

	const props: FieldProps<V> = {
		onBlur: () => {
			actions.setMeta({ isFocussed: false, wasTouched: true })
		},
		onChange: (e) => {
			if (typeof value === 'boolean' && 'checked' in e.target) {
				actions.setMeta({ value: e.target.checked });
				return;
			}
			if (isFileList && "files" in e.target) {
				actions.setMeta({ value: Array.from(e.target.files) })

			}
			if ('value' in e.target) {
				actions.setMeta({ value: e.target.value });
				return;
			}
		},
		onFocus: () => actions.setMeta({ isFocussed: true }),
	} as FieldProps<V>

	if (isFileList) {
		return props
	}

	if (isBoolean) {
		return { ...props, checked: value as any }
	}

	return { ...props, value: value as any }
}