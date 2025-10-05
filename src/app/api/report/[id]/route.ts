import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/app/lib/db'; // Earlier lib/db.ts se (or @/app/lib/db if path different)

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = await createClient(); // Async client (server-safe with cookies)
    const { data: report, error } = await supabase
      .from('reports')
      .select('report_json, expires_at')
      .single();  // One row only

    if (error || !report) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 });
    }

    // Expiry check
    if (new Date() > new Date(report.expires_at)) {
      return NextResponse.json({ error: 'Report expired' }, { status: 404 });
    }

    return NextResponse.json(report.report_json);  // Return report data directly
  } catch (err) {
    console.error('Report fetch error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
