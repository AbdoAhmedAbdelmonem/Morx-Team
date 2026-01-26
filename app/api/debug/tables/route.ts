import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { data: tables, error } = await supabase.rpc('raw_sql', { 
      query_text: "SELECT tablename FROM pg_catalog.pg_tables WHERE schemaname = 'public'" 
    });

    return NextResponse.json({ tables, error });
  } catch (err: any) {
    return NextResponse.json({ error: err.message });
  }
}
