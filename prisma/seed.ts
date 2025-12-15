import { PrismaClient } from '../lib/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
})

const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('🌱 Seeding database...')

  // Add any initial data seeding here if needed
  // For example:
  // await prisma.user.create({
  //   data: {
  //     id: 'admin-user-id',
  //     name: 'Admin User',
  //     email: 'admin@example.com',
  //     emailVerified: true,
  //   }
  // })

  console.log('✅ Database seeded successfully')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
