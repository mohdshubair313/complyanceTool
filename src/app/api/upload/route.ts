import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import Papa from 'papaparse';
import {createClient} from '@/app/lib/db'; // Supabase client
import { z } from 'zod';

const schema = z.object({
  country: z.string().min(1, 'Country required'),
  erp: z.string().min(1, 'ERP required'),
});

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const country = formData.get('country') as string;
    const erp = formData.get('erp') as string;
    const file = formData.get('file') as File | null;
    const text = formData.get('text') as string | null;

    // Validate inputs
    schema.parse({ country, erp });

    let data: any[] = [];
    let rowsParsed = 0;

    // Parse file or text
    if (file) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const content = buffer.toString('utf-8');
      if (file.name.endsWith('.csv')) {
        const parseResult = Papa.parse(content, { header: true, skipEmptyLines: true });
        if (parseResult.errors.length > 0) {
          return NextResponse.json({ error: 'CSV parse error' }, { status: 400 });
        }
        data = parseResult.data.slice(0, 200);
        rowsParsed = data.length;
      } else if (file.name.endsWith('.json')) {
        try {
          data = JSON.parse(content).slice(0, 200);
          rowsParsed = data.length;
        } catch (err) {
          return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
        }
      } else {
        return NextResponse.json({ error: 'Unsupported format. Use CSV or JSON.' }, { status: 400 });
      }
    } else if (text) {
      try {
        // Try JSON first
        data = JSON.parse(text).slice(0, 200);
        rowsParsed = data.length;
      } catch {
        // Fallback to CSV
        const parseResult = Papa.parse(text, { header: true, skipEmptyLines: true });
        if (parseResult.errors.length > 0) {
          return NextResponse.json({ error: 'Text parse error' }, { status: 400 });
        }
        data = parseResult.data.slice(0, 200);
        rowsParsed = data.length;
      }
    } else {
      return NextResponse.json({ error: 'No file or text provided' }, { status: 400 });
    }

    // Generate ID and save to Supabase
    const uploadId = uuidv4();
    const supabase = await createClient();
    const { error } = await supabase
      .from('uploads')
      .insert({
        id: uploadId,
        country,
        erp,
        rows_parsed: rowsParsed,
        data,  // JSONB in Supabase
      })
      .select();  // Optional: Return inserted row

    if (error) {
      console.error('Supabase insert error:', error);
      return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
    }

    return NextResponse.json({ uploadId }, { status: 201 });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
  }
}