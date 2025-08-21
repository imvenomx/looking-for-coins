import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/utils/supabaseClient';
import { createClient } from '@supabase/supabase-js';

// Create admin client with service role key
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

export async function GET(
  request: NextRequest,
  context: { params: { id: string } }
) {
  const id = context.params.id;
  try {

    if (!id) {
      return NextResponse.json(
        { error: 'Match ID is required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('matches')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Match not found' },
        { status: 404 }
      );
    }

    // Fetch host profile and Epic username
    let hostProfile = null;
    let hostEpicUsername = null;
    let opponentProfile = null;
    let opponentEpicUsername = null;

    if (data.user_id) {
      // Query auth.users directly for user data using admin client
      const { data: { user: hostAuthUser }, error: hostAuthError } = await supabaseAdmin.auth.admin.getUserById(data.user_id);
      
      // Fetch host profile from users table for profile picture
      const { data: hostUserProfile, error: hostUserError } = await supabaseAdmin
        .from('users')
        .select('profile_picture_url, full_name')
        .eq('id', data.user_id)
        .single();
        
      if (hostAuthUser) {
        hostProfile = {
          id: data.user_id,
          full_name: hostUserProfile?.full_name || hostAuthUser.user_metadata?.full_name || null,
          discord_username: hostAuthUser.user_metadata?.discord_username || 
                           hostAuthUser.user_metadata?.name || 
                           hostAuthUser.email?.split('@')[0] || 
                           'Host',
          profile_picture_url: hostUserProfile?.profile_picture_url || null
        };
      } else {
        // Final fallback
        hostProfile = {
          id: data.user_id,
          full_name: hostUserProfile?.full_name || null,
          discord_username: 'Host',
          profile_picture_url: hostUserProfile?.profile_picture_url || null
        };
      }

      // Fetch host Epic username using admin client
      const { data: hostEpic, error: hostEpicError } = await supabaseAdmin
        .from('linked_accounts')
        .select('username')
        .eq('user_id', data.user_id)
        .eq('provider', 'epic_games')
        .single();
      
      hostEpicUsername = hostEpic?.username || null;
    }

    if (data.opponent_id) {
      // Query auth.users directly for opponent data using admin client
      const { data: { user: opponentAuthUser }, error: opponentAuthError } = await supabaseAdmin.auth.admin.getUserById(data.opponent_id);
      
      // Fetch opponent profile from users table for profile picture
      const { data: opponentUserProfile, error: opponentUserError } = await supabaseAdmin
        .from('users')
        .select('profile_picture_url, full_name')
        .eq('id', data.opponent_id)
        .single();
      
      if (opponentAuthUser) {
        opponentProfile = {
          id: data.opponent_id,
          full_name: opponentUserProfile?.full_name || opponentAuthUser.user_metadata?.full_name || null,
          discord_username: opponentAuthUser.user_metadata?.full_name || 
                           opponentAuthUser.user_metadata?.name || 
                           opponentAuthUser.email?.split('@')[0] || 
                           opponentAuthUser.email || 
                           'Unknown User',
          profile_picture_url: opponentUserProfile?.profile_picture_url || null
        };
      } else {
        // Final fallback
        opponentProfile = {
          id: data.opponent_id,
          full_name: opponentUserProfile?.full_name || null,
          discord_username: 'Unknown User',
          profile_picture_url: opponentUserProfile?.profile_picture_url || null
        };
      }

      // Fetch opponent Epic username using admin client
      const { data: opponentEpic, error: opponentEpicError } = await supabaseAdmin
        .from('linked_accounts')
        .select('username')
        .eq('user_id', data.opponent_id)
        .eq('provider', 'epic_games')
        .single();
      
      opponentEpicUsername = opponentEpic?.username || null;
    }

    // Add profiles and Epic usernames to the response
    const matchWithProfiles = {
      ...data,
      host: hostProfile,
      opponent: opponentProfile,
      host_epic_username: hostEpicUsername,
      opponent_epic_username: opponentEpicUsername
    };

    return NextResponse.json({ match: matchWithProfiles });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: { id: string } }
) {
  const id = context.params.id;
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
    const supabaseAuth = createClient(
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
    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Invalid authentication token' },
        { status: 401 }
      );
    }

    if (!id) {
      return NextResponse.json(
        { error: 'Match ID is required' },
        { status: 400 }
      );
    }

    // Get match details to verify ownership and get entry fee
    const { data: match, error: matchError } = await supabaseAuth
      .from('matches')
      .select('user_id, entry_fee')
      .eq('id', id)
      .single();

    if (matchError || !match) {
      return NextResponse.json(
        { error: 'Match not found' },
        { status: 404 }
      );
    }

    // Verify user owns the match
    if (match.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Unauthorized to cancel this match' },
        { status: 403 }
      );
    }

    // Get user's current balance
    const { data: userProfile, error: profileError } = await supabaseAuth
      .from('users')
      .select('balance')
      .eq('id', user.id)
      .single();

    if (profileError || !userProfile) {
      return NextResponse.json(
        { error: 'Failed to get user profile' },
        { status: 500 }
      );
    }

    // Refund the entry fee
    const { error: refundError } = await supabaseAuth
      .from('users')
      .update({ balance: userProfile.balance + match.entry_fee })
      .eq('id', user.id);

    if (refundError) {
      console.error('Error refunding balance:', refundError);
      return NextResponse.json(
        { error: 'Failed to refund entry fee' },
        { status: 500 }
      );
    }

    // Delete the match
    const { error: deleteError } = await supabaseAuth
      .from('matches')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('Error deleting match:', deleteError);
      return NextResponse.json(
        { error: 'Failed to delete match' },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      message: 'Match cancelled successfully',
      refundAmount: match.entry_fee
    });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
