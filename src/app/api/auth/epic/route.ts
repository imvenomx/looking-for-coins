import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/utils/supabaseClient';

// Epic Games OAuth configuration
const EPIC_CLIENT_ID = process.env.EPIC_CLIENT_ID;
const EPIC_CLIENT_SECRET = process.env.EPIC_CLIENT_SECRET;
const EPIC_REDIRECT_URI = process.env.NEXT_PUBLIC_BASE_URL + '/api/auth/epic/callback';

export async function POST(request: NextRequest) {
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

    // Create state parameter with user ID
    const state = Buffer.from(JSON.stringify({ userId: user.id })).toString('base64');

    // Build Epic Games OAuth URL
    const authUrl = new URL('https://www.epicgames.com/id/authorize');
    authUrl.searchParams.set('client_id', EPIC_CLIENT_ID || '');
    authUrl.searchParams.set('redirect_uri', EPIC_REDIRECT_URI);
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('scope', 'basic_profile');
    authUrl.searchParams.set('state', state);
    
    return NextResponse.json({ redirectUrl: authUrl.toString() });

  } catch (error) {
    console.error('Epic OAuth error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
