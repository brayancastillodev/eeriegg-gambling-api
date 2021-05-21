/**
 * @type {import('strapi-to-typescript')}
 */
const config = {
  input: ["./node_modules/strapi-plugin-users-permissions/models/", "api"],
  // inputGroup: './components/',
  output: "./.ts/models",
  enum: true,
  nested: true,
  // type: (fieldType) => { if(fieldType == 'datetime') return 'string'},
  interfaceName: (name) => `I${name[0].toUpperCase() + name.substr(1)}Model`,
  enumName: (name, interfaceName) =>
    `${interfaceName.substr(
      1,
      interfaceName.length - 6
    )}${name[0].toUpperCase()}${name.substr(1)}`,
  // excludeField: (interfaceName, fieldName) => fieldName === 'hide_field',
  addField: (interfaceName) => [
    { name: "_id", type: "string" },
    { name: "createdAt", type: "Date" },
  ],
};
module.exports = config;
