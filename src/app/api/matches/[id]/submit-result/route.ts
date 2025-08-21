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
    const { winner } = await request.json(); // 'host' or 'opponent'
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

    // Get the match first
    const { data: match, error: matchError } = await supabaseAdmin
      .from('matches')
      .select('*')
      .eq('id', id)
      .single();

    if (matchError || !match) {
      return NextResponse.json({ error: 'Match not found' }, { status: 404 });
    }

    // Determine if user is host or opponent
    const isHost = user.id === match.user_id;
    const isOpponent = user.id === match.opponent_id;

    if (!isHost && !isOpponent) {
      return NextResponse.json({ error: 'User not part of this match' }, { status: 403 });
    }

    // Update the appropriate result field
    const updateField = isHost ? 'host_result' : 'opponent_result';
    const { data: updatedMatch, error: updateError } = await supabaseAdmin
      .from('matches')
      .update({ [updateField]: winner })
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      console.error('Database error:', updateError);
      return NextResponse.json({ error: 'Failed to submit result' }, { status: 500 });
    }

    // Check if both results are submitted
    if (updatedMatch.host_result && updatedMatch.opponent_result) {
      // Both results submitted, check if they match
      if (updatedMatch.host_result === updatedMatch.opponent_result) {
        // Results match - determine winner and finalize match
        const winnerId = updatedMatch.host_result === 'host' ? match.user_id : match.opponent_id;
        
        // Update match status to finished and set winner
        const { data: finalMatch, error: finalError } = await supabaseAdmin
          .from('matches')
          .update({ 
            status: 'finished',
            winner_id: winnerId,
            finished_at: new Date().toISOString()
          })
          .eq('id', id)
          .select()
          .single();

        if (finalError) {
          console.error('Error finalizing match:', finalError);
          return NextResponse.json({ error: 'Failed to finalize match' }, { status: 500 });
        }

        // Credit prize to winner
        try {
          console.log('Attempting to credit prize to winner:', winnerId, 'Prize amount:', match.prize);
          
          const { data: profile, error: profileError } = await supabaseAdmin
            .from('users')
            .select('balance')
            .eq('id', winnerId)
            .single();

          console.log('Profile query result:', { profile, profileError });

          if (!profileError && profile) {
            const prizeAmount = parseFloat(match.prize) || 0;
            const currentBalance = parseFloat(profile.balance) || 0;
            const newBalance = currentBalance + prizeAmount;
            
            console.log('Balance calculation:', { currentBalance, prizeAmount, newBalance });
            
            const { data: updateResult, error: updateError } = await supabaseAdmin
              .from('users')
              .update({ balance: newBalance })
              .eq('id', winnerId);
              
            console.log('Balance update result:', { updateResult, updateError });
          } else {
            console.error('Failed to fetch user profile:', profileError);
          }
        } catch (error) {
          console.error('Error crediting prize:', error);
        }
        
        return NextResponse.json({ 
          success: true, 
          match: finalMatch,
          status: 'finished',
          winner: updatedMatch.host_result
        });
      } else {
        // Results don't match - conflict
        const { data: conflictMatch, error: conflictError } = await supabaseAdmin
          .from('matches')
          .update({ 
            status: 'disputed',
            disputed_at: new Date().toISOString()
          })
          .eq('id', id)
          .select()
          .single();

        if (conflictError) {
          console.error('Error marking match as disputed:', conflictError);
          return NextResponse.json({ error: 'Failed to mark match as disputed' }, { status: 500 });
        }

        return NextResponse.json({ 
          success: true, 
          match: conflictMatch,
          status: 'disputed'
        });
      }
    }

    // Only one result submitted so far
    return NextResponse.json({ 
      success: true, 
      match: updatedMatch,
      status: 'waiting_for_result'
    });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
