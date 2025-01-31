import prisma from "@/lib/prisma";
import { NextResponse, NextRequest } from "next/server";

export const POST = async (req: NextRequest) => {
  try {
    const { title, description, dueDate, priority, completed, categoryId } =
      await req.json();

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
    console.error("ToDoの作成に失敗しました:", error);
    return NextResponse.json(
      { error: "ToDoの作成に失敗しました" },
      { status: 500 }
    );
  }
};

export const GET = async (req: NextRequest) => {
  try {
    const todos = await prisma.toDo.findMany();
    return NextResponse.json(todos);
  } catch (error) {
    console.error("ToDoの取得に失敗しました:", error);
    return NextResponse.json(
      { error: "ToDoの取得に失敗しました" },
      { status: 500 }
    );
  }
};
