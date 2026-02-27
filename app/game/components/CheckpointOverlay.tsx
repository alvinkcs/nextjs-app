'use client';

import { useEffect, useRef } from 'react';
import styles from './CheckpointOverlay.module.css';

export interface CheckpointData {
  id: string;
  position: [number, number, number];
  type: 'link' | 'image';
  url: string;
  label: string;
  description: string;
  color: number;
}

interface Props {
  checkpoint: CheckpointData;
  onClose: () => void;
}

export default function CheckpointOverlay({ checkpoint, onClose }: Props) {
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeBtnRef.current?.focus();
  }, []);

  return (
    <div
      className={styles.backdrop}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={checkpoint.label}
    >
      <div className={styles.panel} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <div className={styles.headerInfo}>
            <h2 className={styles.label}>{checkpoint.label}</h2>
            <p className={styles.description}>{checkpoint.description}</p>
          </div>
          <button
            ref={closeBtnRef}
            className={styles.closeButton}
            onClick={onClose}
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div className={styles.content}>
          {checkpoint.type === 'link' ? (
            <div className={styles.linkCard}>
              <p className={styles.linkDescription}>{checkpoint.description}</p>
              <a
                href={checkpoint.url}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.visitButton}
              >
                Visit {checkpoint.label} ↗
              </a>
            </div>
          ) : (
            <div className={styles.imageWrapper}>
              <img
                className={styles.image}
                src={checkpoint.url}
                alt={checkpoint.label}
              />
            </div>
          )}
        </div>

        <div className={styles.hint}>
          Press Escape or click outside to close
        </div>
      </div>
    </div>
  );
}
