export default function Avatar({
  avatarUrl,
  pseudo,
  size = 40,
}: {
  avatarUrl?: string | null;
  pseudo?: string | null;
  size?: number;
}) {
  const hasAvatar = avatarUrl && /^[0-9]+$/.test(avatarUrl);
  const letter = (pseudo || '?').charAt(0).toUpperCase();
  return (
    <span
      className="inline-flex items-center justify-center rounded-full overflow-hidden bg-sang shrink-0"
      style={{ width: size, height: size }}
    >
      {hasAvatar ? (
        <img
          src={'/avatar-' + avatarUrl + '.png'}
          alt={pseudo || 'avatar'}
          className="w-full h-full object-cover"
        />
      ) : (
        <span className="font-display text-chalk" style={{ fontSize: size * 0.45 }}>{letter}</span>
      )}
    </span>
  );
}
