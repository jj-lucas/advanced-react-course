const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { randomBytes } = require("crypto");
const { promisify } = require("util");
const { transport, makeANiceEmail } = require("../mail");
const { hasPermission } = require("../utils");

const Mutations = {
  async createItem(parent, args, ctx, info) {
    if (!ctx.request.userId) {
      throw new Error("You must be logged in to create an item");
    }

    const item = await ctx.db.mutation.createItem(
      {
        data: {
          // this is how we provide relationships
          user: {
            connect: {
              id: ctx.request.userId
            }
          },
          ...args
        }
      },
      info
    );

    return item;
  },

  updateItem(parent, args, ctx, info) {
    // take a copy of updates
    const updates = { ...args };
    // remove the ID from the updates
    delete updates.id;
    // run the update method
    return ctx.db.mutation.updateItem(
      {
        data: updates,
        where: {
          id: args.id
        }
      },
      info
    );
  },

  async deleteItem(parent, args, ctx, info) {
    const where = { id: args.id };
    // 1. find hte item
    const item = await ctx.db.query.item(
      { where },
      `{
            id
            title
            user {
              id
            }
        }
        `
    );
    // 2. check if they own the item or have the permissions
    const ownsItem = item.user.id === ctx.request.userId;
    const hasPermission = ctx.request.user.permissions.some(permission =>
      ["ADMIN", "ITEMDELETE"].includes(permission)
    );
    if (!ownsItem && !hasPermission) {
      throw new Error("You don't have permission to do this");
    }
    // 3. delete it
    return ctx.db.mutation.deleteItem({ where }, info);
  },

  async signup(parent, args, ctx, info) {
    args.email = args.email.toLowerCase();
    // hash the passsword
    const password = await bcrypt.hash(args.password, 10);
    // create the user in the DB
    const user = await ctx.db.mutation.createUser(
      {
        data: {
          ...args,
          password,
          permissions: { set: ["USER"] }
        }
      },
      info
    );

    // create JWT token
    const token = jwt.sign({ userId: user.id }, process.env.APP_SECRET);
    // set the JWT as a cooke on the response
    ctx.response.cookie("token", token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 365 // 1 year
    });

    // return the user to the browser
    return user;
  },

  async signin(parent, { email, password }, ctx, info) {
    // check if there is a user with that email
    const user = await ctx.db.query.user({ where: { email } });
    if (!user) {
      throw new Error(`No such user for ${email}`);
    }

    // check if the password matches
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      throw new Error("Invalid password");
    }

    // generate a JWT token
    const token = jwt.sign({ userId: user.id }, process.env.APP_SECRET);

    // set a cookie with that token
    ctx.response.cookie("token", token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 365 // 1 year
    });

    // return the user
    return user;
  },

  signout(parent, args, ctx, info) {
    ctx.response.clearCookie("token");
    return {
      message: "Goodbye"
    };
  },

  async requestReset(parent, args, ctx, info) {
    // 1. Check if this is a real user
    const user = await ctx.db.query.user({ where: { email: args.email } });
    if (!user) {
      throw new Error(`No such user found for email ${args.email}`);
    }
    // 2. Set a reset token and expiry on that user
    const randomBytesPromisified = promisify(randomBytes);
    const resetToken = (await randomBytesPromisified(10)).toString("hex");
    const resetTokenExpirty = Date.now() + 60 * 60 * 1000; // 1 hour from now
    const res = await ctx.db.mutation.updateUser({
      where: { email: args.email },
      data: { resetToken, resetTokenExpirty }
    });
    // 3. Email them a reset token
    const mailRes = await transport.sendMail({
      from: "lucas@lucsali.com",
      to: user.email,
      subject: "Your password reset",
      html: makeANiceEmail(`Your password reset token is here!
      \n\n
      <a href="${process.env.FRONTEND_URL}/reset?resetToken=${resetToken}">
        Click here to reset
      </a>`)
    });
    // 4.return the message
    return { message: "Thanks!" };
  },

  async resetPassword(parent, args, ctx, info) {
    // 1. check if passwords match
    if (args.password !== args.confirmPassword) {
      throw new Error("Passwords don't match");
    }
    // 2. check if it's a legit reset token
    // 3. check if it's expired
    const [user] = await ctx.db.query.users({
      where: {
        resetToken: args.resetToken,
        resetTokenExpirty_gte: Date.now() - 60 * 60 * 1000
      }
    });
    if (!user) {
      throw new Error("This token is either invalid or expired");
    }
    // 4. hash the new password
    const password = await bcrypt.hash(args.password, 10);
    // 5. save the new password to the user and remove old reset token fields
    const updatedUser = await ctx.db.mutation.updateUser({
      where: { email: user.email },
      data: {
        password,
        resetToken: null,
        resetTokenExpirty: null
      }
    });
    // 6. generate JWT
    const token = jwt.sign({ userId: updatedUser.id }, process.env.APP_SECRET);
    // 7. set the JWT cookie
    ctx.response.cookie("token", token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 365
    });
    // 8. return the new user
    return updatedUser;
  },

  async updatePermissions(parent, args, ctx, info) {
    // 1. Check if htey are logged in
    if (!ctx.request.userId) {
      throw new Error("you must be logged in!");
    }
    // 2. Query the current user
    const currentUser = await ctx.db.query.user(
      {
        where: {
          id: ctx.request.userId
        }
      },
      info
    );
    // 3. Check if they have permissions to do this
    hasPermission(currentUser, ["ADMIN", "PERMISSIONUPDATE"]);
    // 4. Update the permissions
    return ctx.db.mutation.updateUser(
      {
        data: {
          permissions: {
            // because permissions is an enum in the prisma data model, use this syntax
            set: args.permissions
          }
        },
        where: {
          id: args.userId
        }
      },
      info
    );
  }
};

module.exports = Mutations;
