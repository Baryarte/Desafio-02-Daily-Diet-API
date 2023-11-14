import fastify from 'fastify'
import knex from 'knex'
import { usersRoutes } from './routes/user'
import cookie from '@fastify/cookie'
import { mealsRoutes } from './routes/meals'
import { randomUUID } from 'node:crypto'
import { checkSessionIdExistsOrCreate } from './middlewares/check-session-id-exists-or-create'

export const app = fastify()

app.register(cookie)

app.addHook('preHandler', checkSessionIdExistsOrCreate)

app.register(usersRoutes, {
  prefix: 'users',
})

app.register(mealsRoutes, {
  prefix: 'meals',
})

app.get('/', async (request, reply) => {
  let sessionId = request.cookies.sessionId

  if (!sessionId) {
    sessionId = randomUUID()

    reply.cookie('sessionId', sessionId, {
      path: '/',
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    })
  }
})
