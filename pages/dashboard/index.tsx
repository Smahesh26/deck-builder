import DashboardLayout from "../../components/DashboardLayout";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState("");
  const [stats, setStats] = useState<{ label: string; value: number }[]>([]);
  const [recentProjects, setRecentProjects] = useState<{ name: string; updated: string }[]>([]);
  const router = useRouter();

  const handleLogout = async () => {
    await fetch("/api/logout", { method: "POST" });
    router.push("/");
  };

  useEffect(() => {
    async function fetchDashboard() {
      setLoading(true);
      try {
        const res = await fetch("/api/dashboard", { credentials: "include" });
        if (!res.ok) throw new Error("API error");
        const data = await res.json();
        // Try to get email from Google auth if available
        let email = data.userEmail || "unknown";
        if (email === "unknown" && data.googleEmail) {
          email = data.googleEmail;
        }
        setUserEmail(email);
        setStats(Array.isArray(data.stats) ? data.stats : []);
        setRecentProjects(Array.isArray(data.recentProjects) ? data.recentProjects : []);
      } catch {
        setUserEmail("unknown");
        setStats([]);
        setRecentProjects([]);
      }
      setLoading(false);
    }
    fetchDashboard();
  }, []);

  // Retry fetching email if "unknown"
  useEffect(() => {
    if (userEmail === "unknown") {
      const timer = setTimeout(async () => {
        try {
          const res = await fetch("/api/dashboard", { credentials: "include" });
          if (!res.ok) return;
          const data = await res.json();
          if (data.userEmail && data.userEmail !== "unknown") {
            setUserEmail(data.userEmail);
          }
        } catch {}
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [userEmail]);

  return (
    <DashboardLayout>
      <div
        style={{
          minHeight: "100vh",
          width: "100vw",
          position: "fixed",
          left: 0,
          top: 0,
          zIndex: -1,
          background:
            "linear-gradient(135deg, #3a0ca3 0%, #7209b7 50%, #f72585 100%)",
        }}
      />
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            width: 400,
            padding: "40px 32px",
            borderRadius: 24,
            background: "rgba(40, 20, 60, 0.85)",
            boxShadow: "0 8px 32px rgba(60,0,100,0.18)",
            backdropFilter: "blur(4px)",
            color: "#fff",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          {/* Dashboard Icon */}
          <div
            style={{
              width: 60,
              height: 60,
              borderRadius: 16,
              background:
                "linear-gradient(135deg, #f72585 0%, #7209b7 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 18,
            }}
          >
            <svg width="32" height="32" fill="#fff" viewBox="0 0 24 24">
              <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8v-10h-8v10zm0-18v6h8V3h-8z" />
            </svg>
          </div>
          <h1
            style={{
              textAlign: "center",
              fontSize: 28,
              marginBottom: 8,
              fontWeight: 700,
            }}
          >
            Welcome Back
          </h1>
          {loading ? (
            <p style={{ textAlign: "center", marginBottom: 24, fontSize: 16, color: "#e0e0e0" }}>
              Loading...
            </p>
          ) : (
            <>
              <p
                style={{
                  textAlign: "center",
                  marginBottom: 24,
                  fontSize: 16,
                  color: "#e0e0e0",
                }}
              >
                {userEmail === "unknown"
                  ? <>
                      <span>Welcome!</span>
                      <br />
                      <span>Fetching your email...</span>
                    </>
                  : <>
                      <span>Welcome Back</span>
                      <br />
                      <span>Hello, <b>{userEmail}</b>! Here’s your business overview.</span>
                    </>
                }
              </p>
              <div style={{ width: "100%", marginBottom: 24 }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  {stats.map((stat) => (
                    <div key={stat.label} style={{ textAlign: "center", flex: 1 }}>
                      <div style={{ fontSize: 22, fontWeight: 600 }}>
                        {stat.value}
                      </div>
                      <div style={{ fontSize: 13, color: "#b197fc" }}>
                        {stat.label}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ width: "100%" }}>
                <h3
                  style={{
                    fontSize: 15,
                    marginBottom: 8,
                    fontWeight: 500,
                    color: "#fff",
                  }}
                >
                  Recent Projects
                </h3>
                <ul style={{ paddingLeft: 18, margin: 0 }}>
                  {recentProjects.map((proj) => (
                    <li key={proj.name} style={{ marginBottom: 6, fontSize: 14 }}>
                      <span style={{ fontWeight: 500 }}>{proj.name}</span>
                      <span
                        style={{
                          color: "#b197fc",
                          marginLeft: 8,
                          fontSize: 12,
                        }}
                      >
                        ({proj.updated})
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </>
          )}
          <button
            style={{
              marginTop: 28,
              width: "100%",
              padding: "12px 0",
              background:
                "linear-gradient(90deg, #f72585 0%, #7209b7 100%)",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              fontSize: 17,
              fontWeight: 600,
              cursor: "pointer",
              boxShadow: "0 2px 8px rgba(60,0,100,0.12)",
              transition: "background 0.2s",
            }}
            onClick={() => router.push("/dashboard/new-project")}
          >
            + New Project
          </button>
          <button
            style={{
              marginTop: 12,
              width: "100%",
              padding: "10px 0",
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
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}
