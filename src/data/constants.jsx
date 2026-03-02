import { Code2, Heart, Users, Zap, Coffee, Star } from "lucide-react";

export const ABOUT_ME = {
  name: "Alex Chen", 
  role: "Data Engineer & Full-Stack Developer",
  intro: "I am a passionate computer engineering student focusing on data engineering and full-stack development. I enjoy building robust data pipelines, interactive web applications, and game development.",
  gpa: "3.85",
  education: "B.Eng. in Computer Engineering, University Name (2020 - 2024)",
  languages: ["Thai (Native)", "English (Professional)"]
};

export const TOOLS_TAGS = [
  "Python", "TypeScript", "JavaScript", "React", "Next.js", "Node.js", "C++", "C#", 
  "PostgreSQL", "MongoDB", "Docker", "Airflow", "TailwindCSS", "Unity", "Git"
];

export const STATS = [
  { icon: <Code2 size={24} />, label: "Total Projects", value: "12+" },
  { icon: <Users size={24} />, label: "Profile Views", value: "1,204" },
  { icon: <Heart size={24} />, label: "Cheer Ups", value: "342" },
];

export const PROJECTS = [
  {
    id: 1,
    title: "CloudSync Dashboard",
    category: "Frontend",
    tags: ["React", "TailwindCSS", "Recharts"],
    description: "A real-time analytics dashboard for cloud storage monitoring. Features live data updates, interactive charts, and a responsive layout optimized for both desktop and mobile users.",
    image: "🌐",
    gradientFrom: "#bce0f7",
    gradientTo: "#d0e8f7",
    year: "2024",
    link: "#",
    github: "#",
    award: {
      title: "1st Runner Up - National Hackathon 2024",
      description: "ได้รับรางวัลรองชนะเลิศอันดับ 1 จากผู้เข้าแข่งขันกว่า 100 ทีมทั่วประเทศ โดยโปรเจกต์นี้ได้รับคำชมเรื่อง Performance และ UX/UI ที่ยอดเยี่ยม",
      competition: "Thailand Tech Hackathon 2024"
    },
    features: [
      "Real-time data synchronization across all client devices.",
      "Interactive dashboard with dark mode and customizable widgets.",
      "Role-based access control (RBAC) with secure JWT authentication."
    ],
    languages: [
      { name: "TypeScript", percent: 65, color: "#0D6EFD" },
      { name: "CSS/Tailwind", percent: 25, color: "#A3D8F4" },
      { name: "HTML", percent: 10, color: "#ffc8d5" }
    ]
  },
  {
    id: 2,
    title: "AuthFlow API",
    category: "Backend",
    tags: ["Node.js", "Express", "JWT"],
    description: "A robust authentication microservice with JWT refresh tokens, OAuth 2.0 integration (Google, GitHub), rate limiting, and comprehensive logging. Built for scale with Redis session caching.",
    image: "🔐",
    gradientFrom: "#c4b5fd",
    gradientTo: "#ddd6fe",
    year: "2024",
    link: "#",
    github: "#",
    languages: [
      { name: "JavaScript", percent: 80, color: "#fcd34d" },
      { name: "SQL", percent: 20, color: "#A3D8F4" }
    ]
  },
  {
    id: 3,
    title: "DataVault ORM",
    category: "Database",
    tags: ["PostgreSQL", "Prisma", "TypeScript"],
    description: "A lightweight ORM wrapper around Prisma with automatic migration management, schema validation, and query optimization suggestions.",
    image: "🗄️",
    gradientFrom: "#a7f3d0",
    gradientTo: "#d1fae5",
    year: "2023",
    link: "#",
    github: "#",
  }
];

export const EMOJIS = ["🌟", "✨", "🎉", "💙", "🚀", "🌈", "⭐", "🎊", "💫", "🌸"];

export const mockFeatures = [
  "Real-time data synchronization across all client devices.",
  "Interactive dashboard with dark mode and customizable widgets.",
  "Role-based access control (RBAC) with secure JWT authentication."
];

export const mockLanguages = [
  { name: "TypeScript", percent: 65, color: "#0D6EFD" }, 
  { name: "CSS/Tailwind", percent: 25, color: "#A3D8F4" }, 
  { name: "HTML", percent: 10, color: "#ffc8d5" } 
];