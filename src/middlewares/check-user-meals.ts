import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { knex } from '../database'

export async function checkUserMeals(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  console.log('preparsingcheckusermeals')
  const paramsOptionalIdSchema = z.object({
    id: z.string().uuid('Num é uuid').optional().default(''),
  })
  console.log('params', request.params)

  const response = paramsOptionalIdSchema.safeParse(request.params)

  let id = ''
  if (response.success) {
    id = response.data.id
    request.userId = id as string
  }

  console.log(response)
  const { sessionId } = request.cookies
  console.log(id, sessionId)
  if (!id && !sessionId) {
    reply.status(401).send({
      error: 'Unauthorized',
    })
  }

  const userMeals = await knex('meals')
    .select('*')
    .where({ session_id: sessionId })
    .orWhere({ user_id: id })

  request.userMeals = userMeals
  console.log('fim check user meals')
}
