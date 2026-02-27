'use client';

import { useEffect, useRef } from 'react';
import styles from "./page.module.css";
import Link from 'next/link';

export default function Home() {
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add(styles.visible);
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
      }
    );

    const elements = document.querySelectorAll(`.${styles.fadeIn}`);
    elements.forEach((el) => observerRef.current?.observe(el));

    return () => {
      observerRef.current?.disconnect();
    };
  }, []);

  return (
    <main className={styles.resumeMain}>
      {/* Navigation */}
      <nav className={styles.nav}>
        <Link href="/blog">Blog</Link>
        <Link href="/money">Money</Link>
        <Link href="/trade">Trade</Link>
        <Link href="/game">Game</Link>
      </nav>

      {/* Hero Section */}
      <section className={`${styles.hero} ${styles.fadeIn}`}>
        <h1 className={styles.name}>KONG Chun San Alvin</h1>
        <p className={styles.title}>Full Stack App & Web Developer</p>
        <p className={styles.tagline}>Building elegant and efficient solutions to complex problems</p>
        <div className={styles.contact}>
          <a href="mailto:pklichun@gmail.com">pklichun@gmail.com</a>
          <span>•</span>
          <a href="tel:+85290118205">(852) 9011-8205</a>
          <span>•</span>
          <a href="https://github.com/alvinkcs" target="_blank" rel="noopener noreferrer">GitHub</a>
          {/* <span>•</span>
          <a href="https://linkedin.com/in/johndoe" target="_blank" rel="noopener noreferrer">LinkedIn</a> */}
        </div>
        <div>
          <img src="IMG_4269.jpg" className={styles.selfImg} />
        </div>
      </section>

      {/* About Section */}
      <section className={`${styles.section} ${styles.fadeIn}`}>
        <h2 className={styles.sectionTitle}>About Me</h2>
        <p className={styles.aboutText}>
          Passionate developer with about 1 years of internship experience in building native iOS App using Objective-C with low level Metal Shader for GPU graphics drawing and AudioUnit for audio processing pipeline.
          Besides, I like to build scalable web applications in my free time. 
          I specialize in React, Next.js, and Node.js, with a keen eye for creating intuitive user 
          experiences. I love solving challenging problems and continuously learning new technologies.
        </p>
      </section>

      {/* Experience Section */}
      <section className={`${styles.section} ${styles.fadeIn}`}>
        <h2 className={styles.sectionTitle}>Work Experience</h2>
        
        <div className={styles.experienceItem}>
          <div className={styles.experienceHeader}>
            <h3>iOS Developer Intern</h3>
            <span className={styles.period}>2025 - Present</span>
          </div>
          <p className={styles.company}>Sing Sharp Limited</p>
          <ul className={styles.achievements}>
            <li>Assist companies with development of iOS App serving 10,000+ active users</li>
            <li>Built efficient audio processing and video recording mechanisms with multi-threading</li>
            <li>Improved application performance through code optimization</li>
            <li>Integrated with Firebase Authentication, Firebase real-time database and WebRTC for user-to-user conversation</li>
            {/* <li>Implemented CI/CD pipelines reducing deployment time by 60%</li> */}
          </ul>
        </div>

        <div className={styles.experienceItem}>
          <div className={styles.experienceHeader}>
            <h3>DSE Physics Private Tutor</h3>
            <span className={styles.period}>2022 - 2023</span>
          </div>
          {/* <p className={styles.company}>Digital Solutions Co.</p> */}
          <ul className={styles.achievements}>
            <li>Explained abstract concepts to students with different academic levels</li>
            {/* <li>Collaborated with designers to implement pixel-perfect UIs</li>
            <li>Integrated third-party APIs and payment gateways</li> */}
            <li>Maintained 100% getting 5 or above in DSE across all students</li>
          </ul>
        </div>

        {/* <div className={styles.experienceItem}>
          <div className={styles.experienceHeader}>
            <h3>Junior Developer</h3>
            <span className={styles.period}>2019 - 2020</span>
          </div>
          <p className={styles.company}>StartUp Labs</p>
          <ul className={styles.achievements}>
            <li>Developed features for e-commerce platforms</li>
            <li>Fixed bugs and improved application stability</li>
            <li>Participated in agile development processes</li>
          </ul>
        </div> */}
      </section>

      {/* Skills Section */}
      <section className={`${styles.section} ${styles.fadeIn}`}>
        <h2 className={styles.sectionTitle}>Technical Skills</h2>
        
        <div className={styles.skillsGrid}>
          <div className={styles.skillCategory}>
            <h4>Frontend</h4>
            <div className={styles.skillTags}>
              <span>React</span>
              <span>Next.js</span>
              <span>TypeScript</span>
              <span>HTML/CSS</span>
              <span>Tailwind CSS</span>
            </div>
          </div>

          <div className={styles.skillCategory}>
            <h4>Backend</h4>
            <div className={styles.skillTags}>
              <span>Node.js</span>
              <span>Express</span>
              <span>FastAPI</span>
              <span>MongoDB</span>
              <span>Firebase</span>
              <span>REST APIs</span>
            </div>
          </div>

          <div className={styles.skillCategory}>
            <h4>Tools & Others</h4>
            <div className={styles.skillTags}>
              <span>Git</span>
              <span>Docker</span>
              <span>AWS</span>
              {/* <span>Jest</span> */}
              <span>CI/CD</span>
            </div>
          </div>
        </div>
      </section>

      {/* Education Section */}
      <section className={`${styles.section} ${styles.fadeIn}`}>
        <h2 className={styles.sectionTitle}>Education</h2>
        
        <div className={styles.educationItem}>
          <div className={styles.experienceHeader}>
            <h3>Bachelor of Engineering in Computer Science</h3>
            <span className={styles.period}>2022 - 2026</span>
          </div>
          <p className={styles.company}>The Hong Kong University of Science and Technology</p>
          <p className={styles.description}>MGPA: 3.57/4.3 • Dean's List in 2022-2023 Spring</p>
        </div>
      </section>

      {/* Projects Section */}
      <section className={`${styles.section} ${styles.fadeIn}`}>
        <h2 className={styles.sectionTitle}>Featured Projects</h2>
        
        <div className={styles.projectsGrid}>
          <div className={styles.projectCard}>
            <h3>iOS App "Vocal Coach" From Sing Sharp</h3>
            <p>Objective-C platform with low level Metal Shader, AudioUnit, Firebase authentication, and Firebase real-time database.</p>
            <div className={styles.projectTech}>
              <span>Objective-C</span>
              <span>Firebase</span>
              <span>Metal</span>
            </div>
          </div>

          <div className={styles.projectCard}>
            <h3>WebRTC Dashboard</h3>
            <p>one-to-one video conservation with real-time updates using Socket.io.</p>
            <div className={styles.projectTech}>
              <span>Express</span>
              <span>Node.js</span>
              <span>Socket.io</span>
            </div>
          </div>

          <div className={styles.projectCard}>
            <h3>LLM KV Cache Visualization Dashboard</h3>
            <p>Interactive web application with vLLM, and data visualization.</p>
            <div className={styles.projectTech}>
              <span>Next.js</span>
              <span>D3.js</span>
              <span>FastAPI</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={`${styles.footer} ${styles.fadeIn}`}>
        <p>© 2026 Alvin Kong</p>{/* All rights reserved. */}
        <p>Let's build something amazing together!</p>
      </footer>
    </main>
  );
}
