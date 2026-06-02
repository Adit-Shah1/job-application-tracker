import { PrismaClient } from "../src/generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

async function main() {
  const email = "demo@example.com";
  const user = await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      email,
      name: "Demo User",
    },
  });

  await prisma.application.deleteMany({ where: { userId: user.id } });

  const now = Date.now();
  const day = 24 * 60 * 60 * 1000;

  const apps = [
    {
      companyName: "Acme Corp",
      roleTitle: "Senior Frontend Engineer",
      jobUrl: "https://acme.com/jobs/123",
      location: "Remote",
      status: "INTERVIEWING" as const,
      salaryMin: 140000,
      salaryMax: 170000,
      currency: "USD",
      dateSaved: new Date(now - 21 * day),
      dateApplied: new Date(now - 18 * day),
      priority: "HIGH" as const,
      source: "LinkedIn",
    },
    {
      companyName: "Globex",
      roleTitle: "Full Stack Developer",
      jobUrl: "https://globex.com/careers/456",
      location: "New York, NY",
      status: "APPLIED" as const,
      salaryMin: 120000,
      salaryMax: 150000,
      currency: "USD",
      dateSaved: new Date(now - 10 * day),
      dateApplied: new Date(now - 7 * day),
      priority: "MEDIUM" as const,
      source: "Referral",
    },
    {
      companyName: "Initech",
      roleTitle: "Software Engineer II",
      jobUrl: null,
      location: "Austin, TX",
      status: "OFFER" as const,
      salaryMin: 135000,
      salaryMax: 155000,
      currency: "USD",
      dateSaved: new Date(now - 35 * day),
      dateApplied: new Date(now - 30 * day),
      priority: "HIGH" as const,
      source: "Company site",
    },
    {
      companyName: "Vandelay Industries",
      roleTitle: "Frontend Engineer",
      jobUrl: "https://vandelay.example/jobs/1",
      location: "Remote",
      status: "REJECTED" as const,
      salaryMin: 110000,
      salaryMax: 140000,
      currency: "USD",
      dateSaved: new Date(now - 28 * day),
      dateApplied: new Date(now - 25 * day),
      priority: "LOW" as const,
      source: "Indeed",
    },
    {
      companyName: "Stark Industries",
      roleTitle: "Senior Software Engineer",
      jobUrl: "https://stark.example/jobs/77",
      location: "San Francisco, CA",
      status: "SAVED" as const,
      salaryMin: 180000,
      salaryMax: 220000,
      currency: "USD",
      dateSaved: new Date(now - 2 * day),
      priority: "HIGH" as const,
      source: "LinkedIn",
    },
    {
      companyName: "Hooli",
      roleTitle: "Frontend Developer",
      jobUrl: null,
      location: "Mountain View, CA",
      status: "SAVED" as const,
      priority: "MEDIUM" as const,
      dateSaved: new Date(now - 1 * day),
    },
    {
      companyName: "Pied Piper",
      roleTitle: "Software Engineer",
      jobUrl: "https://pp.example/jobs/4",
      location: "Palo Alto, CA",
      status: "APPLIED" as const,
      salaryMin: 130000,
      salaryMax: 160000,
      currency: "USD",
      dateSaved: new Date(now - 14 * day),
      dateApplied: new Date(now - 10 * day),
      priority: "MEDIUM" as const,
      source: "Company site",
    },
    {
      companyName: "Wonka Industries",
      roleTitle: "UI Engineer",
      jobUrl: null,
      location: "Remote",
      status: "INTERVIEWING" as const,
      salaryMin: 115000,
      salaryMax: 140000,
      currency: "USD",
      dateSaved: new Date(now - 20 * day),
      dateApplied: new Date(now - 17 * day),
      priority: "HIGH" as const,
      source: "Twitter",
    },
    {
      companyName: "Cyberdyne Systems",
      roleTitle: "Backend Engineer",
      jobUrl: "https://cyberdyne.example/jobs/2",
      location: "Sunnyvale, CA",
      status: "ARCHIVED" as const,
      priority: "LOW" as const,
      dateSaved: new Date(now - 60 * day),
    },
    {
      companyName: "Soylent Corp",
      roleTitle: "Full Stack Engineer",
      jobUrl: null,
      location: "Remote",
      status: "REJECTED" as const,
      priority: "LOW" as const,
      dateSaved: new Date(now - 40 * day),
      dateApplied: new Date(now - 38 * day),
    },
    {
      companyName: "Massive Dynamic",
      roleTitle: "Senior Frontend Engineer",
      jobUrl: "https://massive.example/jobs/9",
      location: "Boston, MA",
      status: "SAVED" as const,
      salaryMin: 150000,
      salaryMax: 180000,
      currency: "USD",
      dateSaved: new Date(now - 3 * day),
      priority: "MEDIUM" as const,
      source: "Hacker News",
    },
    {
      companyName: "Tyrell Corp",
      roleTitle: "Staff Software Engineer",
      jobUrl: "https://tyrell.example/jobs/3",
      location: "Los Angeles, CA",
      status: "APPLIED" as const,
      salaryMin: 200000,
      salaryMax: 250000,
      currency: "USD",
      dateSaved: new Date(now - 7 * day),
      dateApplied: new Date(now - 4 * day),
      priority: "HIGH" as const,
      source: "Recruiter",
    },
  ];

  for (const a of apps) {
    const app = await prisma.application.create({
      data: { ...a, userId: user.id },
    });

    if (a.companyName === "Acme Corp") {
      await prisma.note.createMany({
        data: [
          {
            applicationId: app.id,
            content:
              "Recruiter call went well. Mentioned the team is hiring for a new product line.",
            createdAt: new Date(now - 17 * day),
          },
          {
            applicationId: app.id,
            content:
              "Take-home submitted. Used Vite + React + a small Express mock API.",
            createdAt: new Date(now - 12 * day),
          },
          {
            applicationId: app.id,
            content:
              "Onsite scheduled for next week. 4 rounds: systems, frontend deep dive, behavioral, hiring manager.",
            createdAt: new Date(now - 3 * day),
          },
        ],
      });
      await prisma.reminder.createMany({
        data: [
          {
            applicationId: app.id,
            reminderDate: new Date(now - 1 * day),
            reminderType: "INTERVIEW",
            completed: false,
          },
          {
            applicationId: app.id,
            reminderDate: new Date(now + 2 * day),
            reminderType: "FOLLOW_UP",
            completed: false,
          },
        ],
      });
    }

    if (a.companyName === "Initech") {
      await prisma.note.create({
        data: {
          applicationId: app.id,
          content:
            "Got the offer! 145k base + 10% bonus + 0.05% equity. Need to decide by end of next week.",
        },
      });
    }

    if (a.companyName === "Globex") {
      await prisma.reminder.create({
        data: {
          applicationId: app.id,
          reminderDate: new Date(now + 5 * day),
          reminderType: "FOLLOW_UP",
          completed: false,
        },
      });
    }
  }

  console.log("Seeded user:", user.email);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
