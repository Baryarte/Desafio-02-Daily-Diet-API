/* eslint-disable camelcase */
import { FastifyInstance } from 'fastify'
import { knex } from '../database'
import { z } from 'zod'
import { randomUUID } from 'node:crypto'
import { checkUserMeals } from '../middlewares/check-user-meals'

export async function usersRoutes(app: FastifyInstance) {
  // create user
  app.post('/', { preHandler: [checkUserMeals] }, async (request, reply) => {
    const createUserBodySchema = z.object({
      name: z.string(),
      email: z.string().email(),
    })

    const { name, email } = createUserBodySchema.parse(request.body)
    const id = randomUUID()

    const currentSequence = Number(request.cookies.currentSequence) || 0
    const bestSequence = Number(request.cookies.bestSequence) || 0

    reply.clearCookie('currentSequence')
    reply.clearCookie('bestSequence')
    reply.clearCookie('userId')
    reply.clearCookie('sessionId')

    await knex('users').insert({
      id,
      name,
      email,
      current_sequence: currentSequence,
      best_sequence: bestSequence,
    })

    reply.cookie('userId', id, {
      path: '/',
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    })

    const userMeals = request.userMeals
    if (userMeals) {
      userMeals.forEach(async (meal) => {
        await knex('meals').update({ user_id: id }).where({ id: meal.id })
      })
    }

    return reply.status(201).send()
  })

  app.get('/meals/best-sequence', async (request, reply) => {
    const userId = request.cookies.userId

    let bestSequence
    if (userId) {
      bestSequence = await knex('users')
        .select('best_sequence')
        .where({ id: userId })
        .first()
      bestSequence = bestSequence?.best_sequence
    } else {
      bestSequence = Number(request.cookies.bestSequence)
    }

    return { bestSequence }
  })

  app.get('/meals/on-diet/count', async (request, reply) => {
    const querySchema = z.object({
      on_diet: z.string(),
    })

    const { on_diet: onDiet } = querySchema.parse(request.query)
    const onDietBoolean = onDiet === 'true'

    const count = await knex('meals')
      .count()
      .where({
        on_diet: onDietBoolean,
        // user_id: request.cookies.userId,
        session_id: request.cookies.sessionId,
      })
      .first()
      .catch((err) => {
        console.log(err)
      })
    if (!count) return reply.status(404).send({ error: 'User not found' })
    return { count: count['count(*)'] }
  })

  app.get('/logoff', async (request, reply) => {
    reply.clearCookie('currentSequence')
    reply.clearCookie('bestSequence')
    reply.clearCookie('userId')
    reply.clearCookie('sessionId')
    return reply.status(200).send()
  })

  // get all users
  app.get('/admin', async (request, reply) => {
    const users = await knex.select('*').from('users')
    return { users }
  })

  app.get('/admin/meals/best-sequence/user/:id', async (request, reply) => {
    const paramsOptionalUserIdSchema = z.object({
      id: z.string().uuid('Not a valid uuid'),
    })

    const { id: userId } = paramsOptionalUserIdSchema.parse(request.params)

    let bestSequence
    if (userId) {
      bestSequence = await knex('users')
        .select('best_sequence')
        .where({ id: userId })
        .first()
      bestSequence = bestSequence?.best_sequence
    } else {
      bestSequence = Number(request.cookies.bestSequence)
    }

    return { bestSequence }
  })

  // Get user meal count by userId
  app.get('/admin/meals/count/:id', async (request, reply) => {
    const paramsOptionalUserIdSchema = z.object({
      id: z.string().uuid('Not a valid uuid'),
    })

    const { id: userId } = paramsOptionalUserIdSchema.parse(request.params)
    const count = await knex('meals')
      .count()
      .where({ user_id: userId })
      .first()
      .catch((err) => {
        console.log(err)
      })
    if (!count) return reply.status(404).send({ error: 'User not found' })
    return { count: count['count(*)'] }
  })

  // Get users meals by userId
  app.get(
    '/admin/meals/:id',
    { preHandler: checkUserMeals },
    async (request, reply) => {
      const userMeals = request.userMeals
      const count = request.userMeals.length

      return { count, userMeals }
    },
  )

  // Delete all users
  app.delete('/admin', async (request, reply) => {
    await knex('users').truncate()
  })
}
