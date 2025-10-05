import { NextRequest, NextResponse } from 'next/server';
import supabase from '@/app/lib/db';

export default async function GET(req: NextRequest, res: NextResponse) {
    const {data: report, error} = await supabase
    .from('reports')
    .select('report_json, expires_at')
    .single();

    if (error || !report || new Date() > new Date(report.expires_at)) {
      return NextResponse.json({ error: 'Report not found or expired' }, { status: 404 });
    }

    return NextResponse.json(report.report_json);

}
