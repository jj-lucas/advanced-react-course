import styled from 'styled-components'
import Signup from '../components/Signup'
import SignIn from '../components/SignIn'

const columns = styled.div`
	display: grid;
	grid-template-columns: repeat() (auto-fit, minmax() (300px, 1fr));
	grid-gap: 20px;
`

const SignupPage = props => (
	<div>
		<Signup />
		<SignIn />
	</div>
)

export default SignupPage
