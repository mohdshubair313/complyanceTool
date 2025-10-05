'use client'; // Client component for interactivity

import { useState } from 'react';
import { Wizard } from '@/app/components/wizards/Wizard'; // Custom wizard wrapper
import { ContextStep } from '@/app/components/wizards/ContextStep';
import { UploadStep } from '@/app/components/wizards/UploadStep';
import { ResultsStep } from '@/app/components/wizards/ResultsStep';
import { type Report } from '@/app/types';

export default function Home() {
  const [currentStep, setCurrentStep] = useState(1);
  const [contextData, setContextData] = useState({ country: '', erp: '' });
  const [uploadId, setUploadId] = useState<string | null>(null);
  const [parsedData, setParsedData] = useState<any[]>([]); // First 200 rows
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleNext = (data: any) => {
    if (currentStep === 1) {
      setContextData(data);
      setCurrentStep(2);
    } else if (currentStep === 2) {
      // Upload logic here, call /upload API
      setLoading(true);
      setError(null);
      // Simulate upload (actual in UploadStep)
      // After upload, setUploadId, parse data, go to step 3
      setCurrentStep(3);
      setLoading(false);
    }
  };

  const handleAnalyze = async (questionnaire: { webhooks: boolean; sandbox_env: boolean; retries: boolean }) => {
    if (!uploadId) return;
    setLoading(true);
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uploadId, questionnaire }),
      });
      const data = await res.json();
      setReport(data);
    } catch (err) {
      setError('Analysis failed');
    }
    setLoading(false);
  };

  const steps = [
    <ContextStep key="context" onNext={handleNext} />,
    <UploadStep key="upload" context={contextData} onNext={() => handleNext(undefined)} setUploadId={setUploadId} setParsedData={setParsedData} />,
    <ResultsStep
      key="results"
      parsedData={parsedData}
      report={report}
      loading={loading}
      error={error}
      onAnalyze={handleAnalyze}
      uploadId={uploadId}
    />,
  ];

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <h1 className="text-3xl font-bold mb-8">Invoice Readiness Tool</h1>
      <Wizard currentStep={currentStep} steps={steps} />
    </div>
  );
}
