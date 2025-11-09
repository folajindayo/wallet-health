import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Web3Provider } from "@/components/providers/web3-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Wallet Health Monitor - Scan Your Wallet for Risks",
  description: "A non-custodial wallet scanner that audits your wallet for security risks, token approvals, and spam tokens across multiple chains.",
  keywords: ["wallet", "security", "blockchain", "web3", "ethereum", "defi", "token approvals"],
  authors: [{ name: "Wallet Health Team" }],
  openGraph: {
    title: "Wallet Health Monitor",
    description: "Scan your wallet for security risks before it's too late",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} antialiased`}>
        <ThemeProvider>
          <Web3Provider>
            {children}
          </Web3Provider>
        </ThemeProvider>
      </body>
    </html>
  );
}
