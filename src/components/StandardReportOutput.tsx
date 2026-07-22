import { useState } from 'react';
import { FileText, Copy, Download, Check } from 'lucide-react';

interface Props {
  markdownContent: string;
  companyName: string;
}

export const StandardReportOutput: React.FC<Props> = ({ markdownContent, companyName }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(markdownContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const filename = `${companyName.toLowerCase().replace(/[^a-z0-9]/g, '_')}_tprm_report.md`;
    const blob = new Blob([markdownContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
        <div className="card-title" style={{ margin: 0 }}>
          <FileText size={20} color="#818cf8" />
          <span>Standardized Output Report (Model v2.0 Format)</span>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button type="button" className="btn btn-secondary" onClick={handleCopy} style={{ fontSize: '0.8rem', padding: '6px 12px' }}>
            {copied ? <Check size={14} color="#34d399" /> : <Copy size={14} />}
            {copied ? 'Copied!' : 'Copy Markdown'}
          </button>
          <button type="button" className="btn btn-primary" onClick={handleDownload} style={{ fontSize: '0.8rem', padding: '6px 12px' }}>
            <Download size={14} /> Download .md
          </button>
        </div>
      </div>

      <pre style={{
        background: '#f8fafc',
        border: '1px solid #cbd5e1',
        borderRadius: '8px',
        padding: '16px',
        fontSize: '0.75rem',
        fontFamily: 'var(--font-mono)',
        color: '#334155',
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word',
        maxHeight: '400px',
        overflowY: 'auto',
        margin: 0
      }}>
        {markdownContent}
      </pre>
    </div>
  );
};
