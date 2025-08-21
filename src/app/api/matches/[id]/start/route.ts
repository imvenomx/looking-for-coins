import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    
    // Verify the session and get user
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }

    // Update the match with started status
    const { data, error } = await supabaseAdmin
      .from('matches')
      .update({ 
        status: 'playing'
      })
      .eq('id', id)
      .eq('user_id', user.id) // Only allow host to start the match
      .select();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: 'Failed to start match' }, { status: 500 });
    }

    if (!data || data.length === 0) {
      return NextResponse.json({ error: 'No match found or user not authorized' }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true, 
      match: data[0] 
    });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
