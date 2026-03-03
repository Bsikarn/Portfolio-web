import React from 'react';
import styles from './MeshGradientBackground.module.css';

export default function MeshGradientBackground() {
    return (
        <div className={styles.meshContainer}>
            <div className={styles.meshGradient}></div>
        </div>
    );
}
