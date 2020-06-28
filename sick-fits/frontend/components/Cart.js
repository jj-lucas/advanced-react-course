import React from 'react'
import CartStyles from './styles/CartStyles'
import Supreme from './styles/Supreme'
import CloseButton from './styles/CloseButton'
import SickButton from './styles/SickButton'
import { Query, Mutation } from 'react-apollo'
import gql from 'graphql-tag'
import User from './User'
import CartItem from './CartItem'
import caclTotalPrice from '../lib/calcTotalPrice'
import formatMoney from '../lib/formatMoney'

const LOCAL_STATE_QUERY = gql`
	query {
		cartOpen @client
	}
`
const TOGGLE_CART_MUTATION = gql`
	mutation {
		toggleCart @client
	}
`
const Cart = () => {
	return (
		<User>
			{({ data: { me } }) => {
				if (!me) return null
				console.log(me)
				return (
					<Mutation mutation={TOGGLE_CART_MUTATION}>
						{toggleCart => (
							<Query query={LOCAL_STATE_QUERY}>
								{({ data }) => (
									<CartStyles open={data.cartOpen}>
										<header>
											<CloseButton title="close" onClick={toggleCart}>
												&times;
											</CloseButton>
											<Supreme>{me.name}'s Cart</Supreme>
											<p>
												You have {me.cart.length} Item{me.cart.length === 1 ? '' : 's'} in your cart
											</p>
										</header>
										<ul>
											{me.cart.map(cartItem => (
												<CartItem key={cartItem.id} cartItem={cartItem} />
											))}
										</ul>
										<footer>
											<p>{formatMoney(caclTotalPrice(me.cart))}</p>
											<SickButton>Checkout</SickButton>
										</footer>
									</CartStyles>
								)}
							</Query>
						)}
					</Mutation>
				)
			}}
		</User>
	)
}

export default Cart
export { LOCAL_STATE_QUERY, TOGGLE_CART_MUTATION }