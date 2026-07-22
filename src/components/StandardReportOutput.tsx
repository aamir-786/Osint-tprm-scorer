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

  const handleExportPDF = () => {
    // Convert basic markdown to structured HTML for the PDF
    const lines = markdownContent.split('\n');
    let htmlContent = `<div style="font-family: 'Inter', system-ui, sans-serif; color: #1e293b; max-width: 800px; margin: 0 auto; padding: 40px;">`;
    htmlContent += `<div style="display: flex; align-items: center; border-bottom: 2px solid #e2e8f0; padding-bottom: 20px; margin-bottom: 30px;">`;
    htmlContent += `<div><h1 style="margin: 0; color: #0f172a; font-size: 24px;">Wahid AI Governance</h1><p style="margin: 4px 0 0; color: #64748b; font-size: 14px;">Third-Party Risk Management • Vendor OSINT Report</p></div>`;
    htmlContent += `</div>`;
    
    htmlContent += `<div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin-bottom: 30px;">`;
    
    let inTable = false;
    
    lines.forEach(line => {
      if (line.startsWith('VENDOR:')) {
        htmlContent += `<h2 style="margin: 0 0 10px; color: #0f172a; font-size: 18px;">${line}</h2>`;
      } else if (line.startsWith('OVERALL SCORE:')) {
        const parts = line.split('-');
        htmlContent += `<div style="display: flex; justify-content: space-between; align-items: center; margin-top: 15px;">`;
        htmlContent += `<div style="font-size: 20px; font-weight: bold; color: #3b82f6;">${parts[0]}</div>`;
        if (parts[1]) htmlContent += `<div style="font-size: 20px; font-weight: bold; padding: 4px 12px; background: #dbeafe; color: #1d4ed8; border-radius: 4px;">${parts[1]}</div>`;
        htmlContent += `</div>`;
      } else if (line.startsWith('CATEGORY BREAKDOWN:')) {
        htmlContent += `</div><h3 style="margin: 30px 0 15px; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px;">Category Breakdown</h3>`;
      } else if (line.includes('| Category | Findings |')) {
        inTable = true;
        htmlContent += `<table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 12px; text-align: left;">`;
        htmlContent += `<tr style="background: #f1f5f9; border-bottom: 2px solid #cbd5e1;">`;
        line.split('|').filter(Boolean).forEach(h => htmlContent += `<th style="padding: 10px;">${h.trim()}</th>`);
        htmlContent += `</tr>`;
      } else if (line.startsWith('|---') || line.startsWith('|-')) {
        // Skip table separator
      } else if (inTable && line.startsWith('|')) {
        htmlContent += `<tr style="border-bottom: 1px solid #e2e8f0;">`;
        line.split('|').filter(Boolean).forEach(c => htmlContent += `<td style="padding: 10px;">${c.trim()}</td>`);
        htmlContent += `</tr>`;
      } else if (inTable && line.trim() === '') {
        inTable = false;
        htmlContent += `</table>`;
      } else if (line.startsWith('KEY FINDINGS:')) {
        htmlContent += `<h3 style="margin: 30px 0 15px; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px;">Key Findings</h3>`;
      } else if (line.startsWith('- ')) {
        htmlContent += `<div style="margin-bottom: 8px; padding-left: 15px; position: relative;"><span style="position: absolute; left: 0; color: #ef4444;">•</span>${line.substring(2)}</div>`;
      } else if (line.trim() !== '') {
        htmlContent += `<p style="margin: 5px 0; color: #475569; font-size: 14px;">${line}</p>`;
      }
    });
    
    if (inTable) htmlContent += `</table>`;
    htmlContent += `</div>`;

    const printWindow = window.open('', '', 'width=900,height=800');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>${companyName} - TPRM Report</title>
            <style>
              @media print {
                body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
              }
              body { font-family: 'Inter', system-ui, sans-serif; }
            </style>
          </head>
          <body>
            ${htmlContent}
            <script>
              setTimeout(() => {
                window.print();
                window.close();
              }, 250);
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
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
          <button type="button" className="btn btn-primary" onClick={handleExportPDF} style={{ fontSize: '0.8rem', padding: '6px 12px' }}>
            <Download size={14} /> Export PDF
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
