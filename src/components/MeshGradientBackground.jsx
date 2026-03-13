import React from 'react';
import styles from './MeshGradientBackground.module.css';

// Renders a full-screen animated mesh gradient background for visual aesthetics
export default function MeshGradientBackground() {
    return (
        // Container to hold the gradient and apply full viewport sizing
        <div className={styles.meshContainer}>
            {/* The actual gradient element that handles CSS animations */}
            <div className={styles.meshGradient}></div>
        </div>
    );
}
