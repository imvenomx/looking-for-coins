import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/utils/supabaseClient';

export async function GET(request: NextRequest) {
  try {
    // Get the authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    
    // Verify the token and get user
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized', details: authError?.message }, { status: 401 });
    }

    // Test if user_profiles table exists
    const { data, error } = await supabase
      .from('user_profiles')
      .select('count')
      .limit(1);

    if (error) {
      return NextResponse.json({ 
        error: 'Database error', 
        details: error.message,
        code: error.code,
        hint: error.hint
      }, { status: 500 });
    }

    return NextResponse.json({ 
      message: 'Database connection successful',
      user_id: user.id,
      table_accessible: true
    });
  } catch (error) {
    console.error('Test DB error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
