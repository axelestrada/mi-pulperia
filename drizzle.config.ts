import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  dialect: 'sqlite',
  schema: './electron/db/schema',
  out: './electron/db/migrations',
  dbCredentials: {
    url: 'mi-pulperia.db',
  },
})
