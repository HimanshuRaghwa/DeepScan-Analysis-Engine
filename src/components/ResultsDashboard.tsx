'use client';

import React, { useState } from 'react';
import { Shield, ShieldAlert, ShieldCheck, AlertTriangle, Info, RefreshCw, Download, ChevronDown, ChevronUp, FileText, ExternalLink, Share2, Grid, Code } from 'lucide-react';
import styles from './ResultsDashboard.module.css';

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

interface ResultsDashboardProps {
  result: ScanResult;
  onReset: () => void;
}

// Generate mock engines
const MOCK_ENGINES = [
  'Kaspersky', 'McAfee', 'BitDefender', 'Symantec', 'Avast', 'Avira', 'Sophos', 'Malwarebytes',
  'TrendMicro', 'Cynet', 'CrowdStrike', 'Fortinet', 'PaloAlto', 'FireEye', 'SentinelOne', 'Cybereason',
  'ESET', 'Trellix', 'Webroot', 'F-Secure', 'GData', 'Comodo', 'AhnLab', 'DrWeb'
];

export default function ResultsDashboard({ result, onReset }: ResultsDashboardProps) {
  const [showDetails, setShowDetails] = useState(false);
  const [showEngines, setShowEngines] = useState(false);
  const [showSandbox, setShowSandbox] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  
  const getRiskIcon = () => {
    switch (result.riskLevel) {
      case 'Safe': return <ShieldCheck size={28} />;
      case 'Low': return <Shield size={28} />;
      case 'Medium': return <AlertTriangle size={28} />;
      case 'High': return <ShieldAlert size={28} />;
      default: return <Shield size={28} />;
    }
  };

  const getRiskClass = () => {
    switch (result.riskLevel) {
      case 'Safe': return styles.riskSafe;
      case 'Low': return styles.riskLow;
      case 'Medium': return styles.riskMedium;
      case 'High': return styles.riskHigh;
      default: return styles.riskSafe;
    }
  };

  const getRiskStylePrefix = () => {
    switch (result.riskLevel) {
      case 'Safe': return 'safe';
      case 'Low': return '';
      case 'Medium': return 'warning';
      case 'High': return 'danger';
      default: return 'safe';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleCopyLink = () => {
    try {
      const reportData = btoa(encodeURIComponent(JSON.stringify(result)));
      const url = `${window.location.origin}/?report=${reportData}`;
      navigator.clipboard.writeText(url);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    } catch (e) {
      console.error('Failed to copy link');
    }
  };

  const threatStatusClass = result.enginesFlagged > 0 
    ? (result.enginesFlagged > 3 ? styles.danger : styles.warning) 
    : styles.safe;

  // Generate deterministic engine results based on hash
  const getEngineResult = (engineName: string, index: number) => {
    if (result.enginesFlagged === 0) return true; // clean
    
    // Distribute flagged engines pseudorandomly based on hash and index
    const hashChar = result.hash.charCodeAt(index % result.hash.length);
    const threshold = (result.enginesFlagged / result.enginesTotal) * 255;
    
    return hashChar > threshold; // true = clean, false = flagged
  };

  return (
    <div className={styles.dashboardContainer}>
      <div className={styles.header}>
        <h2 className={styles.title}>Analysis Report</h2>
        <div className={styles.scanStatus}>
          <ShieldCheck size={16} /> Scan Completed
        </div>
      </div>

      <div className={styles.mainCard}>
        <div className={styles.cardHeader}>
          <div className={styles.fileInfo}>
            <h3>{result.fileName}</h3>
            <div className={styles.fileMeta}>
              {formatFileSize(result.fileSize)} • SHA-256: {result.hash.substring(0, 16)}...
            </div>
          </div>
          <div className={`${styles.riskBadge} ${getRiskClass()} ${result.riskLevel === 'High' ? 'glitch' : ''}`}>
            {getRiskIcon()}
            {result.riskLevel} Risk
          </div>
        </div>

        <div className={styles.statsGrid}>
          <div className={styles.statBox}>
            <div className={styles.statLabel}>Detection Ratio</div>
            <div className={`${styles.statValue} ${threatStatusClass}`}>
              {result.enginesFlagged} / {result.enginesTotal}
            </div>
          </div>
          <div className={styles.statBox}>
            <div className={styles.statLabel}>Threat Type</div>
            <div className={styles.statValue}>
              {result.malwareType || 'None'}
            </div>
          </div>
          <div className={styles.statBox}>
            <div className={styles.statLabel}>Threat Name</div>
            <div className={`${styles.statValue} ${result.riskLevel === 'High' ? 'glitch' : ''}`} style={{ fontSize: result.malwareName && result.malwareName.length > 15 ? '1.1rem' : '1.5rem' }}>
              {result.malwareName || 'Clean'}
            </div>
          </div>
        </div>

        <div className={`${styles.explanationSection} ${styles[getRiskStylePrefix()]}`}>
          <div className={styles.explanationTitle}>
            <Info size={18} /> What does this mean?
          </div>
          <p className={styles.explanationText}>
            {result.explanation}
            {result.enginesFlagged > 0 && result.malwareName && (
              <span>
                {' '}
                <a 
                  href={`https://www.google.com/search?q=${encodeURIComponent(result.malwareName + ' malware')}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className={styles.learnMoreLink}
                >
                  Learn more about {result.malwareName} <ExternalLink size={14} style={{ marginLeft: '4px' }} />
                </a>
              </span>
            )}
          </p>
        </div>

        <div className={styles.detailedReportContainer}>
          <div className={styles.tabButtons}>
            <button 
              className={`${styles.toggleDetailsButton} ${showDetails ? styles.activeTab : ''}`} 
              onClick={() => { setShowDetails(!showDetails); setShowEngines(false); setShowSandbox(false); }}
            >
              <FileText size={18} /> Overview
              {showDetails ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </button>
            <button 
              className={`${styles.toggleDetailsButton} ${showEngines ? styles.activeTab : ''}`} 
              onClick={() => { setShowEngines(!showEngines); setShowDetails(false); setShowSandbox(false); }}
            >
              <Grid size={18} /> Engines
              {showEngines ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </button>
            <button 
              className={`${styles.toggleDetailsButton} ${showSandbox ? styles.activeTab : ''}`} 
              onClick={() => { setShowSandbox(!showSandbox); setShowDetails(false); setShowEngines(false); }}
            >
              <Code size={18} /> Sandbox
              {showSandbox ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </button>
          </div>
          
          {showDetails && (
            <div className={`${styles.detailedReport} animate-fade-in`}>
              <h4 className={styles.detailedReportTitle}>Comprehensive Scan Details</h4>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>File Name:</span>
                <span className={styles.detailValue}>{result.fileName}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>File Size:</span>
                <span className={styles.detailValue}>{formatFileSize(result.fileSize)}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>SHA-256 Hash:</span>
                <span className={styles.detailValue} style={{ wordBreak: 'break-all' }}>{result.hash}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Engines Scanned:</span>
                <span className={styles.detailValue}>{result.enginesTotal}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Engines Flagged:</span>
                <span className={styles.detailValue}>{result.enginesFlagged}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Analysis Time:</span>
                <span className={styles.detailValue}>{new Date().toLocaleString()}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Static Analysis:</span>
                <span className={styles.detailValue}>{result.enginesFlagged > 0 ? 'Suspicious patterns detected' : 'No suspicious patterns detected'}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Heuristics:</span>
                <span className={styles.detailValue}>{result.enginesFlagged > 0 ? 'Potentially unsafe' : 'Clean'}</span>
              </div>
              
              {result.enginesFlagged > 0 && (
                <div className={styles.riskReasonContainer}>
                  <div className={styles.riskReasonLabel}>Detailed Risk Analysis:</div>
                  <div className={styles.riskReasonText}>
                    {result.malwareType === 'Test Virus' && 'This file signature perfectly matches an industry-standard test file (EICAR) used for verifying antivirus functionality. It demonstrates that the detection pipeline is active and working.'}
                    {result.malwareType === 'Riskware' && 'This file contains heuristic patterns often associated with keygens or cracking tools, which frequently bundle secondary payloads, unauthorized system modifications, or spyware.'}
                    {result.malwareType === 'Heuristic' && 'The file triggered generic suspicious patterns. This could be due to unexpected system calls, obfuscated code, or unusual file entropy indicating packing/encryption commonly used by malware.'}
                    {result.malwareType === 'Phishing' && 'The requested URL has been identified as a phishing site. It is designed to trick users into revealing sensitive information such as passwords or credit card numbers.'}
                    {!['Test Virus', 'Riskware', 'Heuristic', 'Phishing'].includes(result.malwareType || '') && result.explanation}
                  </div>
                </div>
              )}
            </div>
          )}

          {showEngines && (
            <div className={`${styles.detailedReport} animate-fade-in`}>
              <h4 className={styles.detailedReportTitle}>Engine Breakdown</h4>
              <div className={styles.engineGrid}>
                {MOCK_ENGINES.map((engine, index) => {
                  const isClean = getEngineResult(engine, index);
                  return (
                    <div key={engine} className={styles.engineItem}>
                      <span className={styles.engineName}>{engine}</span>
                      <span className={`${styles.engineResult} ${isClean ? styles.engineClean : styles.engineFlagged}`}>
                        {isClean ? 'Clean' : result.malwareName || 'Malicious'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {showSandbox && (
            <div className={`${styles.detailedReport} animate-fade-in`}>
              <h4 className={styles.detailedReportTitle}>Safe Sandbox Preview (Hex Dump)</h4>
              <div className={styles.sandboxPreview}>
                <code>
                  00000000  4d 5a 90 00 03 00 00 00  04 00 00 00 ff ff 00 00  |MZ..............|<br/>
                  00000010  b8 00 00 00 00 00 00 00  40 00 00 00 00 00 00 00  |........@.......|<br/>
                  00000020  00 00 00 00 00 00 00 00  00 00 00 00 00 00 00 00  |................|<br/>
                  00000030  00 00 00 00 00 00 00 00  00 00 00 00 80 00 00 00  |................|<br/>
                  00000040  0e 1f ba 0e 00 b4 09 cd  21 b8 01 4c cd 21 54 68  |........!..L.!Th|<br/>
                  00000050  69 73 20 70 72 6f 67 72  61 6d 20 63 61 6e 6e 6f  |is program canno|<br/>
                  00000060  74 20 62 65 20 72 75 6e  20 69 6e 20 44 4f 53 20  |t be run in DOS |<br/>
                  00000070  6d 6f 64 65 2e 0d 0d 0a  24 00 00 00 00 00 00 00  |mode....$.......|<br/>
                </code>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className={styles.actions}>
        <button className={styles.actionButton} onClick={onReset}>
          <RefreshCw size={18} />
          New Scan
        </button>
        <button className={styles.actionButton} onClick={handleCopyLink}>
          <Share2 size={18} />
          {linkCopied ? 'Link Copied!' : 'Share Link'}
        </button>
        <button className={`${styles.actionButton} ${styles.primary}`} onClick={() => window.print()}>
          <Download size={18} />
          Download PDF
        </button>
      </div>
    </div>
  );
}
