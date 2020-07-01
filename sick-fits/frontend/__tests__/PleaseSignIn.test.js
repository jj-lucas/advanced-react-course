import PleaseSignIn from '../components/PleaseSignIn'
import { CURRENT_USER_QUERY } from '../components/User'
import { mount } from 'enzyme'
import toJSON from 'enzyme-to-json'
import wait from 'waait'
import { MockedProvider } from 'react-apollo/test-utils'
import { fakeUser } from '../lib/testUtils'

const notSignedInMocks = [
	{
		request: { query: CURRENT_USER_QUERY },
		result: { data: { me: null } },
	},
]

const signedInMocks = [
	{
		request: { query: CURRENT_USER_QUERY },
		result: { data: { me: fakeUser() } },
	},
]

describe('<PleaseSignIn/>', () => {
	it('renders the sign in diealog to logged out users', async () => {
		const Hey = () => <p>Hey!</p>
		const wrapper = mount(
			<MockedProvider mocks={notSignedInMocks}>
				<PleaseSignIn>
					<Hey />
				</PleaseSignIn>
			</MockedProvider>
		)
		await wait()
		wrapper.update()
		// console.log(wrapper.debug())
		expect(wrapper.text()).toContain('Please sign in before continuing')
		expect(wrapper.find('SignIn').exists()).toBe(true)
	})

	it('renders the child componennt when the user is signed in', async () => {
		const Hey = () => <p>Hey!</p>
		const wrapper = mount(
			<MockedProvider mocks={signedInMocks}>
				<PleaseSignIn>
					<Hey />
				</PleaseSignIn>
			</MockedProvider>
		)
		await wait()
		wrapper.update()
		expect(wrapper.contains(<Hey />)).toBe(true)
	})
})
