import { z } from 'zod'
import { app } from '../app'
import { knex } from '../database'
import { randomUUID } from 'crypto'
import { FastifyInstance } from 'fastify'

export async function mealsRoutes(app: FastifyInstance) {
  app.post('/', async (request, reply) => {
    const createMealBodySchema = z.object({
      name: z.string(),
      description: z.string(),
      datetime: z.string().datetime(),
      on_diet: z.boolean(),
      user_id: z.string().nullish(),
    })

    const {
      name,
      description,
      datetime,
      on_diet: onDiet,
      user_id: userId,
    } = createMealBodySchema.parse(request.body)

    let sessionId = request.cookies.sessionId

    if (!sessionId) {
      sessionId = randomUUID()

      reply.cookie('sessionId', sessionId, {
        path: '/',
        maxAge: 1000 * 60 * 60 * 24 * 7,
      })
    }

    await knex('meals').insert({
      id: randomUUID(),
      name,
      description,
      datetime,
      on_diet: onDiet,
      user_id: userId,
      session_id: sessionId,
    })

    return reply.status(201).send()
  })

  app.get('/', async (request, reply) => {
    const meals = await knex('meals')
      .select('*')
      .where({ session_id: request.cookies.sessionId })

    return { meals }
  })

  app.get('/:id', async (request, reply) => {
    const mealIdParamSchema = z.object({
      id: z.string().uuid("It's not a valid uuid"),
    })
    const { id } = mealIdParamSchema.parse(request.params)

    const meal = await knex('meals').select('*').where({ id }).first()

    if (!meal) {
      return reply.status(404).send({ error: 'Not found' })
    }

    return { meal }
  })

  app.get('/admin/all', async (request, reply) => {
    const meals = await knex('meals').select('*')
    return meals
  })

  app.patch('/:id', async (request, reply) => {
    const userIdParamSchema = z.object({
      id: z
        .string({ required_error: 'Meal Id missing' })
        .uuid("It's not a valid uuid"),
    })

    const { id: mealId } = userIdParamSchema.parse(request.params)

    const updateMealBodySchema = z.object({
      name: z.string().optional(),
      description: z.string().optional(),
      datetime: z.string().datetime().optional(),
      on_diet: z.boolean().optional(),
    })

    const {
      name,
      description,
      datetime,
      on_diet: onDiet,
    } = updateMealBodySchema.parse(request.body)

    const meal = await knex('meals').select('*').where({ id: mealId }).first()

    if (!meal) {
      return reply.status(404).send({ error: 'Not found' })
    }

    await knex('meals')
      .where({ id: mealId })
      .update({
        name: name || meal.name,
        description: description || meal.description,
        datetime: datetime || meal.datetime,
        on_diet: onDiet || meal.on_diet,
      })

    return reply.status(204).send()
  })

  app.delete('/:id', async (request, reply) => {
    const mealIdParamSchema = z.object({
      id: z.string().uuid("It's not a valid uuid"),
    })

    const { id: mealId } = mealIdParamSchema.parse(request.params)

    await knex('meals')
      .where({ id: mealId })
      .first()
      .then(async (meal) => {
        if (meal) {
          await knex('meals').where({ id: mealId }).del()
        } else {
          return reply.status(404).send({ error: 'Not found' })
        }
      })

    return reply.status(204).send()
  })

  // Delete all meals
  app.delete('/', async (request, reply) => {
    await knex('meals').truncate()
  })
}
// joao/silva/leandro/pejao/eduardo/vini/ale/zedes/marcelo
