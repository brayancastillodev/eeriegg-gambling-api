"use strict";

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-controllers)
 * to customize this controller
 */

module.exports = {
  async deposit(ctx) {
    const { id } = ctx?.state?.user;

    if (!id) ctx.throw("unauthorized", 403)

    // TODO: process deposit here
  },
};
