import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  dialect: 'sqlite',
  schema: './electron/main/db/schema',
  out: './drizzle',
})
