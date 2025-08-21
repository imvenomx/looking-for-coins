import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Get authorization header
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.error('Missing or invalid authorization header');
      return NextResponse.json({ error: 'Missing authorization header' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    
    // Create Supabase client with service role key for admin operations
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Verify the user token
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);
    
    if (userError || !user) {
      console.error('Token verification failed:', userError);
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const { id: matchId } = await params;
    const userId = user.id;

    // Get match details and user balance
    const [matchResult, userResult] = await Promise.all([
      supabaseAdmin
        .from('matches')
        .select('*')
        .eq('id', matchId)
        .single(),
      supabaseAdmin
        .from('users')
        .select('balance')
        .eq('id', userId)
        .single()
    ]);

    if (matchResult.error) {
      return NextResponse.json({ error: 'Match not found' }, { status: 404 });
    }

    if (userResult.error) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const match = matchResult.data;
    const userBalance = parseFloat(userResult.data.balance || '0');
    const entryFee = parseFloat(match.entry_fee || match.betting_amount || '0');

    // Check if user has enough balance
    if (userBalance < entryFee) {
      return NextResponse.json({ 
        error: 'Insufficient balance',
        required: entryFee,
        current: userBalance
      }, { status: 400 });
    }

    // Check if match is available to join
    if (match.opponent_name !== 'Waiting for opponent') {
      return NextResponse.json({ error: 'Match is already full' }, { status: 400 });
    }

    // Skip profile fetch - use simple defaults to avoid database issues
    const userProfile = {
      discord_username: 'Player',
      epic_games_username: '',
      profile_picture: ''
    };

    // Start transaction: deduct balance and update match
    const newBalance = userBalance - entryFee;

    const [balanceUpdate, matchUpdate] = await Promise.all([
      supabaseAdmin
        .from('users')
        .update({ balance: newBalance.toString() })
        .eq('id', userId),
      supabaseAdmin
        .from('matches')
        .update({
          opponent_id: userId,
          opponent_name: userProfile.discord_username || 'Unknown Player'
        })
        .eq('id', matchId)
    ]);

    if (balanceUpdate.error || matchUpdate.error) {
      console.error('Database update errors:', {
        balanceError: balanceUpdate.error,
        matchError: matchUpdate.error
      });
      
      // If either update fails, try to rollback the balance
      if (!balanceUpdate.error && matchUpdate.error) {
        await supabaseAdmin
          .from('users')
          .update({ balance: userBalance.toString() })
          .eq('id', userId);
      }
      
      return NextResponse.json({ 
        error: 'Database update failed',
        balanceError: balanceUpdate.error?.message,
        matchError: matchUpdate.error?.message
      }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true,
      newBalance,
      entryFeeDeducted: entryFee
    });

  } catch (error) {
    console.error('Join match error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
