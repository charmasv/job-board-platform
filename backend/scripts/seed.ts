import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Create a test employer
  const employer = await prisma.user.upsert({
    where: { email: 'employer@test.com' },
    update: {},
    create: {
      email: 'employer@test.com',
      password: 'testpassword',
      name: 'Test Employer',
      type: 'EMPLOYER'
    },
  });

  // Create a test job
  const job = await prisma.job.create({
    data: {
      title: 'Full Stack Developer',
      description: 'We are looking for a skilled Full Stack Developer...',
      company: 'Tech Solutions Inc.',
      location: 'Remote',
      salary: 85000,
      employerId: employer.id
    },
  });

  console.log('Created test data:', { employer, job });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });