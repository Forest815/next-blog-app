import { NextResponse, NextRequest } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

type RequestBody = {
  title: string;
  description: string;
  dueDate: string;
  priority: string;
  completed: boolean;
  categoryId: string;
};

// GETリクエスト: ToDoアイテムの一覧を取得
export const GET = async () => {
  try {
    const todos = await prisma.toDo.findMany();
    return NextResponse.json(todos);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "データの取得に失敗しました" },
      { status: 500 }
    );
  }
};

// POSTリクエスト: 新しいToDoアイテムを作成
export const POST = async (req: NextRequest) => {
  const {
    title,
    description,
    dueDate,
    priority,
    completed,
    categoryId,
  }: RequestBody = await req.json();
  try {
    const newToDo = await prisma.toDo.create({
      data: {
        title,
        description,
        dueDate: new Date(dueDate),
        priority,
        completed,
        categoryId,
      },
    });
    return NextResponse.json(newToDo);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "ToDoの作成に失敗しました" },
      { status: 500 }
    );
  }
};
