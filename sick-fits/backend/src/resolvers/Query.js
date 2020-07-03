const { hasPermission } = require('../utils')

const { forwardTo } = require('prisma-binding')
const { createOrder } = require('./Mutation')

const Query = {
	items: forwardTo('db'),
	item: forwardTo('db'),
	itemsConnection: forwardTo('db'),
	me(parent, args, ctx, info) {
		// check if htere is a current user
		if (!ctx.request.userId) {
			return null
		}
		return ctx.db.query.user(
			{
				where: {
					id: ctx.request.userId,
				},
			},
			info
		)
	},
	/*
    async items(parent, args, ctx, info) {
        const items = await ctx.db.query.items();
        return items;
    }
    */
	async users(parent, args, ctx, info) {
		// 1. check if they are logged in
		if (!ctx.request.userId) {
			throw new Error('You must be logged in')
		}
		// 2. check if the user has the permissions to query all the users
		hasPermission(ctx.request.user, ['ADMIN', 'PERMISSIONUPDATE'])

		// 3. if they do, query all the users
		return ctx.db.query.users({}, info)
	},

	async order(parent, args, ctx, info) {
		// 1. Make sure they are logged in
		if (!ctx.request.userId) {
			throw new Error('You are not logged in')
		}
		// 2. Query te current order
		const order = await ctx.db.query.order(
			{
				where: { id: args.id },
			},
			info
		)
		// 3. Check if htey have the permissions to see this order
		const ownsOrder = order.user.id == ctx.request.userId
		const hasPermission = ctx.request.user.permissions.includes('ADMIN')
		if (!ownsOrder || !hasPermission) throw new Error("you can't see this")
		// 4. Return this order
		return order
	},

	async orders(parent, args, ctx, info) {
		const { userId } = ctx.request
		if (!userId) throw new Error('You must be signed in!')
		return await ctx.db.query.orders(
			{
				where: {
					user: { id: userId },
				},
			},
			info
		)
	},
}

module.exports = Query
