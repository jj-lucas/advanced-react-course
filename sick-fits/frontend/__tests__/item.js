import ItemComponent from '../components/Item'
import { shallow } from 'enzyme'
import { ExpandAbstractTypes } from 'graphql-tools'
import { isExists } from 'date-fns'
import toJSON from 'enzyme-to-json'

const fakeItem = {
	id: 'ABC123',
	title: 'A Cool Item',
	price: 5000,
	description: 'This item is really cool!',
	image: 'dog.jpg',
	largeImage: 'largedog.jpg',
}

describe('<Item/>', () => {
	/*it('renders and displays properly', () => {
		const wrapper = shallow(<ItemComponent item={fakeItem} />)
		const PriceTag = wrapper.find('PriceTag')
		expect(PriceTag.children().text()).toBe('$50')
		// console.log(wrapper.debug())
		expect(wrapper.find('Title a').text()).toBe(fakeItem.title)
		const img = wrapper.find('img')
		expect(img.props().src).toBe(fakeItem.image)
		expect(img.props().alt).toBe(fakeItem.title)

		const buttonList = wrapper.find('.buttonList')
		expect(buttonList.children()).toHaveLength(3)

		expect(buttonList.find('Link')).toHaveLength(1)
		expect(buttonList.find('Link').exists()).toBe(true)
		expect(buttonList.find('Link')).toBeTruthy
    })*/

	it('renders and matches the snapshot', () => {
		const wrapper = shallow(<ItemComponent item={fakeItem} />)
		expect(toJSON(wrapper)).toMatchSnapshot()
	})
})
