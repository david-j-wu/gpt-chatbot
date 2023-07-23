import "./globals.css";
import { Roboto_Flex } from "next/font/google";

const robotoFlex = Roboto_Flex({ subsets: ["latin"] });

export const metadata = {
  title: "GPT Chatbot",
  description:
    "GPT Chatbot: A simple ChatGPT-powered chatbot" +
    " built with Next.js and Tailwind CSS",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={robotoFlex.className}>{children}</body>
    </html>
  );
}
