import { Box } from "@mui/material"
import { createField } from "../../src"

const useField = createField("")

const InitialDataPage = () => {
	const field = useField()

	return <Box>
		<input {...field.props} />
		<button onClick={field.actions.reset}>Reset to initial state</button>
		<button onClick={() => field.actions.setInitialValue(
			field.meta.value,
			{
				defaultMeta: {
					wasTouched: true,
				}
			}
		)}>
			Set initial with wasTouched = true
		</button>

		<pre>{JSON.stringify(field.meta)}</pre>

	</Box>
}

export default InitialDataPage