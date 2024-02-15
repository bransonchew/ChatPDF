import { pgEnum, pgTable, serial, text, timestamp, uuid, varchar } from 'drizzle-orm/pg-core'


export const roleEnum = pgEnum('role', ['system', 'user'])

export const chats = pgTable('chats', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  userId: varchar('user_id', { length: 256 }).notNull(),
  fileUrl: text('file_url').notNull(),
  fileKey: text('file_key').notNull(),
})

export const messages = pgTable('messages', {
  id: serial('id').primaryKey(),
  chatId: uuid('chat_id').references(() => chats.id).notNull(),
  content: text('content').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  role: roleEnum('role').notNull(),
})

export const userSubscriptions = pgTable('user_subscriptions', {
  id: serial('id').primaryKey(),
  userId: varchar('user_id', { length: 256 }).notNull().unique(),
  stripeCustomerId: varchar('stripe_customer_id', { length: 256 }).notNull().unique(),
  stripeSubscriptionId: varchar('stripe_subscription_id', { length: 256 }).unique(),
  stripePriceId: varchar('stripe_price_id', { length: 256 }),
  stripeCurrentPeriodEnd: timestamp('stripe_current_period_ended_at'),
})

export type Chat = typeof chats.$inferSelect

export type Message = typeof messages.$inferSelect

export type UserSubscription = typeof messages.$inferSelect
