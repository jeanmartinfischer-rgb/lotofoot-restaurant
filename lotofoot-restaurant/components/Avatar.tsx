export default function Avatar({
  avatarUrl,
  pseudo,
  size = 40,
}: {
  avatarUrl?: string | null;
  pseudo?: string | null;
  size?: number;
}) {
  const isNumber = avatarUrl && /^[0-9]+$/.test(avatarUrl);
  const isAdmin = avatarUrl === 'admin';
  const hasAvatar = isNumber || isAdmin;
  const src = isAdmin ? '/avatar-admin.png' : '/avatar-' + avatarUrl + '.png';
  const letter = (pseudo || '?').charAt(0).toUpperCase();
  return (
    <span
      className="inline-flex items-center justify-center rounded-full overflow-hidden bg-sang shrink-0"
      style={{ width: size, height: size }}
    >
      {hasAvatar ? (
        <img src={src} alt={pseudo || 'avatar'} className="w-full h-full object-cover" />
      ) : (
        <span className="font-display text-chalk" style={{ fontSize: size * 0.45 }}>{letter}</span>
      )}
    </span>
  );
}
