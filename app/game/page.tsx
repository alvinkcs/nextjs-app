import Link from 'next/link';
import GameCanvas from './components/GameCanvas';
import styles from './page.module.css';

export const metadata = {
  title: "Click-to-Move Game | Alvin's Webpage",
  description: 'A canvas-based game where you click to move an avatar across the world.',
};

export default function GamePage() {
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.titleGroup}>
          <h1 className={styles.title}>Click-to-Move Adventure</h1>
          <span className={styles.badge}>Canvas Game</span>
        </div>
        <Link href="/" className={styles.backLink}>
          ← Home
        </Link>
      </header>
      <div className={styles.canvasWrapper}>
        <GameCanvas />
      </div>
    </div>
  );
}
