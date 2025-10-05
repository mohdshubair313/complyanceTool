import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import Papa from 'papaparse';
import supabase from '@/app/lib/db'; // Supabase client
import { z } from 'zod';

const schema = z.object({
  country: z.string().min(1),
  erp: z.string().min(1),
});

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const country = formData.get('country') as string;
    const erp = formData.get('erp') as string;
    const file = formData.get('file') as File | null;
    const text = formData.get('text') as string | null;

    schema.parse({ country, erp });

    let data: any[] = [];
    let rowsParsed = 0;

    // Parsing logic same (Papa/JSON)
    if (file) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const content = buffer.toString('utf-8');
      if (file.name.endsWith('.csv')) {
        const parseResult = Papa.parse(content, { header: true });
        data = parseResult.data.slice(0, 200);
        rowsParsed = data.length;
      } else if (file.name.endsWith('.json')) {
        data = JSON.parse(content).slice(0, 200);
        rowsParsed = data.length;
      }
    } else if (text) {
      // Same as before
      if (text.trim().startsWith('[')) {
        data = JSON.parse(text).slice(0, 200);
      } else {
        const parseResult = Papa.parse(text, { header: true });
        data = parseResult.data.slice(0, 200);
      }
      rowsParsed = data.length;
    }

    const uploadId = uuidv4();
    const { error } = await supabase
      .from('uploads')
      .insert({
        id: uploadId,
        country,
        erp,
        rows_parsed: rowsParsed,
        data: data.length ? data : null,
      });

    if (error) throw error;

    return NextResponse.json({ uploadId });
  } catch (error) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
  }
}
