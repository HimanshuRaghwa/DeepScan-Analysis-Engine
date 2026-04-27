'use client';

import React, { useState, useEffect } from 'react';
import { Shield, Moon, Sun, Link } from 'lucide-react';
import FileUploader from '../components/FileUploader';
import ResultsDashboard from '../components/ResultsDashboard';
import ScanHistory from '../components/ScanHistory';
import styles from './page.module.css';

interface ScanResult {
  hash: string;
  fileName: string;
  fileSize: number;
  enginesTotal: number;
  enginesFlagged: number;
  riskLevel: 'Safe' | 'Low' | 'Medium' | 'High';
  malwareName: string | null;
  malwareType: string | null;
  explanation: string;
}

export default function Home() {
  const [currentResult, setCurrentResult] = useState<ScanResult | null>(null);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  useEffect(() => {
    // Check URL for shared report
    const params = new URLSearchParams(window.location.search);
    const reportStr = params.get('report');
    if (reportStr) {
      try {
        const decoded = JSON.parse(decodeURIComponent(atob(reportStr)));
        setCurrentResult(decoded);
      } catch (e) {
        console.error('Invalid report link');
      }
    }

    // Load theme
    const savedTheme = localStorage.getItem('deepscan_theme') as 'dark' | 'light';
    if (savedTheme) {
      setTheme(savedTheme);
      if (savedTheme === 'light') {
        document.body.classList.add('light-theme');
      }
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('deepscan_theme', newTheme);
    if (newTheme === 'light') {
      document.body.classList.add('light-theme');
    } else {
      document.body.classList.remove('light-theme');
    }
  };

  const handleScanComplete = (result: ScanResult) => {
    setCurrentResult(result);
    saveToHistory(result);
  };

  const saveToHistory = (result: ScanResult) => {
    const storedHistory = localStorage.getItem('deepscan_history');
    let history = storedHistory ? JSON.parse(storedHistory) : [];
    
    // Add new result with date
    const historyItem = { ...result, date: new Date().toISOString() };
    
    // Add to beginning of array and keep only last 10
    history = [historyItem, ...history].slice(0, 10);
    
    localStorage.setItem('deepscan_history', JSON.stringify(history));
  };

  const handleReset = () => {
    setCurrentResult(null);
  };

  const handleSelectHistoryItem = (item: ScanResult) => {
    setCurrentResult(item);
  };

  return (
    <main className={styles.main}>
      <div className={styles.gridBackground}></div>
      <div className={styles.gridOverlay}></div>
      
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.logo}>
            <Shield size={28} />
          </div>
          <h1 className={styles.title}>DeepScan</h1>
        </div>
        <button className={styles.themeToggle} onClick={toggleTheme} aria-label="Toggle theme">
          {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </header>

      <div className={styles.content}>
        {!currentResult && (
          <div className={styles.hero}>
            <h2 className={styles.heroTitle}>Intelligent Malware Analyzer</h2>
            <p className={styles.heroSubtitle}>
              Upload any file to perform a deep security scan against multiple antivirus engines.
              Get real-time insights and a simple explanation of potential threats.
            </p>
          </div>
        )}

        {!currentResult ? (
          <>
            <FileUploader onScanComplete={handleScanComplete} />
            
            <div className={styles.connectSection}>
              <h3 className={styles.connectTitle}>Connect with Developer</h3>
              <div className={styles.socialContainer}>
                <a 
                  href="https://www.linkedin.com/in/himanshu-raghwa/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className={styles.linkedinButton}
                >
                  <Link size={20} />
                  <span>LinkedIn</span>
                </a>
              </div>
            </div>

            <ScanHistory onSelectHistoryItem={handleSelectHistoryItem} />
          </>
        ) : (
          <ResultsDashboard result={currentResult} onReset={handleReset} />
        )}
      </div>

      <footer className={styles.footer}>
        <p>DeepScan Demo Application • {new Date().getFullYear()}</p>
        <p style={{ marginTop: '0.5rem', fontSize: '0.75rem', opacity: 0.7 }}>
          * Results are simulated for demonstration purposes unless a valid API key is provided.
        </p>
        <p className="glitch" style={{ marginTop: '1.5rem', fontWeight: 'bold', color: 'var(--primary)', letterSpacing: '1px' }}>
          Made by Himanshu Raghwa
        </p>
      </footer>
    </main>
  );
}
