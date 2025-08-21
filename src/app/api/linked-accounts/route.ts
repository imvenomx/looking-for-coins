import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/utils/supabaseClient';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: NextRequest) {
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

    // Use service role to fetch linked accounts (bypasses RLS)
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: linkedAccounts, error } = await supabaseAdmin
      .from('linked_accounts')
      .select('provider, username, email, linked_at, profile_data')
      .eq('user_id', user.id);

    if (error) {
      console.error('Failed to fetch linked accounts:', error);
      return NextResponse.json({ error: 'Failed to fetch linked accounts' }, { status: 500 });
    }

    console.log('Fetched linked accounts for user', user.id, ':', linkedAccounts);
    return NextResponse.json({ linkedAccounts: linkedAccounts || [] });

  } catch (error) {
    console.error('Linked accounts API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

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

    const { provider } = await request.json();
    
    if (!provider) {
      return NextResponse.json({ error: 'Provider is required' }, { status: 400 });
    }

    // Use service role to delete linked account (bypasses RLS)
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { error } = await supabaseAdmin
      .from('linked_accounts')
      .delete()
      .eq('user_id', user.id)
      .eq('provider', provider);

    if (error) {
      console.error('Failed to unlink account:', error);
      return NextResponse.json({ error: 'Failed to unlink account' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Account unlinked successfully' });

  } catch (error) {
    console.error('Unlink account API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
