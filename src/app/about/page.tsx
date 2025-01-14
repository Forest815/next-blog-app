"use client";
import Image from "next/image";
import { twMerge } from "tailwind-merge";

const Page: React.FC = () => {
  return (
    <main>
      <div className="mb-5 text-2xl font-bold">About</div>

      <div
        className={twMerge(
          "mx-auto mb-5 w-full md:w-2/3",
          "flex justify-center"
        )}
      >
        <Image
          src="/avatar.png"
          alt="説明文" // 画像の説明文を設定
          width={600} // 画像の幅を設定
          height={400} // 画像の高さを設定
          className="rounded-lg" // 必要に応じてクラスを追加
        />
      </div>

      <div className="space-y-3">
        <div className="md:flex md:justify-center">
          <div className="font-bold md:w-1/6 md:text-center">名 前</div>
          <div className="md:w-5/6">彌園 和志 (Kazushi Misono)</div>
        </div>
        <div className="md:flex md:justify-center">
          <div className="font-bold md:w-1/6 md:text-center">連絡先</div>
          <div className="md:w-5/6">rk22142w@st.omu.ac.jp</div>
        </div>
        <div className="md:flex md:justify-center">
          <div className="font-bold md:w-1/6 md:text-center">
            ポートフォリオ
          </div>
          <div className="md:w-5/6">
            <a
              href="https://forest815.github.io/--7_35_/"
              className="mr-1 text-blue-500 underline"
            >
              Kazushi&apos;s Portfolio
            </a>
            (GitHub Pages)
          </div>
        </div>
        <div className="md:flex md:justify-center">
          <div className="font-bold md:w-1/6 md:text-center">自己紹介</div>
          <div className="md:w-5/6">
            とある高専の情報系学科3年生です。最近は、ウェブアプリ開発やデザインに興味があって、Next.js
            (React) の勉強を兼ねて、このブログアプリを構築しました。
            <br />
            このブログでは、日々の学習記録や技術的な発見を共有していければと思います。よろしくお願いします！
          </div>
        </div>
      </div>
    </main>
  );
};

export default Page;
