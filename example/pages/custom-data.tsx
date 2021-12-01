import { Box } from "@mui/material"
import { createField, createFieldGroup, createFieldList } from "../../src"

const useField = createField("")
const useFieldGroup = createFieldGroup({ name1: "", name2: "", name3: "" })
const useFieldList = createFieldList<{ name: string }[]>([])

const CustomDataPage = () => {
	const single = useField()
	const group = useFieldGroup()
	const list = useFieldList()


	return <Box>
		<h1>Custom data</h1>

		<fieldset>
			<legend>Single field</legend>
			<input {...single.props} />
			<button onClick={() => single.actions.setMeta({
				customData: { count: (single.meta.customData.count ?? 0) + 1 }
			})}>
				Add count ({single.meta.customData.count ?? 0})
			</button>
		</fieldset>

		<fieldset>
			<legend>Field group</legend>
			<Box display="flex">
				{Object.keys(group.fields).map((key, i) => {
					const field = group.fields[key as keyof typeof group["fields"]]
					const count = field.meta.customData.count ?? 0

					return <button key={i} onClick={() => field.actions.setMeta({ customData: { count: count + 1 } })}>Add ({count})</button>
				})}
			</Box>
		</fieldset>

		<fieldset>
			<legend>Field list</legend>
			{list.fields.map((field, i) => {
				const count = field.name.meta.customData.count ?? 0
				
				return <button onClick={() => {
					field.name.actions.setMeta({ customData: { count: count + 1 } })
				}}>Add ({count})</button>
			})}

			<button onClick={() => list.actions.append({ name: "" })}>Add row</button>

		</fieldset>




	</Box>
}

export default CustomDataPage