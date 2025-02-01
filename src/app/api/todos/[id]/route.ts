import prisma from "@/lib/prisma";
import { NextResponse, NextRequest } from "next/server";

type RouteParams = {
  params: {
    id: string;
  };
};

// GETリクエスト: 特定のToDoアイテムを取得
export const GET = async (req: NextRequest, routeParams: RouteParams) => {
  try {
    const id = routeParams.params.id;
    const todo = await prisma.toDo.findUnique({
      where: { id },
      include: {
        category: true, // カテゴリを含めて取得
      },
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

// PUTリクエスト: 特定のToDoアイテムを更新
export const PUT = async (req: NextRequest, routeParams: RouteParams) => {
  const { id } = routeParams.params;
  const { title, description, dueDate, priority, completed, category } =
    await req.json();
  try {
    const updatedToDo = await prisma.toDo.update({
      where: { id },
      data: {
        title,
        description,
        dueDate: new Date(dueDate), // ここで日付を正しい形式に変換
        priority,
        completed,
        category: {
          connect: category.map((cat: { id: string }) => ({ id: cat.id })),
        },
      },
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

// DELETEリクエスト: 特定のToDoアイテムを削除
export const DELETE = async (req: NextRequest, routeParams: RouteParams) => {
  const { id } = routeParams.params;
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
