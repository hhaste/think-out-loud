import "./globals.css";
import { Karla } from "next/font/google";
import Providers from "./providers";

const font = Karla({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal"],
  display: "swap",
  variable: "--font-karla"
});

export const metadata = {
  title: "Think Out Loud!",
  description: "AI-powered exam simulator to practice interviews and oral exams—all voice, no typing.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${font.className} antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
