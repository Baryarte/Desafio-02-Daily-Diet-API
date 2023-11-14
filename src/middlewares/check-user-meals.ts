import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { knex } from '../database'

export async function checkUserMeals(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const paramsOptionalIdSchema = z.object({
    id: z.string().uuid('Num é uuid').optional().default(''),
  })

  const response = paramsOptionalIdSchema.safeParse(request.params)

  let id = ''
  if (response.success) {
    id = response.data.id
    request.userId = id
  }

  const { sessionId } = request.cookies
  //   if (!id && !sessionId) {
  //     reply.status(401).send({
  //       error: 'Unauthorized',
  //     })
  //   }

  const userMeals = await knex('meals')
    .select('*')
    .where({ session_id: sessionId })
    .orWhere({ user_id: id })

  request.userMeals = userMeals
}
