import DashboardLayout from "../../components/DashboardLayout";
import { useState } from "react";

const projects = [
  { name: "Project Alpha", updated: "2 hours ago" },
  { name: "Project Beta", updated: "1 day ago" },
  { name: "Project Gamma", updated: "3 days ago" },
];

export default function ProjectsPage() {
  // For future modal integration, use showModal state
  // const [showModal, setShowModal] = useState(false);

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
          <h1
            style={{
              textAlign: "center",
              fontSize: 28,
              marginBottom: 18,
              fontWeight: 700,
            }}
          >
            Projects
          </h1>
          <div style={{ width: "100%", marginBottom: 24 }}>
            <ul style={{ paddingLeft: 0, margin: 0, listStyle: "none" }}>
              {projects.map((proj) => (
                <li
                  key={proj.name}
                  style={{
                    marginBottom: 16,
                    padding: "14px 12px",
                    borderRadius: 10,
                    background: "rgba(255,255,255,0.04)",
                    boxShadow: "0 2px 8px rgba(60,0,100,0.08)",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <span style={{ fontWeight: 600, fontSize: 16 }}>
                    {proj.name}
                  </span>
                  <span style={{ color: "#b197fc", fontSize: 13 }}>
                    {proj.updated}
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <button
            style={{
              marginTop: 8,
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
            onClick={() => alert("Open new project modal")}
          >
            + New Project
          </button>
        </div>
      </div>
      {/* ...modal code can be reused from dashboard if needed... */}
    </DashboardLayout>
  );
}
