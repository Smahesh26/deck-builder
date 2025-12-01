import type { NextApiRequest, NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // Replace with real authentication/session logic
  const userEmail = req.cookies?.userEmail || "demo@brand.com";

  // Replace with real DB queries
  const stats = [
    { label: "Projects", value: 5 },
    { label: "Tasks", value: 12 },
    { label: "Completed", value: 8 },
  ];
  const recentProjects = [
    { name: "Project Alpha", updated: "2 hours ago" },
    { name: "Project Beta", updated: "1 day ago" },
    { name: "Project Gamma", updated: "3 days ago" },
  ];

  res.status(200).json({
    userEmail,
    stats,
    recentProjects,
  });
}
