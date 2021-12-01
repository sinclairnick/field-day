import { Box } from "@mui/material"
import { createFieldGroup, createFieldList } from "../../src"

const initialValues = Array.from({ length: 1000 }, (x) => ({ name: "Name" }))

const useFields = createFieldList(initialValues)
const useConfig = createFieldGroup({ validationDelay: "100" })


let start = 0
let end = 0

const PerformancePage = () => {
	const config = useConfig()
	const fields = useFields({
		validationDelay: Number(config.fields.validationDelay.meta.value)
	})


	return <Box>
		<Box my={4}>
			<p>Validation delay: {config.fields.validationDelay.meta.value} (took {new Date(end - start).getMilliseconds()})</p>
			<input type="range" {...config.fields.validationDelay.props} />
		</Box>
		{fields.fields.map(x => {
			end = 0
			return <input {...x.name.props} onChange={(e) => {
				start = Date.now()
				x.name.props.onChange(e)
			}} />
		})}
		<button>Add more</button>
	</Box>
}

export default PerformancePage