// Update with your config settings.

/**
 * @type { Object.<string, import("knex").Knex.Config> }
 */
module.exports = {
  production: {
    client: 'sqlite3',
    connection: {
      filename: './db/data.sqlite3'
    },
    useNullAsDefault: true,
    migrations:{
      directory:'./db/migrations'
    }
  },
};
