import { NextResponse, NextRequest } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const GET = async (
  req: NextRequest,
  { params }: { params: { id: string } }
) => {
  const { id } = params;
  try {
    const todo = await prisma.toDo.findUnique({
      where: { id },
    });
    if (!todo) {
      return NextResponse.json(
        { error: "ToDoが見つかりません" },
        { status: 404 }
      );
    }
    return NextResponse.json(todo);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "データの取得に失敗しました" },
      { status: 500 }
    );
  }
};

export const PUT = async (
  req: NextRequest,
  { params }: { params: { id: string } }
) => {
  const { id } = params;
  const { title, description, dueDate, priority, completed } = await req.json();
  try {
    const updatedToDo = await prisma.toDo.update({
      where: { id },
      data: { title, description, dueDate, priority, completed },
    });
    return NextResponse.json(updatedToDo);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "ToDoの更新に失敗しました" },
      { status: 500 }
    );
  }
};

export const DELETE = async (
  req: NextRequest,
  { params }: { params: { id: string } }
) => {
  const { id } = params;
  try {
    await prisma.toDo.delete({
      where: { id },
    });
    return NextResponse.json({ message: "ToDoの削除に成功しました" });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "ToDoの削除に失敗しました" },
      { status: 500 }
    );
  }
};
