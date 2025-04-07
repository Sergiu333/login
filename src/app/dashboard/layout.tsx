"use client";

import { AppProvider } from "@shopify/polaris";
import "@shopify/polaris/build/esm/styles.css";
import NavigationWrapper from "./components/Navigation";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AppProvider i18n={{}}>
          <NavigationWrapper>{children}</NavigationWrapper>
        </AppProvider>
      </body>
    </html>
  );
}