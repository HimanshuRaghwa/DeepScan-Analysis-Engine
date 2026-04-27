'use client';

import React, { useState, useRef, ChangeEvent, DragEvent } from 'react';
import { UploadCloud, File as FileIcon, X, Search, AlertCircle, Folder, Link, Hash } from 'lucide-react';
import styles from './FileUploader.module.css';

interface FileUploaderProps {
  onScanComplete: (result: any) => void;
}

type ScanMode = 'file' | 'folder' | 'url' | 'hash';

export default function FileUploader({ onScanComplete }: FileUploaderProps) {
  const [scanMode, setScanMode] = useState<ScanMode>('file');
  const [file, setFile] = useState<File | null>(null);
  const [urlValue, setUrlValue] = useState('');
  const [hashValue, setHashValue] = useState('');
  
  const [isDragging, setIsDragging] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

  const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const validateAndSetFile = (selectedFile: File) => {
    setError(null);
    if (selectedFile.size > MAX_FILE_SIZE) {
      setError('File size exceeds the 100MB limit.');
      return;
    }
    setFile(selectedFile);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const clearInput = () => {
    setFile(null);
    setUrlValue('');
    setHashValue('');
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (folderInputRef.current) folderInputRef.current.value = '';
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleScan = async () => {
    if (scanMode === 'file' || scanMode === 'folder') {
      if (!file) return;
    } else if (scanMode === 'url') {
      if (!urlValue.trim()) return;
    } else if (scanMode === 'hash') {
      if (!hashValue.trim()) return;
    }

    setIsScanning(true);
    setProgress(0);
    setError(null);

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 10;
      });
    }, 200);

    try {
      const formData = new FormData();
      formData.append('scanType', scanMode);
      
      if (scanMode === 'file' || scanMode === 'folder') {
        if (file) formData.append('file', file);
      } else if (scanMode === 'url') {
        formData.append('url', urlValue);
      } else if (scanMode === 'hash') {
        formData.append('hash', hashValue);
      }

      const response = await fetch('/api/scan', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to scan target');
      }

      const data = await response.json();
      
      clearInterval(progressInterval);
      setProgress(100);
      
      setTimeout(() => {
        onScanComplete(data);
        setIsScanning(false);
        clearInput();
        setProgress(0);
      }, 500);

    } catch (err) {
      clearInterval(progressInterval);
      setError('An error occurred during the scan. Please try again.');
      setIsScanning(false);
      setProgress(0);
    }
  };

  const switchMode = (mode: ScanMode) => {
    setScanMode(mode);
    clearInput();
  };

  const renderActiveInput = () => {
    if (scanMode === 'file' || scanMode === 'folder') {
      if (file) {
        return (
          <div className={`${styles.selectedFile} animate-scale-in`}>
            <div className={styles.fileInfo}>
              <FileIcon className={styles.fileIcon} size={24} />
              <div>
                <div className={styles.fileName}>{file.name}</div>
                <div className={styles.fileSize}>{formatFileSize(file.size)}</div>
              </div>
            </div>
            <button className={styles.removeButton} onClick={clearInput}>
              <X size={20} />
            </button>
          </div>
        );
      }

      return (
        <div 
          className={`${styles.dropzone} ${isDragging ? styles.dropzoneActive : ''} animate-fade-in`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => scanMode === 'file' ? fileInputRef.current?.click() : folderInputRef.current?.click()}
        >
          <div className={styles.iconContainer}>
            {scanMode === 'file' ? <UploadCloud size={32} /> : <Folder size={32} />}
          </div>
          <h3 className={styles.title}>
            {scanMode === 'file' ? 'Drag & Drop your file here' : 'Select a folder to scan'}
          </h3>
          <p className={styles.subtitle}>
            {scanMode === 'file' ? 'Supports all file types up to 100MB' : 'Supports folders up to 100MB (demo)'}
          </p>
          <button className={styles.browseButton}>
            {scanMode === 'file' ? 'Browse Files' : 'Browse Folders'}
          </button>
          
          <input 
            type="file" 
            className={styles.fileInput} 
            ref={fileInputRef}
            onChange={handleFileChange}
            onClick={(e) => e.stopPropagation()}
          />
          <input 
            type="file" 
            className={styles.fileInput} 
            ref={folderInputRef}
            onChange={handleFileChange}
            onClick={(e) => e.stopPropagation()}
            {...({ webkitdirectory: "true", directory: "true" } as any)}
          />
        </div>
      );
    }

    if (scanMode === 'url') {
      return (
        <div className={`${styles.textInputContainer} animate-fade-in`}>
          <label className={styles.textInputLabel}>
            <Link size={18} /> Enter URL to Scan
          </label>
          <input 
            type="url" 
            className={styles.textInput} 
            placeholder="https://example.com"
            value={urlValue}
            onChange={(e) => setUrlValue(e.target.value)}
          />
        </div>
      );
    }

    if (scanMode === 'hash') {
      return (
        <div className={`${styles.textInputContainer} animate-fade-in`}>
          <label className={styles.textInputLabel}>
            <Hash size={18} /> Enter SHA-256 Hash
          </label>
          <input 
            type="text" 
            className={styles.textInput} 
            placeholder="e.g. 44d88612fea8a8f36de82e1278abb02f"
            value={hashValue}
            onChange={(e) => setHashValue(e.target.value)}
          />
        </div>
      );
    }
  };

  const getTargetName = () => {
    if (scanMode === 'file' || scanMode === 'folder') return file?.name;
    if (scanMode === 'url') return urlValue;
    if (scanMode === 'hash') return 'Hash Database';
    return '';
  };

  const hasInput = !!file || !!urlValue.trim() || !!hashValue.trim();

  return (
    <div className={styles.uploaderContainer}>
      {!isScanning && (
        <div className={styles.tabs}>
          <button 
            className={`${styles.tab} ${scanMode === 'file' ? styles.tabActive : ''}`}
            onClick={() => switchMode('file')}
          >
            <FileIcon size={16} /> File
            <span className={styles.tooltip}>Scan a single file for malware and suspicious patterns.</span>
          </button>
          <button 
            className={`${styles.tab} ${scanMode === 'folder' ? styles.tabActive : ''}`}
            onClick={() => switchMode('folder')}
          >
            <Folder size={16} /> Folder
            <span className={styles.tooltip}>Upload and scan a local folder directly from your computer.</span>
          </button>
          <button 
            className={`${styles.tab} ${scanMode === 'url' ? styles.tabActive : ''}`}
            onClick={() => switchMode('url')}
          >
            <Link size={16} /> URL
            <span className={styles.tooltip}>Analyze a website or link for phishing and malicious payloads.</span>
          </button>
          <button 
            className={`${styles.tab} ${scanMode === 'hash' ? styles.tabActive : ''}`}
            onClick={() => switchMode('hash')}
          >
            <Hash size={16} /> Hash
            <span className={styles.tooltip}>Search our database using a SHA-256 cryptographic hash.</span>
          </button>
        </div>
      )}

      {!isScanning && renderActiveInput()}

      {error && (
        <div className={styles.errorText}>
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      {hasInput && !isScanning && (
        <button className={`${styles.scanButton} animate-fade-in`} onClick={handleScan}>
          <Search size={18} />
          Start Deep Scan
        </button>
      )}

      {isScanning && (
        <div className={`${styles.progressContainer} animate-fade-in`}>
          <div className={styles.radarContainer}>
            <div className={styles.radarGrid}></div>
            <div className={styles.radarSweep}></div>
            <div className={styles.radarBlip}></div>
          </div>
          <span className={styles.progressText}>Analyzing {getTargetName()}...</span>
          <span className={styles.progressPercentage}>{progress}%</span>
        </div>
      )}
    </div>
  );
}
