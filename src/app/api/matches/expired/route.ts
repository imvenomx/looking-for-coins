import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/utils/supabaseClient';

export async function DELETE(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Find and delete expired matches
    const now = new Date().toISOString();
    console.log('Checking for expired matches at:', now);
    
    // First, let's see all matches to debug
    const { data: allMatches, error: allMatchesError } = await supabase
      .from('matches')
      .select('id, expires_at, status, created_at')
      .order('created_at', { ascending: false });
    
    console.log('All matches in database:', allMatches);
    
    const { data: expiredMatches, error: fetchError } = await supabase
      .from('matches')
      .select('*')
      .lt('expires_at', now)
      .in('status', ['waiting', 'joined', 'ready']);
    
    console.log('Query for expired matches - now:', now);
    console.log('Query filters - status in:', ['waiting', 'joined', 'ready']);
    console.log('Query filters - expires_at less than:', now);

    if (fetchError) {
      console.error('Failed to fetch expired matches:', fetchError);
      return NextResponse.json({ error: 'Failed to fetch expired matches' }, { status: 500 });
    }

    console.log('Found expired matches:', expiredMatches?.length || 0);

    if (!expiredMatches || expiredMatches.length === 0) {
      console.log('No expired matches found - checking individual matches:');
      if (allMatches) {
        allMatches.forEach(match => {
          const matchExpiry = new Date(match.expires_at).getTime();
          const nowTime = new Date(now).getTime();
          console.log(`Match ${match.id}: expires_at=${match.expires_at}, status=${match.status}, expired=${matchExpiry < nowTime}`);
        });
      }
      return NextResponse.json({ message: 'No expired matches found', deletedCount: 0 });
    }

    // Delete expired matches
    const { error: deleteError } = await supabase
      .from('matches')
      .delete()
      .lt('expires_at', now)
      .in('status', ['waiting', 'joined', 'ready']);

    console.log('Delete operation result:', deleteError ? 'Error' : 'Success');

    if (deleteError) {
      return NextResponse.json({ error: 'Failed to delete expired matches' }, { status: 500 });
    }

    // TODO: Refund entry fees for expired matches
    // This would require updating user balances based on the expired matches

    return NextResponse.json({ 
      message: 'Expired matches deleted successfully',
      deletedCount: expiredMatches.length,
      expiredMatches: expiredMatches.map(match => match.id)
    });

  } catch (error) {
    console.error('Error handling expired matches:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
