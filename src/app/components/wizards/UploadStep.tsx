'use client';
import { useState } from 'react';
import Papa from 'papaparse';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';

interface Props {
  context: { country: string; erp: string };
  onNext: () => void;
  setUploadId: (id: string) => void;
  setParsedData: (data: any[]) => void;
}

export function UploadStep({ context, onNext, setUploadId, setParsedData }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [text, setText] = useState('');
  const [preview, setPreview] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      if (selectedFile.name.endsWith('.csv')) {
        Papa.parse(selectedFile, {
          header: true,
          complete: (results) => {
            const limited = results.data.slice(0, 20); // Preview
            setPreview(limited);
            setParsedData(results.data.slice(0, 200)); // Full for analysis
          },
        });
      } else if (selectedFile.name.endsWith('.json')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const data = JSON.parse(e.target?.result as string);
          setPreview(data.slice(0, 20));
          setParsedData(data.slice(0, 200));
        };
        reader.readAsText(selectedFile);
      }
    }
  };

  const handlePaste = () => {
    // Parse text as CSV/JSON
    try {
      const data = JSON.parse(text);
      setPreview(data.slice(0, 20));
      setParsedData(data.slice(0, 200));
    } catch {
      Papa.parse(text, { header: true, complete: (results) => {
        setPreview(results.data.slice(0, 20));
        setParsedData(results.data.slice(0, 200));
      }});
    }
  };

  const handleUpload = async () => {
    if (!file && !text) return;
    setUploading(true);
    const formData = new FormData();
    if (file) {
      formData.append('file', file);
    } else {
      formData.append('text', text);
    }
    formData.append('country', context.country);
    formData.append('erp', context.erp);

    try {
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const { uploadId } = await res.json();
      setUploadId(uploadId);
      onNext();
    } catch (err) {
      console.error(err);
    }
    setUploading(false);
  };

  return (
    <Card className="p-4">
      <div className="space-y-4">
        <div>
          <Label htmlFor="file">Upload CSV/JSON</Label>
          <Input id="file" type="file" accept=".csv,.json" onChange={handleFileChange} />
        </div>
        <div>
          <Label>Or Paste Data</Label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full p-2 border rounded"
            rows={5}
          />
          <Button onClick={handlePaste} className="mt-2">Parse Paste</Button>
        </div>
        {preview.length > 0 && (
          <div>
            <h3>Preview (First 20 Rows)</h3>
            <pre className="overflow-auto max-h-40">{JSON.stringify(preview, null, 2)}</pre>
          </div>
        )}
        <Button onClick={handleUpload} disabled={uploading || (!file && !text)}>
          {uploading ? 'Uploading...' : 'Upload & Analyze'}
        </Button>
      </div>
    </Card>
  );
}
