'use client';

const CITATIONS: string[] = [
  "19h03, première commande. 19h04, le ticket fait deux mètres de long. On est déjà en retard sur une soirée qui vient de commencer. Bienvenue en enfer, installez-vous.",
  "Le mec qui dit \"prenez votre temps\" puis te fixe comme un faucon toutes les 30 secondes. Choisis ton mensonge, frère.",
  "Table 4 veut l'addition. Table 7 veut commander. Table 2 veut le chef. Et moi je veux juste m'allonger par terre et devenir une plante.",
  "\"Vous avez du sans gluten ?\" Ouais. \"Et c'est bon ?\" Non. La vie est faite de compromis, madame.",
  "Le chef qui balance \"ÇA SORT\" quatre fois en deux secondes. Mec, j'ai deux bras, pas huit, je suis serveur pas pieuvre.",
  "Réservation de 15 qui annule par SMS à 19h58. Merci. Vraiment. J'espère que ton wifi rame pour toujours.",
  "Le plongeur a disparu. La plonge monte. Elle atteint le plafond. On l'a perdu là-dedans. Paix à son âme.",
  "\"Une eau du robinet et on partage une entrée.\" À douze. Vous êtes venus dépenser zéro euro et mon énergie vitale, c'est ça ?",
  "Le coup de feu, c'est comme un manège qui s'arrête jamais. Sauf que personne a payé le ticket et tout le monde gueule.",
  "\"Je voudrais le plat mais sans la sauce, sans l'oignon, sans le truc vert.\" Donc tu veux l'assiette. Juste l'assiette. Vendu.",
  "La table qui rit trop fort. Tu sais pas si c'est l'ambiance ou si c'est toi qu'ils se moquent. Spoiler : les deux.",
  "Le boss : \"ce soir tranquille\". Trois cars de touristes se garent devant. Le boss a déclenché l'apocalypse avec un seul mot.",
  "\"Garçon, ya une mouche !\" Madame, à ce prix-là, c'est un supplément protéines offert.",
  "Service du midi : 60 couverts. Pause. Service du soir : 70 couverts. Mes jambes : portées disparues depuis 14h.",
  "Le client qui photographie, filme, vlogue, story, reel… mec, c'est un magret, pas la cérémonie des Oscars.",
  "\"Vous fermez bientôt ?\" en s'installant. Le culot, c'est aussi une forme d'art, j'imagine.",
  "Le commis qui crie \"CHAUD CHAUD CHAUD\" et fonce dans le tas comme un taureau. On adore. On a peur. On adore.",
  "Table de 8, huit cuissons différentes pour le même steak. Bleu, saignant, à point, \"entre les deux\", \"comme vous le sentez\"… je le sens cramé, ça vous va ?",
  "\"C'est pas comme à la maison.\" Bah rentre à la maison alors, champion. La porte elle est juste là.",
  "La machine à CB plante pile au moment de payer. La table fait \"oh dommage\". Non. Non non non. Tu paies. Même en sang s'il faut.",
  "Le mec qui mâche bouche ouverte en racontant sa vie. J'ai pas signé pour ça. Personne signe pour ça.",
  "\"Vous pouvez me faire un petit prix ?\" C'est un resto, pas un vide-grenier, mon grand.",
  "Coup de feu max, et le téléphone du resto sonne. Personne répond. Il sonne dans le vide. Comme un cri dans l'espace.",
  "Le client qui range lui-même sa table \"pour aider\". Frère, t'as empilé les assiettes en pyramide instable, t'aides pas, t'inventes un nouveau danger.",
  "\"Je connais le patron.\" Cool. Moi aussi. Ça change rien, tu paies pareil.",
  "Le serveur qui slalome entre douze tables avec quatre assiettes brûlantes en chantant intérieurement sa propre mort. Pro level.",
  "Table qui commande au moment EXACT où tu finis le service. Le timing du diable, en personne.",
  "\"C'est vegan ?\" Non. \"Et là ?\" Non plus. \"Et ça ?\" Monsieur, vous êtes dans une rôtisserie. Réfléchissez deux secondes.",
  "Le boss qui goûte un plat, fait une grimace, et dit \"envoie quand même\". La confiance, c'est beau.",
  "Fin de service. Tu t'assois. UNE table entre. Tu te relèves. Ton âme, elle, reste assise. Elle a abandonné.",
  "\"On peut avoir la même chose mais en plus grand et moins cher ?\" C'est… c'est pas comme ça que ça marche, l'univers.",
  "Le commis qui transpire tellement qu'on dirait qu'il sort de la douche. Roi de la cuisine, seigneur de la sueur.",
  "Table relou qui part enfin. La salle entière respire. On entend presque les anges chanter. Liberté.",
  "\"Vous prenez les chèques ?\" On est en 2026, monsieur. Même les fantômes paient en sans contact.",
  "Le moment où tout part en vrille, où plus rien va, et où l'équipe se regarde et explose de rire. C'est ça la magie. On est cramés mais on est ensemble.",
  "Le serveur qui a marché 18 km sans sortir de 80 m². Athlète olympique non reconnu par le comité.",
  "Plus de bras, plus de jambes, plus de cerveau. Juste le réflexe et le café. On tient avec ça. On est des machines.",
  "On a encaissé le rush comme une vague, on est trempés mais debout, et demain on remet ça. Tarés ? Peut-être. Champions ? Carrément.",
  "Quoi qu'il arrive, quel que soit le bordel : on rentre crevés, on rentre fiers, on rentre ENSEMBLE. Bravo la team. Vous êtes complètement fous, et je vous adore.",
];

