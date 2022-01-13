import { renderHook, act } from '@testing-library/react-hooks'
import { createFieldList } from "./field-list"

describe("Field list", () => {

	describe(".move", () => {
		test('Should move item forwards', () => {
			const useFieldList = createFieldList([
				{ name: "Thing 1" },
				{ name: "Thing 2" },
				{ name: "Thing 3" },
			])
			const { result } = renderHook(() => useFieldList())

			act(() => {
				result.current.actions.move(0, 2)
			})

			expect(result.current.fields[0].name.meta.value).toBe("Thing 2")
			expect(result.current.fields[1].name.meta.value).toBe("Thing 3")
			expect(result.current.fields[2].name.meta.value).toBe("Thing 1")
		})

		test('Should move item backwards', () => {
			const useFieldList = createFieldList([
				{ name: "Thing 1" },
				{ name: "Thing 2" },
				{ name: "Thing 3" },
			])
			const { result } = renderHook(() => useFieldList())

			act(() => {
				result.current.actions.move(2, 0)
			})

			expect(result.current.fields[0].name.meta.value).toBe("Thing 3")
			expect(result.current.fields[1].name.meta.value).toBe("Thing 1")
			expect(result.current.fields[2].name.meta.value).toBe("Thing 2")
		})

		test("Plays nicely with .remove", () => {
			const useFieldList = createFieldList([
				{ name: "Thing 1" },
				{ name: "Thing 2" },
				{ name: "Thing 3" },
			])
			const { result } = renderHook(() => useFieldList())

			act(() => {
				result.current.actions.move(2, 0)
			})
			act(() => {
				result.current.actions.remove(0)
			})

			expect(result.current.fields[0].name.meta.value).toBe("Thing 1")
			expect(result.current.fields[1].name.meta.value).toBe("Thing 2")
			expect(result.current.fields[2]).toBeUndefined()
		})

		test("Plays nicely with .append", () => {
			const useFieldList = createFieldList([
				{ name: "Thing 1" },
				{ name: "Thing 2" },
				{ name: "Thing 3" },
			])
			const { result } = renderHook(() => useFieldList())

			act(() => {
				result.current.actions.move(1, 2)
			})
			act(() => {
				result.current.actions.append({ name: "Thing 4" })
			})

			expect(result.current.fields[0].name.meta.value).toBe("Thing 1")
			expect(result.current.fields[1].name.meta.value).toBe("Thing 3")
			expect(result.current.fields[2].name.meta.value).toBe("Thing 2")
			expect(result.current.fields[3].name.meta.value).toBe("Thing 4")
		})

		test("Plays nicely with .insert", () => {
			const useFieldList = createFieldList([
				{ name: "Thing 1" },
				{ name: "Thing 2" },
				{ name: "Thing 3" },
			])
			const { result } = renderHook(() => useFieldList())

			act(() => {
				result.current.actions.move(0, 1)
			})
			act(() => {
				result.current.actions.insert(1, { name: "Thing 4" })
			})

			expect(result.current.fields[0].name.meta.value).toBe("Thing 2")
			expect(result.current.fields[1].name.meta.value).toBe("Thing 4")
			expect(result.current.fields[2].name.meta.value).toBe("Thing 1")
			expect(result.current.fields[3].name.meta.value).toBe("Thing 3")
		})


	})

	describe("Ids", () => {

		test("Retains list item ids upon moving", () => {
			const useFieldList = createFieldList([
				{ name: "Thing 1" },
				{ name: "Thing 2" },
				{ name: "Thing 3" },
			])
			const { result } = renderHook(() => useFieldList())

			const initialIds = result.current.fields.map(f => f.name.meta._id)

			act(() => {
				result.current.actions.move(0, 1)
			})
			const resultingIds = result.current.fields.map(f => f.name.meta._id)

			// Reordered IDs
			expect(initialIds[0]).toBe(resultingIds[1])
			expect(initialIds[1]).toBe(resultingIds[0])
			expect(initialIds[2]).toBe(resultingIds[2])
		})

	})

})