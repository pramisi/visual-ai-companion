import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const userId = (session.user as any).id || session.user.email!;

  const { data, error } = await supabaseAdmin
    .from('user_progress')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error || !data) {
    const { data: newData } = await supabaseAdmin
      .from('user_progress')
      .insert({ user_id: userId, tree_level: 1, streak_days: 0, completed_sessions: 0, total_focus_minutes: 0 })
      .select()
      .single();
    return NextResponse.json(newData);
  }

  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const userId = (session.user as any).id || session.user.email!;
  const body = await req.json();
  const today = new Date().toISOString().split('T')[0];

  const { data: existing } = await supabaseAdmin
    .from('user_progress')
    .select('*')
    .eq('user_id', userId)
    .single();

  let newStreak = existing?.streak_days || 0;
  if (existing?.last_active_date) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const wasYesterday = existing.last_active_date === yesterday.toISOString().split('T')[0];
    const isToday = existing.last_active_date === today;
    if (!isToday && wasYesterday) newStreak += 1;
    else if (!isToday && !wasYesterday) newStreak = 1;
  }

  const { data } = await supabaseAdmin
    .from('user_progress')
    .upsert({
      user_id: userId,
      tree_level: body.tree_level,
      streak_days: newStreak,
      completed_sessions: body.completed_sessions,
      total_focus_minutes: body.total_focus_minutes,
      last_active_date: today,
    }, { onConflict: 'user_id' })
    .select()
    .single();

  return NextResponse.json(data);
}