import prisma from "@/lib/prisma";
import { NextResponse, NextRequest } from "next/server";

// [GET] /api/categories カテゴリ一覧の取得
export const GET = async (req: NextRequest) => {
  console.log("GET /api/categories");
  try {
    const categories = await prisma.category.findMany();
    return NextResponse.json(categories);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "カテゴリの取得に失敗しました" },
      { status: 500 } // 500: Internal Server Error
    );
  }
};

// [POST] /api/categories 新しいカテゴリの作成
export const POST = async (req: NextRequest) => {
  const { name } = await req.json();
  try {
    const newCategory = await prisma.category.create({
      data: {
        name,
      },
    });
    return NextResponse.json(newCategory);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "カテゴリの作成に失敗しました" },
      { status: 500 } // 500: Internal Server Error
    );
  }
};
