/* eslint-disable camelcase */
import { FastifyInstance } from 'fastify'
import { knex } from '../database'
import { z } from 'zod'
import { randomUUID } from 'node:crypto'
import { checkUserMeals } from '../middlewares/check-user-meals'

export async function usersRoutes(app: FastifyInstance) {
  app.get('/', async (request, reply) => {
    const users = await knex.select('*').from('users')
    return { users }
  })

  app.post('/', { preHandler: [checkUserMeals] }, async (request, reply) => {
    console.log('post user')
    const createUserBodySchema = z.object({
      name: z.string(),
      email: z.string().email(),
    })

    const { name, email } = createUserBodySchema.parse(request.body)
    const id = randomUUID()
    console.log(id)
    await knex('users').insert({
      id,
      name,
      email,
    })

    const userMeals = request.userMeals
    console.log('userMeals', userMeals)
    if (userMeals) {
      userMeals.forEach(async (meal) => {
        await knex('meals').update({ user_id: id }).where({ id: meal.id })
      })
    }

    return reply.status(201).send()
  })

  app.get(
    '/admin/meals/:id',
    { preHandler: checkUserMeals },
    async (request, reply) => {
      const userMeals = request.userMeals

      return { userMeals }
    },
  )

  // Delete all users
  app.delete('/', async (request, reply) => {
    await knex('users').truncate()
  })
}
