import type { Metadata } from "next";
import "./globals.css";

import "@fortawesome/fontawesome-svg-core/styles.css";
import { config } from "@fortawesome/fontawesome-svg-core";
config.autoAddCss = false;

// 正しいパスに修正
import Header from "@/app/_components/Header";

export const metadata: Metadata = {
  title: "NextBlogApp",
  description: "Built to learn Next.js and modern web development.",
};

interface RootLayoutProps {
  children: React.ReactNode;
}

const RootLayout: React.FC<RootLayoutProps> = ({ children }) => {
  return (
    <html lang="ja">
      <head>
        <title>ToDoアプリ</title>
      </head>
      <body>
        <Header />
        <div className="mx-4 mt-2 max-w-2xl md:mx-auto">{children}</div>
      </body>
    </html>
  );
};

export default RootLayout;
