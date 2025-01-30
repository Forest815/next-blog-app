import prisma from "@/lib/prisma";
import { NextResponse, NextRequest } from "next/server";
import { ToDo } from "@prisma/client";

export const GET = async (req: NextRequest) => {
  try {
    const todos = await prisma.toDo.findMany({
      select: {
        id: true,
        title: true,
        description: true,
        dueDate: true,
        priority: true,
        completed: true,
        createdAt: true,
        updatedAt: true,
        categoryId: true,
      },
    });
    return NextResponse.json(todos);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "データの取得に失敗しました" },
      { status: 500 }
    );
  }
};

export const POST = async (req: NextRequest) => {
  const { title, description, dueDate, priority, completed, categoryId }: ToDo =
    await req.json();
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
