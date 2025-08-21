import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/utils/supabaseClient';
import { createClient } from '@supabase/supabase-js';

const EPIC_CLIENT_ID = process.env.EPIC_CLIENT_ID;
const EPIC_CLIENT_SECRET = process.env.EPIC_CLIENT_SECRET;
const EPIC_REDIRECT_URI = process.env.NEXT_PUBLIC_BASE_URL + '/api/auth/epic/callback';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    if (error) {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/my-account?error=epic_auth_failed`);
    }

    if (!code) {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/my-account?error=no_code`);
    }

    // Exchange code for access token
    const tokenResponse = await fetch('https://api.epicgames.dev/epic/oauth/v1/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(`${EPIC_CLIENT_ID}:${EPIC_CLIENT_SECRET}`).toString('base64')}`
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: EPIC_REDIRECT_URI
      })
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text();
      console.error('Epic token exchange failed:', errorData);
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/my-account?error=token_exchange_failed`);
    }

    const tokenData = await tokenResponse.json();
    const { access_token, refresh_token, expires_in } = tokenData;

    // Get user info from Epic Games
    const userResponse = await fetch('https://api.epicgames.dev/epic/oauth/v1/userInfo', {
      headers: {
        'Authorization': `Bearer ${access_token}`
      }
    });

    if (!userResponse.ok) {
      console.error('Failed to get Epic user info');
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/my-account?error=user_info_failed`);
    }

    const epicUser = await userResponse.json();
    
    // Get user ID from state parameter
    const state = searchParams.get('state');
    let userId = null;
    
    if (state) {
      try {
        const stateData = JSON.parse(Buffer.from(state, 'base64').toString());
        userId = stateData.userId;
      } catch (err) {
        console.error('Failed to parse state parameter:', err);
        return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/my-account?error=invalid_state`);
      }
    }

    if (!userId) {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/login?error=not_authenticated`);
    }

    // Store linked account in database using service role to bypass RLS
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const expiresAt = new Date(Date.now() + (expires_in * 1000));
    
    const { error: dbError } = await supabaseAdmin
      .from('linked_accounts')
      .upsert({
        user_id: userId,
        provider: 'epic_games',
        provider_user_id: epicUser.sub,
        username: epicUser.preferred_username || epicUser.display_name,
        email: epicUser.email,
        profile_data: {
          display_name: epicUser.display_name,
          preferred_username: epicUser.preferred_username,
          country: epicUser.country
        },
        access_token: access_token,
        refresh_token: refresh_token,
        expires_at: expiresAt.toISOString()
      }, {
        onConflict: 'user_id,provider'
      });

    if (dbError) {
      console.error('Database error:', dbError);
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/my-account?error=db_error`);
    }

    console.log('Epic account linked successfully for user:', userId);

    // Redirect to success page
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/my-account?success=epic_linked`);

  } catch (error) {
    console.error('Epic callback error:', error);
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/my-account?error=callback_failed`);
  }
}