function jourDeLAnnee(): number {
  const now = new Date();
  const debut = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - debut.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

export default function CitationDuJour() {
  const citation = CITATIONS[jourDeLAnnee() % CITATIONS.length];

  return (
    <section
      className="relative my-2"
      style={{ fontFamily: 'var(--font-graff, "Bangers", system-ui)' }}
    >
      {/* Rayons d'action qui tournent en fond */}
      <div
        aria-hidden
        className="pointer-events-none absolute rounded-2xl opacity-20 citation-rayons"
        style={{
          inset: '-12px',
          background:
            'repeating-conic-gradient(from 0deg, #1b6ec2 0deg 9deg, #0d4e8c 9deg 18deg)',
        }}
      />

      {/* Panneau comic */}
      <div
        className="relative rounded-xl citation-pop"
        style={{
          background: '#fff7e6',
          border: '4px solid #111',
          boxShadow: '7px 7px 0 #111',
          padding: '26px 18px 30px',
        }}
      >
        {/* Onomatopée BAM */}
        <span
          className="absolute citation-shk"
          style={{
            top: '-26px',
            left: '-12px',
            background: '#ffcf33',
            color: '#111',
            fontSize: '26px',
            padding: '4px 16px',
            border: '3px solid #111',
            borderRadius: '8px',
            transform: 'rotate(-6deg)',
            boxShadow: '3px 3px 0 #111',
            WebkitTextStroke: '1px #111',
          }}
        >
          BAM!
        </span>

        {/* Onomatopée ILS ONT FAIM LES GENS */}
        <span
          className="absolute text-center citation-fl"
          style={{
            bottom: '-18px',
            right: '-10px',
            background: '#ff4d4d',
            color: '#fff',
            fontSize: '15px',
            lineHeight: 1.05,
            padding: '4px 12px',
            border: '3px solid #111',
            borderRadius: '8px',
            transform: 'rotate(7deg)',
            boxShadow: '3px 3px 0 #111',
            WebkitTextStroke: '0.6px #111',
          }}
        >
          ILS ONT FAIM
          <br />
          LES GENS!
        </span>

        {/* Etiquette */}
        <span
          className="inline-block mb-2"
          style={{
            background: '#1b6ec2',
            color: '#fff',
            fontSize: '12px',
            padding: '3px 12px',
            border: '2px solid #111',
            borderRadius: '6px',
            transform: 'rotate(-2deg)',
            letterSpacing: '0.5px',
          }}
        >
          ★ LA PENSÉE DU JOUR
        </span>

        {/* Citation */}
        <p
          className="citation-texte"
          style={{
            color: '#111',
            fontSize: '18px',
            lineHeight: 1.45,
            letterSpacing: '0.5px',
            margin: '6px 0 0',
          }}
        >
          {citation}
        </p>

        {/* Signature */}
        <p
          className="text-right"
          style={{
            color: '#555',
            fontSize: '14px',
            letterSpacing: '1px',
            margin: '14px 0 0',
          }}
        >
          — L'ARPÈGE
        </p>
      </div>

      <style>{`
        @keyframes citationPop {
          0% { transform: scale(0.4) rotate(-12deg); opacity: 0; }
          60% { transform: scale(1.06) rotate(3deg); }
          100% { transform: scale(1) rotate(-1deg); opacity: 1; }
        }
        @keyframes citationShk {
          0%,100% { transform: rotate(-6deg) scale(1); }
          50% { transform: rotate(-9deg) scale(1.06); }
        }
        @keyframes citationFl {
          0%,100% { transform: rotate(7deg) scale(1); }
          50% { transform: rotate(10deg) scale(1.06); }
        }
        @keyframes citationSpin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes citationDrop {
          0% { transform: translateY(-20px) scale(0.6); opacity: 0; }
          70% { transform: translateY(3px) scale(1.05); }
          100% { transform: translateY(0) scale(1); opacity: 1; }
        }
        .citation-pop { animation: citationPop 0.6s cubic-bezier(.2,.9,.3,1.3) forwards; }
        .citation-rayons { animation: citationSpin 18s linear infinite; }
        .citation-shk { animation: citationDrop 0.5s ease-out 0.2s both, citationShk 0.35s ease-in-out 4 0.7s; }
        .citation-fl { animation: citationDrop 0.5s ease-out 0.5s both, citationFl 0.4s ease-in-out 4 1.1s; }
        .citation-texte { animation: citationDrop 0.4s ease-out 0.5s both; }
      `}</style>
    </section>
  );
}
