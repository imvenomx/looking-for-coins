import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  try {
    // Get the authorization header
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // Extract the token
    const token = authHeader.split(' ')[1];
    
    // Create Supabase client with the token
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      }
    );
    
    // Get the authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Invalid authentication token' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      matchType,
      gameMode,
      firstTo,
      platform,
      region,
      teamSize,
      entryFee
    } = body;

    // Validate required fields
    if (!matchType || !gameMode || !firstTo || !platform || !region || !teamSize || entryFee === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check user balance before creating match
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('balance')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.error('Error fetching user profile:', profileError);
      return NextResponse.json(
        { error: 'Failed to check user balance' },
        { status: 500 }
      );
    }

    if (!userProfile || userProfile.balance < entryFee) {
      return NextResponse.json(
        { error: 'Insufficient balance', currentBalance: userProfile?.balance || 0, requiredAmount: entryFee },
        { status: 400 }
      );
    }

    // Deduct entry fee from user balance
    const { error: balanceError } = await supabase
      .from('users')
      .update({ balance: userProfile.balance - entryFee })
      .eq('id', user.id);

    if (balanceError) {
      console.error('Error deducting balance:', balanceError);
      return NextResponse.json(
        { error: 'Failed to deduct entry fee' },
        { status: 500 }
      );
    }

    // Create match in database
    const { data, error } = await supabase
      .from('matches')
      .insert([
        {
          user_id: user.id,
          opponent_name: 'Waiting for opponent',
          match_date: new Date().toISOString(),
          result: 'waiting',
          betting_amount: entryFee,
          game_mode: gameMode,
          is_public: matchType === 'public',
          first_to: parseInt(firstTo),
          platform: platform,
          region: region,
          team_size: teamSize === '1v1' ? 1 : parseInt(teamSize.charAt(0)),
          match_type: matchType,
          entry_fee: entryFee,
          prize: (entryFee * 2 * 0.85).toFixed(2),
          status: 'waiting',
          expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString()
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to create match' },
        { status: 500 }
      );
    }

    return NextResponse.json({ id: data.id, match: data });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}


export async function GET() {
  try {
    // Create Supabase client for public read access
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    
    const { data, error } = await supabase
      .from('matches')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch matches' },
        { status: 500 }
      );
    }

    return NextResponse.json({ matches: data });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
