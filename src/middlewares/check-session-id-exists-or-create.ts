import { FastifyRequest, FastifyReply } from 'fastify'
import { randomUUID } from 'node:crypto'

export async function checkSessionIdExistsOrCreate(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const { sessionId } = request.cookies

  if (!sessionId) {
    const newSessionId = randomUUID()
    reply.cookie('sessionId', newSessionId, {
      path: '/',
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    })
    request.cookies.sessionId = newSessionId
  }
}
