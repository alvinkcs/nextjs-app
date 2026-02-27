'use client';

import { useState, useCallback, useEffect } from 'react';
import Link from 'next/link';
import Game3DCanvas from './components/Game3DCanvas';
import CheckpointOverlay, { CheckpointData } from './components/CheckpointOverlay';
import styles from './page.module.css';

export default function GamePage() {
  const [activeCheckpoint, setActiveCheckpoint] = useState<CheckpointData | null>(null);

  const handleCheckpoint = useCallback((cp: CheckpointData) => {
    setActiveCheckpoint(cp);
  }, []);

  const handleClose = useCallback(() => {
    setActiveCheckpoint(null);
  }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && activeCheckpoint) {
        setActiveCheckpoint(null);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [activeCheckpoint]);

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.titleGroup}>
          <h1 className={styles.title}>3D Adventure</h1>
          <span className={styles.badge}>Three.js</span>
        </div>
        <Link href="/" className={styles.backLink}>
          ← Home
        </Link>
      </header>
      <div className={styles.canvasWrapper}>
        <Game3DCanvas
          onCheckpoint={handleCheckpoint}
          isPaused={!!activeCheckpoint}
        />
        <div className={styles.hud}>
          <p>Click to move &bull; WASD to walk &bull; Space to jump &bull; Reach glowing checkpoints!</p>
        </div>
        {activeCheckpoint && (
          <CheckpointOverlay checkpoint={activeCheckpoint} onClose={handleClose} />
        )}
      </div>
    </div>
  );
}
