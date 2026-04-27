'use client';

import React, { useEffect, useState } from 'react';
import { History, FileText, Search, Filter } from 'lucide-react';
import styles from './ScanHistory.module.css';

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

interface HistoryItem extends ScanResult {
  date: string;
}

interface ScanHistoryProps {
  onSelectHistoryItem: (item: ScanResult) => void;
}

export default function ScanHistory({ onSelectHistoryItem }: ScanHistoryProps) {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isClient, setIsClient] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRisk, setFilterRisk] = useState('All');

  useEffect(() => {
    setIsClient(true);
    const storedHistory = localStorage.getItem('deepscan_history');
    if (storedHistory) {
      try {
        setHistory(JSON.parse(storedHistory));
      } catch (e) {
        console.error('Failed to parse scan history');
      }
    }
  }, []);

  const getRiskClass = (level: string) => {
    switch (level) {
      case 'Safe': return styles.riskSafe;
      case 'Low': return styles.riskLow;
      case 'Medium': return styles.riskMedium;
      case 'High': return styles.riskHigh;
      default: return styles.riskSafe;
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    }).format(date);
  };

  const filteredHistory = history.filter(item => {
    const matchesSearch = item.fileName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterRisk === 'All' || item.riskLevel === filterRisk;
    return matchesSearch && matchesFilter;
  });

  if (!isClient) return null;

  return (
    <div className={styles.historyContainer}>
      <div className={styles.headerRow}>
        <h3 className={styles.title}>
          <History size={20} />
          Recent Scans
        </h3>
      </div>
      
      {history.length > 0 && (
        <div className={styles.controlsRow}>
          <div className={styles.searchBox}>
            <Search size={14} className={styles.searchIcon} />
            <input 
              type="text" 
              placeholder="Search..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={styles.searchInput}
            />
          </div>
          <div className={styles.filterBox}>
            <Filter size={14} className={styles.filterIcon} />
            <select 
              value={filterRisk} 
              onChange={(e) => setFilterRisk(e.target.value)}
              className={styles.filterSelect}
            >
              <option value="All">All Risks</option>
              <option value="Safe">Safe</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </div>
        </div>
      )}
      
      {history.length === 0 ? (
        <div className={styles.emptyState}>
          No recent scans found. Start scanning to see your history.
        </div>
      ) : filteredHistory.length === 0 ? (
        <div className={styles.emptyState}>
          No scans match your filters.
        </div>
      ) : (
        <div className={styles.historyList}>
          {filteredHistory.map((item, index) => (
            <div 
              key={index} 
              className={styles.historyItem}
              onClick={() => onSelectHistoryItem(item)}
            >
              <div className={styles.itemLeft}>
                <FileText className={styles.fileIcon} size={20} />
                <div className={styles.fileInfo}>
                  <span className={styles.fileName}>{item.fileName}</span>
                  <span className={styles.scanDate}>{formatDate(item.date)}</span>
                </div>
              </div>
              <div className={`${styles.riskBadge} ${getRiskClass(item.riskLevel)}`}>
                {item.riskLevel}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
