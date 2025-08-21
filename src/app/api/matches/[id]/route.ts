import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/utils/supabaseClient';
import { createClient } from '@supabase/supabase-js';

// If you use the service role, force Node runtime (NOT edge)
export const runtime = 'nodejs'; // or 'nodejs-compat' depending on your Next version

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = params.id;
  try {
    if (!id) {
      return NextResponse.json({ error: 'Match ID is required' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('matches')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: 'Match not found' }, { status: 404 });
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let hostProfile: any = null;
    let hostEpicUsername: string | null = null;
    let opponentProfile: any = null;
    let opponentEpicUsername: string | null = null;

    if (data.user_id) {
      const {
        data: { user: hostAuthUser },
      } = await supabaseAdmin.auth.admin.getUserById(data.user_id);

      const { data: hostUserProfile } = await supabaseAdmin
        .from('users')
        .select('profile_picture_url, full_name')
        .eq('id', data.user_id)
        .single();

      if (hostAuthUser) {
        hostProfile = {
          id: data.user_id,
          full_name:
            hostUserProfile?.full_name ||
            hostAuthUser.user_metadata?.full_name ||
            null,
          discord_username:
            hostAuthUser.user_metadata?.discord_username ||
            hostAuthUser.user_metadata?.name ||
            hostAuthUser.email?.split('@')[0] ||
            'Host',
          profile_picture_url: hostUserProfile?.profile_picture_url || null,
        };
      } else {
        hostProfile = {
          id: data.user_id,
          full_name: hostUserProfile?.full_name || null,
          discord_username: 'Host',
          profile_picture_url: hostUserProfile?.profile_picture_url || null,
        };
      }

      const { data: hostEpic } = await supabaseAdmin
        .from('linked_accounts')
        .select('username')
        .eq('user_id', data.user_id)
        .eq('provider', 'epic_games')
        .single();

      hostEpicUsername = hostEpic?.username || null;
    }

    if (data.opponent_id) {
      const {
        data: { user: opponentAuthUser },
      } = await supabaseAdmin.auth.admin.getUserById(data.opponent_id);

      const { data: opponentUserProfile } = await supabaseAdmin
        .from('users')
        .select('profile_picture_url, full_name')
        .eq('id', data.opponent_id)
        .single();

      if (opponentAuthUser) {
        opponentProfile = {
          id: data.opponent_id,
          full_name:
            opponentUserProfile?.full_name ||
            opponentAuthUser.user_metadata?.full_name ||
            null,
          discord_username:
            opponentAuthUser.user_metadata?.full_name ||
            opponentAuthUser.user_metadata?.name ||
            opponentAuthUser.email?.split('@')[0] ||
            opponentAuthUser.email ||
            'Unknown User',
          profile_picture_url: opponentUserProfile?.profile_picture_url || null,
        };
      } else {
        opponentProfile = {
          id: data.opponent_id,
          full_name: opponentUserProfile?.full_name || null,
          discord_username: 'Unknown User',
          profile_picture_url: opponentUserProfile?.profile_picture_url || null,
        };
      }

      const { data: opponentEpic } = await supabaseAdmin
        .from('linked_accounts')
        .select('username')
        .eq('user_id', data.opponent_id)
        .eq('provider', 'epic_games')
        .single();

      opponentEpicUsername = opponentEpic?.username || null;
    }

    const matchWithProfiles = {
      ...data,
      host: hostProfile,
      opponent: opponentProfile,
      host_epic_username: hostEpicUsername,
      opponent_epic_username: opponentEpicUsername,
    };

    return NextResponse.json({ match: matchWithProfiles });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = params.id;
  try {
    const authHeader = request.headers.get('authorization');

    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];

    const supabaseAuth = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: {
          headers: { Authorization: `Bearer ${token}` },
        },
      }
    );

    const {
      data: { user },
      error: authError,
    } = await supabaseAuth.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Invalid authentication token' },
        { status: 401 }
      );
    }

    if (!id) {
      return NextResponse.json({ error: 'Match ID is required' }, { status: 400 });
    }

    const { data: match } = await supabaseAuth
      .from('matches')
      .select('user_id, entry_fee')
      .eq('id', id)
      .single();

    if (!match) {
      return NextResponse.json({ error: 'Match not found' }, { status: 404 });
    }

    if (match.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Unauthorized to cancel this match' },
        { status: 403 }
      );
    }

    const { data: userProfile } = await supabaseAuth
      .from('users')
      .select('balance')
      .eq('id', user.id)
      .single();

    if (!userProfile) {
      return NextResponse.json(
        { error: 'Failed to get user profile' },
        { status: 500 }
      );
    }

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

    const { error: deleteError } = await supabaseAuth
      .from('matches')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('Error deleting match:', deleteError);
      return NextResponse.json({ error: 'Failed to delete match' }, { status: 500 });
    }

    return NextResponse.json({
      message: 'Match cancelled successfully',
      refundAmount: match.entry_fee,
    });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
