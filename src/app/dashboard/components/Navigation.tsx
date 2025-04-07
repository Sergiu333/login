"use client";

import {
  Navigation,
  Frame,
  Page,
  TopBar,
  ActionList,
  Icon,
} from "@shopify/polaris";
import {
  HomeIcon,
  SettingsIcon,
  CreditCardIcon,
  StarIcon,
  PinIcon,
  MobileIcon,
  OrderIcon,
} from "@shopify/polaris-icons";
import { useState, useCallback } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

export default function NavigationWrapper({ children }: { children: React.ReactNode }) {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileNavigationOpen, setIsMobileNavigationOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const toggleUserMenu = useCallback(
    () => setIsUserMenuOpen((isUserMenuOpen) => !isUserMenuOpen),
    [],
  );

  const toggleMobileNavigation = useCallback(
    () => setIsMobileNavigationOpen((isMobileNavigationOpen) => !isMobileNavigationOpen),
    [],
  );

  const userMenuActions = [
    {
      items: [
        {
          content: "Profil",
          onAction: () => router.push('/dashboard/settings'),
        },
        {
          content: "Deconectare",
          onAction: () => {},
        },
      ],
    },
  ];

  const navigationMarkup = (
    <Navigation location="/dashboard">
      <Navigation.Section
        items={[
          {
            label: "Dashboard",
            icon: HomeIcon,
            onClick: () => router.push("/dashboard"),
            selected: pathname === "/dashboard",
          },
          {
            label: "Tranzacții",
            icon: OrderIcon,
            onClick: () => router.push("/dashboard/transactions"),
            selected: pathname === "/dashboard/transactions",
          },
        ]}
      />
      <Navigation.Section
        title="Metode de plată"
        items={[
          {
            label: "Victoriabank Visa/MasterCard",
            icon: CreditCardIcon,
            onClick: () => router.push("/dashboard/settings/visa-mastercard"),
            selected: pathname === "/dashboard/settings/visa-mastercard",
          },
          {
            label: "Victoriabank Star Card Rate",
            icon: StarIcon,
            onClick: () => router.push("/dashboard/settings/star-card"),
            selected: pathname === "/dashboard/settings/star-card",
          },
          {
            label: "Victoriabank Puncte Star",
            icon: PinIcon,
            onClick: () => router.push("/dashboard/settings/star-points"),
            selected: pathname === "/dashboard/settings/star-points",
          },
          {
            label: "MIA",
            icon: MobileIcon,
            onClick: () => router.push("/dashboard/settings/mia"),
            selected: pathname === "/dashboard/settings/mia",
          },
        ]}
      />
    </Navigation>
  );

  const topBarMarkup = (
    <TopBar
      showNavigationToggle
      userMenu={
        <TopBar.UserMenu
          actions={userMenuActions}
          open={isUserMenuOpen}
          name="Admin"
          initials="A"
          onToggle={toggleUserMenu}
        />
      }
      onNavigationToggle={toggleMobileNavigation}
    />
  );

  return (
    <Frame
      navigation={navigationMarkup}
      topBar={topBarMarkup}
      showMobileNavigation={isMobileNavigationOpen}
      onNavigationDismiss={toggleMobileNavigation}
    >
      {children}
    </Frame>
  );
} 