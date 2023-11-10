import { Knex } from 'knex'

declare module 'knex/types/tables' {
  export interface Tables {
    meals: {
      id: string
      name: string
      description: string
      user_id: string | null
      session_id: string
      on_diet: boolean
      datetime: Date | string
      created_at: Date
    }
    users: {
      id: string
      name: string
      email: string
      created_at: Date
    }
  }
}
