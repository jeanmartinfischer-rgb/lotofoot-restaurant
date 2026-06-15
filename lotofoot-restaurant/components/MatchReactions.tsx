'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase-client';

const EMOJIS = ['⚽', '🔥', '😱', '😅', '👏', '🤣'];

interface Reaction {
  emoji: string;
  count: number;
  userReacted: boolean;
}

interface Comment {
  id: number;
  content: string;
  created_at: string;
  profiles: { pseudo: string };
}

export default function MatchReactions({ matchId, userId }: { matchId: number; userId: string }) {
  const [reactions, setReactions] = useState<Record<string, Reaction>>({});
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [showComments, setShowComments] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadReactions();
    loadComments();
  }, [matchId]);

  async function loadReactions() {
    const supabase = createClient();
    const { data } = await supabase
      .from('reactions')
      .select('emoji, user_id')
      .eq('match_id', matchId);

    const map: Record<string, Reaction> = {};
    for (const emoji of EMOJIS) {
      const rows = data?.filter((r) => r.emoji === emoji) ?? [];
      map[emoji] = {
        emoji,
        count: rows.length,
        userReacted: rows.some((r) => r.user_id === userId),
      };
    }
    setReactions(map);
  }

  async function loadComments() {
    const supabase = createClient();
    const { data } = await supabase
      .from('comments')
      .select('id, content, created_at, profiles(pseudo)')
      .eq('match_id', matchId)
      .order('created_at', { ascending: false })
      .limit(20);
    setComments((data as any) ?? []);
  }

  async function toggleReaction(emoji: string) {
    const supabase = createClient();
    const current = reactions[emoji];

    if (current?.userReacted) {
      await supabase.from('reactions')
        .delete()
        .eq('match_id', matchId)
        .eq('user_id', userId)
        .eq('emoji', emoji);
    } else {
      await supabase.from('reactions')
        .insert({ match_id: matchId, user_id: userId, emoji });
    }
    loadReactions();
  }

  async function addComment() {
    if (!newComment.trim()) return;
    setLoading(true);
    const supabase = createClient();
    await supabase.from('comments').insert({
      match_id: matchId,
      user_id: userId,
      content: newComment.trim(),
    });
    setNewComment('');
    setLoading(false);
    loadComments();
  }

  async function deleteComment(id: number) {
    const supabase = createClient();
    await supabase.from('comments').delete().eq('id', id).eq('user_id', userId);
    loadComments();
  }

  return (
    <div className="mt-3 space-y-3">
      <div className="flex items-center gap-2 flex-wrap">
        {EMOJIS.map((emoji) => {
          const r = reactions[emoji];
          return (
            <button
              key={emoji}
              onClick={() => toggleReaction(emoji)}
              className={'flex items-center gap-1 rounded-full px-2 py-1 text-sm border transition-all ' +
                (r?.userReacted
                  ? 'bg-sang border-sang text-chalk'
                  : 'bg-ardoise border-ligne text-chalk/70 hover:border-chalk/40')}
            >
              <span>{emoji}</span>
              {r?.count > 0 && (
                <span className="font-mono text-xs">{r.count}</span>
              )}
            </button>
          );
        })}
        <button
          onClick={() => setShowComments(!showComments)}
          className="flex items-center gap-1 rounded-full px-2 py-1 text-sm border border-ligne bg-ardoise text-chalk/70 hover:border-chalk/40 transition-all"
        >
          <span>💬</span>
          {comments.length > 0 && (
            <span className="font-mono text-xs">{comments.length}</span>
          )}
        </button>
      </div>

      {showComments && (
        <div className="space-y-2">
          <div className="flex gap-2">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addComment()}
              placeholder="Ton commentaire..."
              maxLength={200}
              className="flex-1 rounded-xl border border-ligne bg-pitch px-3 py-2 text-sm"
            />
            <button
              onClick={addComment}
              disabled={loading || !newComment.trim()}
              className="rounded-xl bg-sang px-3 py-2 text-xs font-bold text-chalk disabled:opacity-40"
            >
              OK
            </button>
          </div>

          {comments.length === 0 && (
            <p className="text-xs text-chalk/40 text-center py-2">
              Sois le premier a commenter !
            </p>
          )}

          <div className="space-y-2 max-h-48 overflow-y-auto">
            {comments.map((c) => (
              <div key={c.id} className="flex items-start gap-2 rounded-xl bg-ardoise border border-ligne p-2">
                <div className="flex-1 min-w-0">
                  <p className="font-mono text-xs font-bold text-sang-vif">
                    {c.profiles?.pseudo ?? 'Joueur'}
                  </p>
                  <p className="text-sm text-chalk/80 mt-0.5">{c.content}</p>
                  <p className="font-mono text-xs text-chalk/30 mt-1">
                    {new Date(c.created_at).toLocaleTimeString('fr-FR', {
                      hour: '2-digit', minute: '2-digit'
                    })}
                  </p>
                </div>
                {c.user_id === userId && (
                  <button
                    onClick={() => deleteComment(c.id)}
                    className="text-chalk/30 hover:text-sang-vif text-xs"
                  >
                    X
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
