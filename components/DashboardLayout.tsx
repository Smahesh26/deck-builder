import React from "react";
import Link from "next/link";
import { useRouter } from "next/router";

const navItems = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Projects", href: "/dashboard/projects" },
  { label: "New Project", href: "/dashboard/new-project" },
  // ...add more links as needed
];

const sidebarStyle: React.CSSProperties = {
  width: 220,
  minHeight: "100vh",
  background: "linear-gradient(135deg, #f72585 0%, #7209b7 100%)", // Vibrant pink-purple gradient
  padding: "32px 18px",
  borderRadius: "0 24px 24px 0",
  display: "flex",
  flexDirection: "column",
  gap: 12,
  boxShadow: "0 4px 16px rgba(60,0,100,0.10)",
};

const linkStyle: React.CSSProperties = {
  display: "block",
  padding: "12px 18px",
  borderRadius: 8,
  fontSize: 17,
  fontWeight: 600,
  color: "#fff",
  textDecoration: "none",
  letterSpacing: "0.01em",
  transition: "background 0.18s, color 0.18s",
};

const activeLinkStyle: React.CSSProperties = {
  background: "rgba(255,255,255,0.18)",
  color: "#fff",
  boxShadow: "0 2px 8px rgba(60,0,100,0.12)",
};

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();

  const handleLogout = async () => {
    await fetch("/api/logout", { method: "POST" });
    router.push("/");
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", fontFamily: "inherit" }}>
      <aside style={sidebarStyle}>
        <nav>
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {navItems.map((item) => {
              const isActive = router.pathname === item.href;
              return (
                <li key={item.href} style={{ marginBottom: 8 }}>
                  <Link
                    href={item.href}
                    style={{
                      ...linkStyle,
                      ...(isActive ? activeLinkStyle : {}),
                    }}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
            <li style={{ marginTop: 24 }}>
              <button
                onClick={handleLogout}
                style={{
                  width: "100%",
                  padding: "12px 0",
                  background: "#fff",
                  color: "#7209b7",
                  border: "none",
                  borderRadius: 8,
                  fontSize: 16,
                  fontWeight: 600,
                  cursor: "pointer",
                  boxShadow: "0 2px 8px rgba(60,0,100,0.08)",
                  transition: "background 0.2s",
                }}
              >
                Logout
              </button>
            </li>
          </ul>
        </nav>
      </aside>
      <main style={{ flex: 1, padding: 0, background: "transparent" }}>
        {children}
      </main>
    </div>
  );
};

export default DashboardLayout;
