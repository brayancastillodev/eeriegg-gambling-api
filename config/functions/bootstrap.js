"use strict";
require("module-alias/register");
const {
  SocketHandler,
} = require("../../packages/services/socket/socket-handler");
/**
 * An asynchronous bootstrap function that runs before
 * your application gets started.
 *
 * This gives you an opportunity to set up your data model,
 * run jobs, or perform some special logic.
 *
 * See more details here: https://strapi.io/documentation/developer-docs/latest/setup-deployment-guides/configurations.html#bootstrap
 */

module.exports = () => {
  new SocketHandler("default", strapi);
};
