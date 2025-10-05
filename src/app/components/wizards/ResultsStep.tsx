'use client';
import { useState } from 'react';
import { TablePreview } from '@/app/components/TablePreview';
import { CoveragePanel } from '@/app/components/CoveragePanel';
import { ScoreBars } from '@/app/components/ScoreBars';
import { RuleFindings } from '@/app/components/RuleFindings';
import { ReportActions } from '@/app/components/ReportActions';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Card } from '@/components/ui/card';

interface Props {
  parsedData: any[];
  report: any; // Report type
  loading: boolean;
  error: string | null;
  onAnalyze: (q: any) => void;
  uploadId: string | null;
}

export function ResultsStep({ parsedData, report, loading, error, onAnalyze, uploadId }: Props) {
  const [questionnaire, setQuestionnaire] = useState({ webhooks: false, sandbox_env: false, retries: false });

  const handleQuestionnaireChange = (key: string, checked: boolean) => {
    setQuestionnaire((prev) => ({ ...prev, [key]: checked }));
  };

  if (loading) return <div className="text-center">Analyzing...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  if (!report) {
    return (
      <Card className="p-4">
        <h3>Questionnaire for Posture Score</h3>
        <div className="space-y-2">
          <label className="flex items-center">
            <Checkbox onCheckedChange={(checked) => handleQuestionnaireChange('webhooks', !!checked)} />
            Webhooks enabled
          </label>
          <label className="flex items-center">
            <Checkbox onCheckedChange={(checked) => handleQuestionnaireChange('sandbox_env', !!checked)} />
            Sandbox environment
          </label>
          <label className="flex items-center">
            <Checkbox onCheckedChange={(checked) => handleQuestionnaireChange('retries', !!checked)} />
            Retries configured
          </label>
        </div>
        <Button onClick={() => onAnalyze(questionnaire)} disabled={!uploadId} className="mt-4">
          Analyze
        </Button>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <TablePreview data={parsedData.slice(0, 20)} />
      <CoveragePanel coverage={report.coverage} />
      <ScoreBars scores={report.scores} />
      <RuleFindings findings={report.ruleFindings} />
      <ReportActions report={report} />
    </div>
  );
}
