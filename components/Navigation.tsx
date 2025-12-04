"use client";

import { LogOut } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { signOut } from "@/lib/auth/client";
import {
  MobileNav,
  MobileNavHeader,
  MobileNavMenu,
  MobileNavToggle,
  NavBody,
  Navbar,
  NavbarButton,
  NavbarLogo,
  NavItems,
} from "./ui/resizable-navbar";

/**
 * Navigation Component
 *
 * Responsive navigation bar that adapts to both desktop and mobile viewports.
 * Displays different navigation items based on user authentication status:
 * - Authenticated: Dashboard, Upload, and Sign Out options
 * - Unauthenticated: Features, How It Works, Login, and Get Started options
 */
export function Navigation() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Hide navigation on /wrapped page
  if (pathname === "/wrapped") {
    return null;
  }

  const handleSignOut = async () => {
    await signOut();
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
                { name: "Wrapped", link: "/wrapped" },
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
                href="/wrapped"
                onClick={() => setIsMobileMenuOpen(false)}
                variant="secondary"
                className="w-full"
              >
                Wrapped
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
              {navItems.map((item) => (
                <a
                  key={item.link}
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
