"use client"
import { Inter } from "next/font/google";
import "../globals.css";
import { AuthProvider } from "../provider";
import IdleTimer from "../IdleTimeout";

const inter = Inter({ subsets: ["latin"] });

export default function DashboardLayout({ children }) {
    return (

        <section className={inter.className}>
            <AuthProvider>
            <IdleTimer />
                {children}
            </AuthProvider>
        </section>

    )
}
