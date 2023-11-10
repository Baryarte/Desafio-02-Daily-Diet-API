import { FastifyRequest } from 'fastify'
interface userMeal {
  id: string
  name: string
  description: string
  user_id: string | null
  session_id: string
  on_diet: boolean
  datetime: Date | string
  created_at: Date
}

type userMeals = userMeal[]

declare module 'fastify' {
  export interface FastifyRequest {
    userMeals: userMeals
    userId: string
  }
}
