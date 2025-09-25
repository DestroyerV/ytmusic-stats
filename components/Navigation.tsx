"use client";

import { useAuth } from "@/hooks/use-auth";
import {
  MobileNav,
  MobileNavHeader,
  MobileNavMenu,
  MobileNavToggle,
  Navbar,
  NavbarButton,
  NavbarLogo,
  NavBody,
  NavItems,
} from "./ui/resizable-navbar";
import { useState } from "react";
import Link from "next/link";
import { signOut } from "@/lib/auth/client";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

interface NavigationProps {
  userName?: string;
}

export function Navigation({ userName }: NavigationProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    // Optionally, you can redirect the user to the homepage or login page after sign out
    router.push("/");
  };

  const navItems = [
    {
      name: "Features",
      link: "#features",
    },
    {
      name: "How It Works",
      link: "#how-it-works",
    },
  ];

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <Navbar>
      {/* Desktop Navigation */}
      <NavBody>
        <NavbarLogo />
        {isAuthenticated && !isLoading ? (
          <div className="flex items-center gap-4">
            <NavItems
              items={[
                { name: "Dashboard", link: "/dashboard" },
                { name: "Upload", link: "/upload" },
              ]}
            />
            <NavbarButton variant="primary" onClick={handleSignOut}>
              <div className="flex items-center justify-center gap-2">
                <LogOut />
                SignOut
              </div>
            </NavbarButton>
          </div>
        ) : (
          <div className="flex items-center gap-4">
            <NavItems items={navItems} />
            <NavbarButton variant="secondary" as={Link} href="/auth/signin">
              Login
            </NavbarButton>
            <NavbarButton variant="primary" as={Link} href="/auth/signup">
              Get Started
            </NavbarButton>
          </div>
        )}
      </NavBody>

      {/* Mobile Navigation */}
      <MobileNav>
        <MobileNavHeader>
          <NavbarLogo />
          <MobileNavToggle
            isOpen={isMobileMenuOpen}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          />
        </MobileNavHeader>

        <MobileNavMenu
          isOpen={isMobileMenuOpen}
          onClose={() => setIsMobileMenuOpen(false)}
        >
          {isAuthenticated && !isLoading ? (
            <div className="flex w-full flex-col gap-4">
              <NavbarButton
                as={Link}
                href="/dashboard"
                onClick={() => setIsMobileMenuOpen(false)}
                variant="secondary"
                className="w-full"
              >
                Dashboard
              </NavbarButton>
              <NavbarButton
                as={Link}
                href="/upload"
                onClick={() => setIsMobileMenuOpen(false)}
                variant="secondary"
                className="w-full"
              >
                Upload
              </NavbarButton>
              <NavbarButton
                variant="primary"
                onClick={handleSignOut}
                className="w-full"
              >
                <div className="flex items-center justify-center gap-2">
                  <LogOut />
                  SignOut
                </div>
              </NavbarButton>
            </div>
          ) : (
            <div className="flex w-full flex-col gap-4">
              {navItems.map((item, idx) => (
                <a
                  key={`mobile-link-${idx}`}
                  href={item.link}
                  {...(item.link.startsWith("http") && {
                    target: "_blank",
                    rel: "noopener noreferrer",
                  })}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="relative text-neutral-600 dark:text-neutral-300 py-2"
                >
                  <span className="block">{item.name}</span>
                </a>
              ))}
              <NavbarButton
                as={Link}
                href="/auth/signin"
                onClick={() => setIsMobileMenuOpen(false)}
                variant="secondary"
                className="w-full"
              >
                Login
              </NavbarButton>
              <NavbarButton
                as={Link}
                href="/auth/signup"
                onClick={() => setIsMobileMenuOpen(false)}
                variant="primary"
                className="w-full"
              >
                Get Started
              </NavbarButton>
            </div>
          )}
        </MobileNavMenu>
      </MobileNav>
    </Navbar>
  );
}
