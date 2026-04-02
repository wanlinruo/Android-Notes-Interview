import { PrismaClient, TagType, Role } from "../src/generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";
import { hash } from "bcryptjs";

const adapter = new PrismaPg({ connectionString: process.env["DATABASE_URL"]! });
const prisma = new PrismaClient({ adapter });

async function main() {
  // Create admin user
  const adminPassword = await hash("admin123", 12);
  await prisma.user.upsert({
    where: { email: "admin@androidhub.com" },
    update: {},
    create: {
      email: "admin@androidhub.com",
      password: adminPassword,
      nickname: "Admin",
      role: Role.ADMIN,
    },
  });

  // Create difficulty tags
  const difficultyTags = [
    { name: "初级", slug: "beginner", type: TagType.DIFFICULTY },
    { name: "中级", slug: "intermediate", type: TagType.DIFFICULTY },
    { name: "高级", slug: "advanced", type: TagType.DIFFICULTY },
  ];

  for (const tag of difficultyTags) {
    await prisma.tag.upsert({
      where: { slug: tag.slug },
      update: {},
      create: tag,
    });
  }

  // Create topic tags
  const topicTags = [
    { name: "面试常考", slug: "interview-hot", type: TagType.TOPIC },
    { name: "源码分析", slug: "source-code", type: TagType.TOPIC },
    { name: "最佳实践", slug: "best-practice", type: TagType.TOPIC },
  ];

  for (const tag of topicTags) {
    await prisma.tag.upsert({
      where: { slug: tag.slug },
      update: {},
      create: tag,
    });
  }

  // Create categories
  const categories = [
    { name: "四大组件", slug: "four-components", icon: "📦", sortOrder: 1 },
    { name: "Jetpack", slug: "jetpack", icon: "🚀", sortOrder: 2 },
    { name: "性能优化", slug: "performance", icon: "⚡", sortOrder: 3 },
    { name: "网络", slug: "networking", icon: "🌐", sortOrder: 4 },
    { name: "UI/自定义View", slug: "ui-custom-view", icon: "🎨", sortOrder: 5 },
    { name: "设计模式", slug: "design-patterns", icon: "🏗️", sortOrder: 6 },
    { name: "Kotlin", slug: "kotlin", icon: "🟣", sortOrder: 7 },
    { name: "Java 基础", slug: "java-basics", icon: "☕", sortOrder: 8 },
  ];

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
  }

  // Create subcategories for "四大组件"
  const fourComponents = await prisma.category.findUnique({
    where: { slug: "four-components" },
  });

  if (fourComponents) {
    const subCategories = [
      { name: "Activity", slug: "activity", sortOrder: 1, parentId: fourComponents.id },
      { name: "Service", slug: "service", sortOrder: 2, parentId: fourComponents.id },
      { name: "BroadcastReceiver", slug: "broadcast-receiver", sortOrder: 3, parentId: fourComponents.id },
      { name: "ContentProvider", slug: "content-provider", sortOrder: 4, parentId: fourComponents.id },
    ];

    for (const sub of subCategories) {
      await prisma.category.upsert({
        where: { slug: sub.slug },
        update: {},
        create: sub,
      });
    }
  }

  console.log("Seed completed successfully");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
