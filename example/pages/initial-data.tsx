import { Box } from "@mui/material"
import { useEffect, useState } from "react"
import { createField } from "../../src"

const useField = createField("")
const useField2 = createField("")

const InitialDataPage = () => {
	const [initialValue, setInitialValue] = useState("Will change in 2 seconds")
	const field2 = useField2({
		initialValue: {
			value: initialValue,
			defaultMeta: { wasTouched: true }
		}
	})

	useEffect(() => {
		setTimeout(() => {
			setInitialValue("Changed!")
		}, 2000)
	}, [])

	return <Box>
		<fieldset>
			<legend>Field 2</legend>
			<input {...field2.props} />
			<pre>{JSON.stringify(field2.meta)}</pre>
			<pre>{JSON.stringify(field2.actions.getInitialValue())}</pre>
		</fieldset>

	</Box>
}

export default InitialDataPage