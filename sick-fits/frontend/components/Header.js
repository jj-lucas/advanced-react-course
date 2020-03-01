import Link from 'next/link'
import styled from 'styled-components'
import Router from 'next/router'
import NProgress from 'nprogress'
import Nav from './Nav'

Router.onRouteChangeStart = () => {
	NProgress.start()
	console.log('onRouteChangeStart')
}
Router.onRouteChangeComplete = () => {
	NProgress.done()
	console.log('onRouteChangeComplete')
}
Router.onRouteChangeError = () => {
	NProgress.done()
	console.log('onRouteChangeError')
}

const Logo = styled.h1`
	font-size: 4rem;
	margin-left: 2rem;
	position: relative;
	z-index: 2;
	transform: skew(-7deg);

	a {
		padding: 0.5rem 1rem;
		background: ${props => props.theme.red};
		color: white;
		text-transform: uppercase;
		text-decoration: none;

		@media (max-width: 1300px) {
			margin: 0;
			text-align: center;
		}
	}
`

const Header = () => (
	<div>
		<div className="bar">
			<Logo>
				<Link href="/">
					<a>Sick fits</a>
				</Link>
			</Logo>
			<Nav />
		</div>
		<div className="sub-bar">
			<p>Search</p>
		</div>
		<div>Cart</div>
	</div>
)

export default Header
