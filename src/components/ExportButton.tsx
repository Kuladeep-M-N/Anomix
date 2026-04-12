import { useState } from 'react';
import { FileDown, FileText, Table as TableIcon, Copy, Link as LinkIcon, Check } from 'lucide-react';
import { useStore } from '../store/useStore';
import { generatePDFReport } from '../utils/reportGenerator';

export function ExportButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const { data, alerts, selectedPlatform } = useStore();

  const handleExportPDF = () => {
    generatePDFReport(data, alerts, selectedPlatform);
    setIsOpen(false);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-all font-bold text-xs shadow-lg shadow-blue-600/20 uppercase tracking-wider"
      >
        <FileDown size={14} />
        Export Report
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-56 bg-gray-900 border border-white/10 rounded-2xl shadow-2xl z-50 p-2 overflow-hidden backdrop-blur-xl">
            <button 
              onClick={handleExportPDF}
              className="w-full flex items-center gap-3 px-4 py-3 text-left text-xs font-bold text-gray-300 hover:bg-white/5 hover:text-white rounded-xl transition-colors uppercase tracking-wider"
            >
              <FileText size={16} className="text-blue-400" />
              Export as PDF
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-3 text-left text-xs font-bold text-gray-300 hover:bg-white/5 hover:text-white rounded-xl transition-colors uppercase tracking-wider">
              <TableIcon size={16} className="text-emerald-400" />
              Export as CSV
            </button>
            <div className="h-[1px] bg-white/5 my-1" />
            <button 
              onClick={handleCopyLink}
              className="w-full flex items-center gap-3 px-4 py-3 text-left text-xs font-bold text-gray-300 hover:bg-white/5 hover:text-white rounded-xl transition-colors uppercase tracking-wider"
            >
              {copied ? <Check size={16} className="text-emerald-400" /> : <LinkIcon size={16} className="text-purple-400" />}
              {copied ? 'Link Copied!' : 'Share Dashboard'}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
