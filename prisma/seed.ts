import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // カテゴリを作成
  const category = await prisma.category.create({
    data: {
      name: "買い物",
    },
  });

  // ToDo アイテムを作成
  const todo1 = await prisma.toDo.create({
    data: {
      title: "買い物リスト1",
      description: "牛乳、パン、卵を買う",
      dueDate: new Date("2023-12-31"),
      priority: "high",
      completed: false,
      categoryId: category.id,
    },
  });

  const todo2 = await prisma.toDo.create({
    data: {
      title: "買い物リスト2",
      description: "野菜、果物を買う",
      dueDate: new Date("2023-12-25"),
      priority: "medium",
      completed: false,
      categoryId: category.id,
    },
  });

  const todo3 = await prisma.toDo.create({
    data: {
      title: "買い物リスト3",
      description: "洗剤、トイレットペーパーを買う",
      dueDate: new Date("2023-12-20"),
      priority: "low",
      completed: false,
      categoryId: category.id,
    },
  });

  console.log({ todo1, todo2, todo3 });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
