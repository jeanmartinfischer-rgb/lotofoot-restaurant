'use client';

// Citation du jour : tourne dans la liste, change chaque jour (meme citation pour tous).
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

// Numero du jour dans l'annee (1 a 366) -> meme citation pour tout le monde le meme jour
function jourDeLAnnee(): number {
  const now = new Date();
  const debut = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - debut.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

export default function CitationDuJour() {
  const citation = CITATIONS[jourDeLAnnee() % CITATIONS.length];

  return (
    <section className="relative overflow-hidden rounded-2xl border border-sang/40 bg-gradient-to-br from-sang/20 via-ardoise to-pitch p-5">
      {/* Guillemet geant en decoration */}
      <span className="pointer-events-none absolute -top-4 -left-1 font-display text-[120px] leading-none text-sang/20 select-none">
        “
      </span>
      <div className="relative space-y-2">
        <p className="font-mono text-[10px] uppercase tracking-widest text-sang-vif">
          La pensée du jour
        </p>
        <p className="font-display text-base md:text-lg leading-snug text-chalk">
          {citation}
        </p>
        <p className="text-right font-mono text-[10px] text-chalk/40">— L'Arpège</p>
      </div>
    </section>
  );
}
