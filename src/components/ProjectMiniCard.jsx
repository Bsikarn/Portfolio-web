import React from "react";
import { motion } from "framer-motion";
import { Trophy, ThumbsUp } from "lucide-react";
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
            whileHover={{ y: isDragging ? 0 : -4 }}
            whileTap={{ scale: 0.96 }}
            style={{
                ...styles.projectMiniCard,
                borderRadius: 18,
                border: selectedId === project.id ? "2px solid #0D6EFD" : "1px solid rgba(238, 243, 255, 0.9)",
                boxShadow: selectedId === project.id 
                  ? "8px 12px 24px rgba(13,110,253,0.18), inset 2px 2px 4px rgba(255,255,255,0.9)" 
                  : "6px 8px 18px rgba(13,110,253,0.05), -4px -4px 12px rgba(255,255,255,0.9), inset 1px 1px 2px rgba(255,255,255,0.8)"
            }}
        >
            {project.award && (
                <div style={styles.awardBadge}><Trophy size={12} /></div>
            )}
            {!project.award && project.is_recommended && (
                <div style={styles.recommendedBadge}><ThumbsUp size={12} /></div>
            )}


            {/* Title and Category textual data */}
            <div style={styles.overflowHidden}>
                <div style={styles.projectMiniTitle}>{project.title}</div>
                <div style={styles.projectMiniCategory}>{project.category}</div>
            </div>
        </motion.div>
    );
}
