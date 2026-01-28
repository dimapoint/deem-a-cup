import type {Metadata} from "next";
import {Geist, Geist_Mono} from "next/font/google";
import {SpeedInsights} from "@vercel/speed-insights/next";
import "./globals.css";
import React from "react";
import Navbar from "@/components/layout/Navbar";

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

export const metadata: Metadata = {
	title: "Deem a Cup",
};

export default function RootLayout({
	                                   children,
                                   }: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
		<body
			className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#14181c] text-gray-100`}
		>
		<Navbar/>
		{children}
		<SpeedInsights/>
		</body>
		</html>
	);
}
