import React from "react";
import { motion } from "framer-motion";
import { Trophy, Target } from "lucide-react";
import { styles } from "../styles/ProjectsPage.styles";

export default function ProjectMiniCard({ project, selectedId, isDragging, handleCardClick }) {
    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            onClick={() => handleCardClick(project.id)}
            whileHover={{ y: isDragging ? 0 : -5 }}
            style={{
                ...styles.projectMiniCard,
                border: selectedId === project.id ? "2px solid #0D6EFD" : "1px solid #eef3ff",
                boxShadow: selectedId === project.id ? "0 8px 24px rgba(13,110,253,0.15)" : "0 4px 16px rgba(13,110,253,0.05)"
            }}
        >
            {project.award && <div style={styles.awardBadge}><Trophy size={12} /> AWARD</div>}
            {project.is_recommended && !project.award && <div style={styles.recommendedBadge}><Target size={12} /> RECOMMENDED</div>}
            <div style={{ ...styles.projectIconBadge, background: `linear-gradient(135deg, #f0f6ff, #e0f2fe)` }}>{project.image_icon}</div>
            <div style={styles.overflowHidden}>
                <div style={styles.projectMiniTitle}>{project.title}</div>
                <div style={styles.projectMiniCategory}>{project.category}</div>
            </div>
        </motion.div>
    );
}
