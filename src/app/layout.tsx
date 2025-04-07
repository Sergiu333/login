"use client"
import { AppProvider } from '@shopify/polaris';
import { useState } from 'react';
import '@shopify/polaris/build/esm/styles.css';


import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});



export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {
    const [i18n] = useState({});

    return (
        <html lang="en">
        <body
            className={`${geistSans.variable} ${geistMono.variable} antialiased `}
        >
        {/* Învelim aplicația în AppProvider */}
        <AppProvider i18n={i18n}>
            {children}
        </AppProvider>
        </body>
        </html>
    );
}
