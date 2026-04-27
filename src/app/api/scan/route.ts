import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const scanType = formData.get('scanType') as string || 'file';
    const file = formData.get('file') as File | null;
    const url = formData.get('url') as string | null;
    const hashParam = formData.get('hash') as string | null;

    let hash = '';
    let fileName = '';
    let fileSize = 0;

    if (scanType === 'file' || scanType === 'folder') {
      if (!file) {
        return NextResponse.json({ error: 'No file provided' }, { status: 400 });
      }
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      hash = crypto.createHash('sha256').update(buffer).digest('hex');
      fileName = file.name;
      fileSize = file.size;
    } else if (scanType === 'url') {
      if (!url) return NextResponse.json({ error: 'No URL provided' }, { status: 400 });
      hash = crypto.createHash('sha256').update(url).digest('hex');
      fileName = url;
      fileSize = url.length;
    } else if (scanType === 'hash') {
      if (!hashParam) return NextResponse.json({ error: 'No Hash provided' }, { status: 400 });
      hash = hashParam;
      fileName = `Hash Search: ${hashParam.substring(0, 8)}...`;
      fileSize = 0;
    }

    const vtApiKey = process.env.VIRUSTOTAL_API_KEY;

    if (vtApiKey) {
      console.log('API Key present, would call VT with hash:', hash);
    }

    // Simulate scanning delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Mock Logic based on file name, URL, or Hash to provide dynamic results
    const lowerFileName = fileName.toLowerCase();
    const hashLower = hash.toLowerCase();
    
    let result = {
      hash,
      fileName,
      fileSize,
      enginesTotal: 72,
      enginesFlagged: 0,
      riskLevel: 'Safe',
      malwareName: null as string | null,
      malwareType: null as string | null,
      explanation: 'No threats were detected by any of our security engines. The target appears to be safe.',
    };

    // If it's a hash scan, we can use specific mock hash prefixes, otherwise use filename keywords
    const isHighRisk = lowerFileName.includes('eicar') || lowerFileName.includes('virus') || lowerFileName.includes('malware') || lowerFileName.includes('phishing.com') || hashLower.startsWith('44d88612');
    const isMediumRisk = lowerFileName.includes('crack') || lowerFileName.includes('keygen') || lowerFileName.includes('torrent') || hashLower.startsWith('deadbeef');
    const isLowRisk = (lowerFileName.endsWith('.exe') && fileSize > 10 * 1024 * 1024) || lowerFileName.includes('suspicious') || hashLower.startsWith('8badf00d');

    if (isHighRisk) {
      result.enginesFlagged = 64;
      result.riskLevel = 'High';
      result.malwareName = scanType === 'url' ? 'Phishing Site' : (scanType === 'hash' ? 'Trojan.Win32.Emotet' : 'EICAR-Test-File');
      result.malwareType = scanType === 'url' ? 'Phishing' : (scanType === 'hash' ? 'Trojan' : 'Test Virus');
      result.explanation = 'This target is explicitly flagged as highly dangerous. Do not proceed or open this target.';
    } else if (isMediumRisk) {
      result.enginesFlagged = 15;
      result.riskLevel = 'Medium';
      result.malwareName = scanType === 'hash' ? 'Adware.Mac.Crossrider' : 'HackTool.Win32.Keygen';
      result.malwareType = scanType === 'hash' ? 'Adware' : 'Riskware';
      result.explanation = 'This target exhibits behaviors common to software cracks or risky domains. They often carry hidden malware or spyware.';
    } else if (isLowRisk) {
       result.enginesFlagged = 2;
       result.riskLevel = 'Low';
       result.malwareName = 'Suspicious.Cloud.Gen';
       result.malwareType = 'Heuristic';
       result.explanation = 'A few engines flagged this target based on heuristic analysis. It might be a false positive, but proceed with caution.';
    }

    return NextResponse.json(result);

  } catch (error) {
    console.error('Error in scan API:', error);
    return NextResponse.json({ error: 'Internal server error during scanning' }, { status: 500 });
  }
}
