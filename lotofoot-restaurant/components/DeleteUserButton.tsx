'use client';

export default function DeleteUserButton({ pseudo }: { pseudo: string }) {
  return (
    <button
      type="submit"
      onClick={(e) => {
        if (!window.confirm('Supprimer définitivement le joueur "' + pseudo + '" ?\n\nToutes ses données (pronos, points, réactions, commentaires, messages, badges) seront effacées.\n\nCette action est IRRÉVERSIBLE.')) {
          e.preventDefault();
        }
      }}
      className="w-full rounded-lg border border-sang-vif bg-sang-vif/10 px-3 py-1.5 text-xs font-bold text-sang-vif hover:bg-sang-vif/20 transition-colors"
    >
      Supprimer definitivement
    </button>
  );
}
