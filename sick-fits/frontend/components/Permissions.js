import { Query, Mutation } from 'react-apollo'
import Error from './ErrorMessage'
import gql from 'graphql-tag'
import Table from './styles/Table'
import SickButton from './styles/SickButton'
import PropTypes from 'prop-types'

const possiblePermissions = ['ADMIN', 'USER', 'ITEMCREATE', 'ITEMUPDATE', 'ITEMDELETE', 'PERMISSIONUPDATE']

const UPDATE_PERMISSIONS_MUTATION = gql`
	mutation updatePermissions($permissions: [Permission], $userId: ID!) {
		updatePermissions(permissions: $permissions, userId: $userId) {
			id
			permissions
			name
			email
		}
	}
`

const ALL_USERS_QUERY = gql`
	query {
		users {
			id
			name
			email
			permissions
		}
	}
`

const Permissions = props => (
	<Query query={ALL_USERS_QUERY}>
		{({ data, loading, error }) => (
			<div>
				<Error error={error} />
				<div>
					<h2>Manage permissions</h2>
					<Table>
						<thead>
							<tr>
								<th>Name</th>
								<th>Email</th>
								{possiblePermissions.map(permission => (
									<th key={permission}>{permission}</th>
								))}
								<th></th>
							</tr>
						</thead>
						<tbody>
							{data.users.map(user => (
								<User key={user.id} user={user} />
							))}
						</tbody>
					</Table>
				</div>
			</div>
		)}
	</Query>
)

class User extends React.Component {
	static propTypes = {
		user: PropTypes.shape({
			name: PropTypes.string,
			email: PropTypes.string,
			id: PropTypes.string,
			permissions: PropTypes.array,
		}).isRequired,
	}
	state = {
		permissions: this.props.user.permissions,
	}
	handlePermissionChange = e => {
		console.log(e.target)
		const checkbox = e.target
		// take a copy of the current permissions
		let updatedPermissions = [...this.state.permissions]
		// figure out id we need to remove or add this permission
		if (checkbox.checked) {
			// add it in!
			updatedPermissions.push(checkbox.value)
		} else {
			// remove it
			updatedPermissions = updatedPermissions.filter(permission => permission !== checkbox.value)
		}
		this.setState({ permissions: updatedPermissions })
	}
	render() {
		const { id, name, email, permissions } = this.props.user
		return (
			<Mutation
				mutation={UPDATE_PERMISSIONS_MUTATION}
				variables={{
					permissions: this.state.permissions,
					userId: this.props.user.id,
				}}>
				{(updatePermission, { loading, error }) => (
					<>
						{error && (
							<tr>
								<td>
									<Error error={error} />
								</td>
							</tr>
						)}
						<tr>
							<td>{name}</td>
							<td>{email}</td>
							{possiblePermissions.map(permission => (
								<td key={permission}>
									<label htmlFor={`${id}-permission-${permission}`}>
										<input
											id={`${id}-permission-${permission}`}
											type="checkbox"
											checked={this.state.permissions.includes(permission)}
											value={permission}
											onChange={this.handlePermissionChange}
										/>
									</label>
								</td>
							))}
							<td>
								<SickButton type="button" disabled={loading} onClick={updatePermission}>
									Updat{loading ? 'ing' : 'e'}
								</SickButton>
							</td>
						</tr>
					</>
				)}
			</Mutation>
		)
	}
}

export default Permissions
