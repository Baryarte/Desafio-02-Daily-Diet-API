import fastify from 'fastify'
import knex from 'knex'
import { usersRoutes } from './routes/user'
import cookie from '@fastify/cookie'
import { mealsRoutes } from './routes/meals'

export const app = fastify()

app.register(cookie)

app.register(usersRoutes, {
  prefix: 'users',
})

app.register(mealsRoutes, {
  prefix: 'meals',
})

app.get('/a', async (request, reply) => {
  const test = await knex('sqlite_schema').select('*')

  return test
})
