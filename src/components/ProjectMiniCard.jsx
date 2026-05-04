import React from "react";
import { motion } from "framer-motion";
import { Trophy, Target } from "lucide-react";
import { styles } from "../styles/ProjectsPage.styles";

// A smaller card component used to display a summary of a project within a list or grid
export default function ProjectMiniCard({ project, selectedId, isDragging, handleCardClick }) {
    return (
        // motion.div enables layout animations and gesture responses
        <motion.div
            layout // Automatically animate layout changes (e.g., when siblings are removed)
            initial={{ opacity: 0, scale: 0.9 }} // Starting state for entrance animation
            animate={{ opacity: 1, scale: 1 }} // Target state when component mounts
            exit={{ opacity: 0, scale: 0.9 }} // Ending state when component unmounts
            onClick={() => handleCardClick(project.id)} // Notify parent component of selection
            whileHover={{ y: isDragging ? 0 : -5 }} // Slight hover lift effect, disabled during drag
            style={{
                ...styles.projectMiniCard,
                // Highlight the card with a blue border if it is the currently selected project
                border: selectedId === project.id ? "2px solid #0D6EFD" : "1px solid #eef3ff",
                boxShadow: selectedId === project.id ? "0 8px 24px rgba(13,110,253,0.15)" : "0 4px 16px rgba(13,110,253,0.05)"
            }}
        >
            {project.award && (
                <div style={styles.awardBadge}><Trophy size={12} /> AWARD</div>
            )}
            {!project.award && project.is_recommended && (
                <div style={styles.recommendedBadge}><Target size={12} /> RECOMMENDED</div>
            )}

            {/* Project Emoji Icon */}
            <div style={{ ...styles.projectIconBadge, background: "linear-gradient(135deg, #f0f6ff, #e0f2fe)" }}>
                {project.image_icon}
            </div>
            {/* Title and Category textual data */}
            <div style={styles.overflowHidden}>
                <div style={styles.projectMiniTitle}>{project.title}</div>
                <div style={styles.projectMiniCategory}>{project.category}</div>
            </div>
        </motion.div>
    );
}
