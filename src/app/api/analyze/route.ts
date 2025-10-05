import { NextRequest, NextResponse } from 'next/server';
import supabase from '@/app/lib/db';
import { runFieldMapping } from '@/app/lib/mapper';
import { runRules } from '@/app/lib/rules';
import { calculateScores } from '@/app/lib/scorer';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';

const schema = z.object({
  uploadId: z.string(),
  questionnaire: z.object({
    webhooks: z.boolean(),
    sandbox_env: z.boolean(),
    retries: z.boolean(),
  }),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { uploadId, questionnaire } = schema.parse(body);

    const { data: upload, error } = await supabase
      .from('uploads')
      .select('country, erp, rows_parsed, data')
      .eq('id', uploadId)
      .single();

    if (error || !upload || !upload.data) {
      return NextResponse.json({ error: 'Upload not found' }, { status: 404 });
    }

    const parsedData = upload.data as any[];
    const meta = { rowsParsed: upload.rows_parsed, country: upload.country, erp: upload.erp, db: 'supabase' }; // Updated meta

    // Mapping, Rules, Scores same
    const coverage = runFieldMapping(parsedData[0]);
    const ruleFindings = runRules(parsedData);
    const scores = calculateScores(coverage, ruleFindings, parsedData.length, questionnaire);

    const report: any = {
      reportId: uuidv4(),
      scores,
      coverage,
      ruleFindings,
      gaps: [...coverage.missing, ...ruleFindings.filter(f => !f.ok).map(f => `${f.rule} failed`)],
      meta,
    };

    const reportId = report.reportId;
    const { error: insertError } = await supabase
      .from('reports')
      .insert({
        id: reportId,
        upload_id: uploadId,
        scores_overall: scores.overall,
        report_json: report,
      });

    if (insertError) throw insertError;

    return NextResponse.json(report);
  } catch (error) {
    return NextResponse.json({ error: 'Analysis failed' }, { status: 500 });
  }
}
