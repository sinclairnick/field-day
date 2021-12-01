import { useEffect } from "react"

export const useDelayedEffect = (fn: () => (() => any) | void, deps: any[], ms: number) => {
	useEffect(() => {
		const timeout = setTimeout(fn, ms)
		return () => clearTimeout(timeout)

	}, [...deps, ms])
}