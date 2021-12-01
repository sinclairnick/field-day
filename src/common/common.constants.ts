import { useEffect, useRef } from "react";
import cloneDeep from "lodash/cloneDeep"

export const usePrevious = <T>(value: T) => {
	const ref = useRef<T | null>(null);
	useEffect(() => {
		ref.current = cloneDeep(value);
	});
	return ref.current;
}