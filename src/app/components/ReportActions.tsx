'use client';
import { Button } from '@/components/ui/button';
import { Download, Share2 } from 'lucide-react'; // Icons if needed, install lucide-react

interface Props {
  report: any;
}

export function ReportActions({ report }: Props) {
  const handleDownload = () => {
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `report-${report.reportId}.json`;
    a.click();
  };

  const handleShare = () => {
    const url = `${window.location.origin}/api/report/${report.reportId}`;
    navigator.clipboard.writeText(url);
    alert('Link copied!');
  };

  return (
    <div className="flex gap-4">
      <Button onClick={handleDownload}>
        <Download className="mr-2 h-4 w-4" /> Download JSON
      </Button>
      <Button onClick={handleShare} variant="outline">
        <Share2 className="mr-2 h-4 w-4" /> Copy Share Link
      </Button>
    </div>
  );
}
