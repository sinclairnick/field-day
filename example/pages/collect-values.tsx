import { Box } from "@mui/material"
import { createField, createFieldList } from "../../src"

const useField = createField("")
const useFieldList = createFieldList<{ name: string }[]>([])

const CollectValuesPage = () => {
	const field = useField()
	const fieldList = useFieldList()

	return <Box>
		<input {...field.props} />
		<pre>{JSON.stringify(field.actions.collectValues())}</pre>


		<button onClick={() => fieldList.actions.append({ name: "" })}>Add</button>
		{fieldList.fields.map((field, i) => {
			return <Box>
				<input key={i} {...field.name.props} />
			</Box>
		})}
		<pre>{JSON.stringify(fieldList.actions.collectValues())}</pre>
	</Box>
}

export default CollectValuesPage