import { createField } from '../../src/field/field';
import { createFieldGroup } from '../../src/field-group/field-group';
import { createFieldList } from '../../src/field-list/field-list';
import { Box, } from '@mui/material';

const useProfileGroup = createFieldGroup({
	name: '',
	age: '',
	isOver18: false,
});
const useFriendsList = createFieldList<{
	name: string,
	relationship: string
}[]>([{ name: "Jimmy", relationship: "Best friend" }])

const useTitle = createField("")

const Index = () => {
	const title = useTitle({ validate: (meta) => meta.value.length > 10 ? "Title too long" : undefined })
	const profile = useProfileGroup({
		validate: (items) => {
			const { isOver18, age } = items
			const invalidAge = isOver18.value && Number(age.value) < 18
			if (invalidAge) {
				return {
					age: "Must be over 18"
				}
			}
		}
	});
	const friends = useFriendsList({
		validateList: (meta) => {
			if (meta.length > 3) {
				return "You have too many friends, sorry"
			}
		},
		validateRow: (meta) => {
			if (meta.name.value === "Nigel") {
				return { name: "Sorry, this guy has no mates" }
			}
		}
	})

	const handleSetInitialValues = () => {
		profile.actions.setInitialValues({ isOver18: true, age: "12", name: "Johnny" })
	}

	return (
		<Box>
			<Box mb={2}>
				<fieldset>
					<h1>Field ("Title")</h1>
					<p>Title meta</p>
					<pre>{JSON.stringify(title.meta)}</pre>
					<label htmlFor='title'>Title</label>
					<input id="title" {...title.props} />
				</fieldset>
			</Box>

			<Box mb={2}>
				<fieldset>
					<h1>Field group ("Profile")</h1>
					<p>Name meta</p>
					<pre>{JSON.stringify(profile.fields.name.meta)}</pre>
					<p>Age meta</p>
					<pre>{JSON.stringify(profile.fields.age.meta)}</pre>
					<p>Is over 18 meta</p>
					<pre>{JSON.stringify(profile.fields.isOver18.meta)}</pre>
					<p>Form meta</p>
					<pre>{JSON.stringify(profile.meta)}</pre>

					<label htmlFor="name">Name</label>
					<input id="name" {...profile.fields.name.props} />
					<label htmlFor="age">Age</label>
					<input id="age" {...profile.fields.age.props} />
					<label htmlFor="isOver18">Is over 18</label>
					<input
						id="isOver18"
						type="checkbox"
						{...profile.fields.isOver18.props}
					/>
					<button onClick={handleSetInitialValues}>Set initial state</button>
				</fieldset>

			</Box>

			<Box mb={2}>
				<fieldset>
					<h1>Field list ("Friends")</h1>
					<p>Form meta</p>
					<pre>{JSON.stringify(friends.meta)}</pre>
					{friends.fields.map((friend, i) => <Box key={i}>
						<input {...friend.name.props} />
						<select {...friend.relationship.props}>
							<option>Best friend</option>
							<option>Pretty good friend</option>
							<option>Kind of an asshole</option>
						</select>
						<button onClick={() => friends.actions.remove(i)}>Remove</button>
						<p>Name meta</p>
						<pre>{JSON.stringify(friend.name.meta)}</pre>
						<p>Relationship meta</p>
						<pre>{JSON.stringify(friend.relationship.meta)}</pre>
					</Box>)}
					<button onClick={() => friends.actions.append({ name: "", relationship: "" })}>Add</button>
				</fieldset>
			</Box>
		</Box >
	);
};

export default Index;
