// this file connects to the remote Prisma DB and gives us the ability to query it with JS

const { Prisma } = require('prisma-binding')

const db = new Prisma({
	typeDefs: 'src/generated/prisma.graphql',
	endpoint:
		process.env.DATABASE === 'production' ? process.env.PRISMA_ENDPOINT_PRODUCTION : process.env.PRISMA_ENDPOINT_DEV,
	secret: process.env.DATABASE === 'production' ? process.env.PRISMA_SECRET_PRODUCTION : process.env.PRISMA_SECRET_DEV,
	debug: false,
})

module.exports = db
