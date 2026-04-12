import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';
import type { DataPoint, Alert } from '../store/useStore';

export const generatePDFReport = (data: DataPoint[], alerts: Alert[], platform: string) => {
  const doc = new jsPDF();
  const timestamp = format(new Date(), 'yyyy-MM-dd HH:mm:ss');

  // Page 1: Cover
  doc.setFillColor(15, 23, 42); // Navy blue
  doc.rect(0, 0, 210, 297, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(40);
  doc.text('ANOMIX', 105, 100, { align: 'center' });
  
  doc.setFontSize(20);
  doc.text('Trend Analysis Report', 105, 120, { align: 'center' });
  
  doc.setFontSize(12);
  doc.text(`Platform: ${platform.toUpperCase()}`, 105, 140, { align: 'center' });
  doc.text(`Generated: ${timestamp}`, 105, 150, { align: 'center' });

  // Page 2: Summary
  doc.addPage();
  doc.setTextColor(31, 41, 55);
  doc.setFontSize(22);
  doc.text('Executive Summary', 20, 30);
  
  const anomalies = data.filter(d => d.isAnomaly);
  const criticalAlerts = alerts.filter(a => a.severity === 'CRITICAL');

  autoTable(doc, {
    startY: 40,
    head: [['Metric', 'Value']],
    body: [
      ['Total Data Points', data.length.toString()],
      ['Detected Anomalies', anomalies.length.toString()],
      ['Critical Alerts', criticalAlerts.length.toString()],
      ['Average Engagement', (data.reduce((acc, curr) => acc + curr.engagement, 0) / data.length || 0).toFixed(2)],
      ['Primary Platform', platform],
    ],
    theme: 'striped',
    headStyles: { fillStyle: 'F', fillColor: [59, 130, 246] }
  });

  // Page 3: Alerts Table
  doc.addPage();
  doc.setFontSize(22);
  doc.text('Detailed Alert Log', 20, 30);
  
  autoTable(doc, {
    startY: 40,
    head: [['Time', 'Topic', 'Severity', 'Confidence', 'Algorithm']],
    body: alerts.map(a => [
      format(a.timestamp, 'HH:mm:ss'),
      a.topic,
      a.severity,
      `${a.confidence.toFixed(0)}%`,
      a.metadata.algorithm
    ]),
    headStyles: { fillStyle: 'F', fillColor: [239, 68, 68] }
  });

  doc.save(`anomix_report_${platform}_${format(new Date(), 'yyyyMMdd_HHmm')}.pdf`);
};
