'use client';

import { useState, useEffect, useRef } from 'react';

// 300 citations : 6 affichees par jour (bloc qui change chaque jour).
// Carrousel : fleches (ordi) + swipe au doigt (mobile) + defilement auto 5 s + points.
const CITATIONS: string[] = [
  "\"Vous avez une table près de la fenêtre, pas trop près de la cuisine, pas trop près des toilettes, au calme mais pas isolée ?\" On a aussi un hélicoptère si vous voulez survoler la salle d'abord ?",
  "Le mec qui commande \"le moins cher de la carte\" et demande trois fois si c'est vraiment bon. Frère, à ce prix, c'est bon pour ton portefeuille, point.",
  "\"Je suis pas pressé.\" Trois minutes plus tard : \"ça vient ?\" T'as la patience d'un grille-pain, toi.",
  "Table qui demande la carte des desserts avant même l'entrée. On planifie l'apocalypse sucrée dès le départ, j'aime l'ambition.",
  "\"C'est fait sur place ?\" Non, on a une usine secrète au sous-sol, avec des lutins. Bien sûr que c'est fait sur place.",
  "Le client qui goûte le vin, fronce les sourcils, fait durer le suspense… puis dit \"ça ira\". Tout ce cinéma pour \"ça ira\".",
  "\"Vous pouvez rajouter du fromage ?\" Sur les profiteroles ? Monsieur, j'admire votre créativité, mais non.",
  "La table qui appelle \"psssst\". Je suis serveur, pas un chat. Mais bon, j'arrive, miaou.",
  "\"On était là l'an dernier, vous vous souvenez ?\" Monsieur, je me souviens pas de ce que j'ai mangé ce midi.",
  "Le mec qui veut \"un truc simple\" puis pose 14 questions sur la provenance des légumes. Simple, qu'il disait.",
  "\"C'est bio ?\" Le sourire que je vous fais, lui, il est 100% chimique à cette heure.",
  "Table qui commande, puis change tout, puis revient au premier choix. On a fait un grand voyage pour rien, ensemble.",
  "\"Vous avez du pain ?\" Oui. \"Encore du pain ?\" Oui. \"Encore ?\" Monsieur, vous êtes venu pour le pain ou pour manger ?",
  "Le client qui demande si le plat est \"copieux\". Ça dépend, vous avez faim ou vous voulez juste m'embêter ?",
  "\"Je peux avoir la même chose que lui mais sans ce qu'il a ?\" Donc une assiette vide qui le regarde manger ?",
  "Table qui réclame du ketchup sur un plat gastronomique. Le chef vient de sentir une perturbation dans la Force.",
  "\"Vous fermez vraiment ? Il est que minuit.\" Oui. Et nous on a commencé à 9h. Faites le calcul.",
  "Le mec qui claque des doigts ET siffle. Combo légendaire. Tu veux aussi que je rapporte la balle ?",
  "\"C'est trop chaud.\" Deux minutes après : \"c'est froid maintenant.\" Y'a une fenêtre de tir de 4 secondes, fallait viser.",
  "Table de huit qui veut \"juste un café\" à 13h un dimanche. Vous occupez la place de huit repas pour un expresso. Bravo.",
  "\"Vous pouvez baisser le chauffage ?\" et la table d'à côté \"vous pouvez le monter ?\". Je vais juste m'immoler, ça réglera les deux.",
  "Le client qui ramène SA bouteille de vin \"pour pas payer le vôtre\". Et tu veux qu'on te l'ouvre gratos aussi ? Le culot a un visage.",
  "\"Y'a pas de menu enfant ?\" Madame, votre fils a 19 ans.",
  "Table qui demande l'addition, puis recommande des cafés, puis redemande l'addition. On fait du yoyo, j'adore.",
  "\"Vous acceptez les tickets resto périmés ?\" Périmés. Comme mon envie de vivre à 23h30, monsieur.",
  "Le mec qui veut goûter trois plats \"pour décider\" avant de commander. C'est un resto, pas un marché de Marrakech.",
  "\"C'est vous le chef ?\" Non. \"Et vous ?\" Non plus. On est juste les esclaves, le chef est planqué.",
  "Table qui se plaint que \"c'est bruyant\" un samedi soir à 21h. Vous vouliez le calme ? Y'a les bibliothèques pour ça.",
  "\"Je voudrais le plat de la photo.\" Madame, la photo a été prise par un pro avec trois projecteurs, votre assiette aura vécu, elle.",
  "Le client qui demande s'il peut \"négocier le prix\". On est pas au souk, mon grand, c'est marqué dessus.",
  "La première commande tombe, et déjà ton dos te dit \"bonne chance pour ce soir, moi je lâche\".",
  "Le rush, c'est quand tu portes quatre assiettes, deux verres, et l'espoir de finir vivant.",
  "Trois tables commandent en même temps. Ton cerveau fait \"erreur 404, serveur introuvable\".",
  "Le pic du service : tu cours tellement que tu sais plus si t'apportes ou si tu débarrasses. Tu fais les deux. En même temps. Magie.",
  "\"Ça sort !\" crié douze fois. Mec, je me dédouble pas, j'ai essayé, ça marche pas.",
  "En plein rush, le téléphone sonne. Personne peut répondre. Il sonne jusqu'à la fin des temps.",
  "Le moment où la salle est pleine, la cuisine est en feu, et le boss dit \"souriez\". Je souris. Avec les dents serrées. De rage.",
  "Coup de feu : la seule discipline olympique où tu transpires, tu cours, tu souffres, et personne te donne de médaille.",
  "La sueur qui coule dans le dos pendant le rush, c'est le baptême du vrai serveur.",
  "Le plat est prêt, il refroidit sous la lampe, et toi t'es coincé à expliquer la carte des vins à un philosophe.",
  "En plein feu, une table demande \"vous avez deux secondes ?\". J'ai pas deux secondes. J'ai même pas deux neurones de libres.",
  "Le rush te transforme : tu rentres serveur, tu ressors machine de guerre dégoulinante.",
  "Quand ça envoie de partout, le silence n'existe plus, juste le bruit des tickets et de ton cœur qui panique.",
  "Le service du soir qui démarre avant que celui du midi soit digéré. On enchaîne les rounds comme un boxeur sonné.",
  "Le coup de feu, c'est beau de loin. De près, c'est un champ de bataille avec des assiettes.",
  "Tu poses une assiette, trois autres apparaissent. C'est sans fin. C'est Sisyphe avec un tablier.",
  "Pic du service : tu communiques avec l'équipe par regards et grognements. On se comprend. On est une meute.",
  "La cuisine envoie plus vite que tu peux porter. C'est une course, et tu perds, mais tu cours quand même.",
  "Le moment où tout s'accumule et où tu décides juste de ne plus réfléchir et de foncer. Mode survie activé.",
  "Coup de feu fini, tu t'arrêtes une seconde, et là tu sens TOUS tes muscles te détester en même temps.",
  "Le chef qui goûte, fait silence, puis hurle. On sait jamais si c'est bon ou si on va mourir.",
  "En cuisine, la température c'est \"chaud\", \"très chaud\", et \"pourquoi j'ai pas fait avocat\".",
  "Le commis qui se brûle pour la dixième fois et dit \"ça va\". Frère, ça va pas, mais on admire le courage.",
  "Le chef qui réclame le silence pendant le dressage. C'est sacré. C'est de l'art. Avec des cris quand même.",
  "La plonge, c'est le trou noir de la cuisine. Tout y entre, rien n'en ressort propre assez vite.",
  "Le moment où la friteuse fait un bruit bizarre et où toute la cuisine retient son souffle.",
  "Le chef qui jette un plat raté à la poubelle avec la grâce d'un basketteur. Trois points, et de la rage.",
  "\"On est en rupture de ça.\" La phrase qui fait pâlir tout le monde en plein service.",
  "Le commis qui chante en cuisine pendant le coup de feu. Soit il est fou, soit c'est un génie. Souvent les deux.",
  "La cuisine à 23h : on dirait une zone de guerre, mais qui sent étonnamment bon.",
  "Le chef qui dit \"c'est moi qui décide\". Oui chef. Toujours oui chef. On a appris.",
  "Le frigo qui tombe en panne un vendredi. Le destin a vraiment un sale humour.",
  "Le moment où le chef goûte ta sauce et hoche la tête. Cette validation vaut tous les diplômes du monde.",
  "En cuisine, \"deux minutes\" peut vouloir dire deux minutes, ou vingt. Personne sait. C'est le mystère.",
  "Le commis qui empile les assiettes propres comme un dieu Tetris. Respect pour cet artiste méconnu.",
  "La hotte qui fait tellement de bruit qu'on s'entend plus penser. Du coup on pense plus. C'est reposant.",
  "Le chef qui sort de cuisine pour saluer une table satisfaite : transformation en star instantanée.",
  "Le moment où il manque UN ingrédient et où il faut improviser comme un MacGyver des fourneaux.",
  "La cuisine fermée, nettoyée, qui brille : la plus belle vision du monde après une soirée de folie.",
  "Le chef qui dit \"bon service ce soir l'équipe\". Rare. Précieux. On le grave dans le marbre.",
  "Pourboire de deux centimes. Merci. Je vais le mettre au musée des moqueries.",
  "Le client qui dit \"gardez la monnaie\" sur 20 centimes. Votre générosité me bouleverse, vraiment.",
  "Pas de pourboire mais un \"c'était parfait\". Ouais, le parfait il paie pas le loyer, monsieur.",
  "La table qui calcule le pourboire à la virgule près avec une calculette. La passion du détail, j'imagine.",
  "Pourboire généreux : tu te souviens de leur visage pour toujours, ils deviennent ta famille.",
  "\"Je te laisse un gros pourboire la prochaine fois.\" La prochaine fois c'est jamais, on le sait tous les deux.",
  "Le mec qui paie 80 euros et chipote sur 50 centimes de supplément. Les priorités, quoi.",
  "Pourboire en monnaie étrangère \"souvenir de vacances\". Je paie mon loyer en pesos maintenant, super.",
  "La table qui part en laissant les pièces sous le verre, et toi tu fais l'archéologue pour les récupérer.",
  "Un vrai bon pourboire après un service de fou : ça recharge les batteries plus que dix cafés.",
  "Le nouveau qui demande \"c'est toujours comme ça ?\" un soir de rush. Non petit. C'est pire d'habitude.",
  "Le collègue qui te couvre quand t'es débordé : c'est ça, l'amour, le vrai.",
  "L'extra qui débarque et connaît rien, et toi qui dois tout gérer en plus. Merci la vie.",
  "Le serveur qui mange debout en 90 secondes entre deux services. Champion de la digestion express.",
  "Le moment où toute l'équipe est synchro et où ça roule tout seul. Rare, magique, on savoure.",
  "Le collègue qui te raconte une blague nulle en plein rush et te fait quand même rire. C'est ça, les frères d'armes.",
  "Le repas du personnel avant le service : le seul moment de paix avant la tempête.",
  "Le serveur qui connaît tous les habitués par leur prénom mais oublie de manger lui-même. Priorités inversées.",
  "L'équipe qui se charrie pendant le ménage de fin de soirée : c'est crevant, mais c'est familial.",
  "Le moment où un collègue craque, et où toute l'équipe se serre autour. On lâche personne, jamais.",
  "Le commis qui devient serveur le temps d'un rush et découvre l'enfer de la salle. Bienvenue, petit.",
  "Le boss qui met la main à la pâte un soir de galère : respect immédiat, équipe soudée.",
  "Le serveur expérimenté qui glisse un conseil au nouveau en pleine action : transmission silencieuse du savoir.",
  "Le fou rire collectif quand tout part en vrille : c'est le ciment de l'équipe.",
  "Le collègue qui te ramène un café sans que tu demandes : reconnu coupable d'être un ange.",
  "La pause de cinq minutes où toute l'équipe s'effondre sur les chaises comme après une bataille.",
  "Le serveur qui danse en débarrassant pour tenir le coup : la folie douce du métier.",
  "Le moment où on compte la caisse ensemble et où ça tombe juste : petite victoire, grand soulagement.",
  "L'équipe qui trinque après la fermeture : on a survécu, encore une fois, ensemble.",
  "Le nouveau qui devient un vrai après son premier gros rush. Bienvenue dans la famille, petit.",
  "La \"coupure\" de l'après-midi : trois heures pour récupérer d'un service et te préparer au prochain. Génial.",
  "Tu rentres chez toi, tu sens encore la friture, c'est ton parfum maintenant, accepte-le.",
  "Le serveur qui marche 15 km par soir sans quitter une salle de 60 m². Athlète invisible.",
  "Le réveil le lendemain : chaque muscle te rappelle la soirée d'hier avec rancune.",
  "Travailler quand les autres font la fête, et faire la fête quand les autres dorment. La vie à l'envers.",
  "La fatigue de fin de service, c'est un niveau de fatigue que seuls les restaurateurs connaissent.",
  "Tu finis à 1h, tu recommences à 9h. Le sommeil est un luxe, pas un droit, dans ce métier.",
  "Le moment où tu t'assois enfin et où tu réalises que tes pieds ont déclaré la guerre.",
  "Les jambes lourdes, le dos cassé, mais le sourire encore là : la force tranquille du serveur.",
  "Le week-end des autres, c'est ton enfer à toi. Mais on aime ça. Un peu. Beaucoup. Bizarrement.",
  "La table qui demande \"c'est quoi le plat du jour ?\" alors que c'est écrit en gros sur l'ardoise devant eux.",
  "Le client qui éternue sur le buffet et fait comme si de rien. On a vu, monsieur. On a TOUT vu.",
  "Le mec qui s'endort à table après le dessert. On le réveille ou on le facture en chambre d'hôtel ?",
  "La table qui applaudit quand un serveur fait tomber un plat. Merci pour le soutien, bande de sadiques.",
  "Le client qui demande \"vous avez du sel ?\" alors que la salière est juste devant lui. Juste là. À 10 cm.",
  "Le groupe qui chante \"joyeux anniversaire\" pour la cinquième fois ce soir. C'est l'anniv de qui là, du serveur épuisé ?",
  "La table qui veut payer \"en plusieurs fois sur plusieurs jours\". On est un resto, pas un organisme de crédit.",
  "Le mec qui ramène son chien \"qui tient sur une chaise\". Monsieur, c'est un berger allemand.",
  "La cliente qui refait son maquillage avec les couverts comme miroir. L'inox, c'est multifonction maintenant.",
  "Le client qui demande à parler au chef pour lui expliquer comment cuisiner. Le culot incarné, en chair et en os.",
  "Servir, c'est offrir un moment. Même quand t'as les pieds en feu et l'âme en miettes.",
  "Le métier nous apprend la patience. Surtout avec les gens qui en ont aucune.",
  "Un bon service, c'est invisible : le client voit la magie, pas la sueur derrière.",
  "On nourrit les gens, on crée des souvenirs. C'est pas rien, même un mardi soir pourri.",
  "Le restaurateur, c'est un acteur : peu importe la journée, le show doit continuer.",
  "Derrière chaque assiette, y'a des heures de boulot que personne voit. Mais nous on le sait.",
  "Le métier forge le caractère : après cinq ans en salle, plus rien te fait peur.",
  "On donne le sourire même quand on l'a pas. C'est ça, le vrai professionnalisme.",
  "Un client content qui revient, c'est la plus belle des récompenses. Mieux qu'un pourboire. Presque.",
  "On fait pas ce métier pour l'argent. On le fait parce qu'on est un peu fous, et qu'on aime ça.",
  "\"Vous avez un menu sans calories ?\" Oui monsieur, ça s'appelle un verre d'eau.",
  "Le client qui commande un steak bien cuit puis se plaint qu'il est sec. C'est toi qui l'as voulu, Roméo.",
  "\"Vous pouvez me faire une réduction, j'ai pas tout aimé.\" T'as fini l'assiette par contre, curieux.",
  "La table qui demande douze fois \"et comme accompagnement ?\" pour finalement prendre des frites. Toujours des frites.",
  "Le mec qui veut \"le plat traditionnel mais revisité mais comme l'original\". Décide-toi, on n'a pas la nuit.",
  "\"Vous avez ça en plus petit et moins cher ?\" Oui, ça s'appelle ne rien commander, c'est gratuit.",
  "La cliente qui parle au téléphone pendant toute la commande et te fait signe d'attendre. J'attends. J'attends ma retraite aussi.",
  "Le client qui demande \"c'est frais ?\" en regardant le poisson avec suspicion. Plus frais que votre attitude, monsieur.",
  "\"Je prendrai juste une salade.\" Puis pique dans toutes les assiettes des autres. La salade alibi, on connaît.",
  "Le mec qui veut renvoyer un plat à moitié mangé. Tu l'as à moitié aimé alors, on facture la moitié ?",
  "\"Vous servez encore à manger ?\" à 23h45. Non. Mais bon courage pour trouver mieux ailleurs.",
  "La table qui demande à changer de place après s'être installée, déballée, et avoir commandé. Pourquoi. Juste pourquoi.",
  "\"C'est combien le verre d'eau ?\" Gratuit, monsieur. Comme votre toupet.",
  "Le client qui veut \"parler au responsable\" parce que sa fourchette a une rayure. La rayure du siècle, sortez les violons.",
  "\"Vous avez du décaféiné ?\" À 13h. Pour rester éveillé jusqu'à... rien du tout en fait.",
  "La table qui commande le dessert le plus long à faire pile à la fermeture. Le timing du chaos.",
  "Le mec qui demande \"vous mettez combien de temps ?\" pour CHAQUE plat. On fait pas du fast-food, frère, respire.",
  "\"C'est vous qui avez fait la déco ?\" Non, mais merci de meubler la conversation pendant que je note.",
  "Le client qui veut un \"petit geste commercial\" à sa première visite. Le geste, je le retiens, croyez-moi.",
  "La table qui laisse les enfants courir partout. Garderie non incluse dans le menu, madame.",
  "Quand trois tables réclament l'addition en même temps : tu deviens caissier, comptable et magicien.",
  "Le rush où tu fais 200 allers-retours et où ton podomètre te traite de fou.",
  "En plein feu, faire tomber un plateau, c'est pas un accident, c'est une tragédie grecque.",
  "Le service où tout va bien jusqu'à ce qu'UNE table fasse tout dérailler. Toujours une table.",
  "Coup de feu : tu transpires tellement que ta chemise raconte ta soirée à elle seule.",
  "Le moment où la cuisine et la salle sont en parfaite synchro : du ballet, mais en sueur.",
  "Quand le rush passe, le silence soudain est presque flippant. On a survécu. Encore.",
  "En plein feu, oublier une commande, c'est commettre un crime contre l'humanité (la table, surtout).",
  "Le service du dimanche midi : famille, enfants, mamies. Le marathon le plus chronophage de la semaine.",
  "Le rush qui finit, et où tu réalises que t'as pas bu d'eau depuis quatre heures. Chameau professionnel.",
  "Le boss qui dit \"on va embaucher\" depuis trois ans. On y croit. Un peu. De moins en moins.",
  "Le patron qui goûte le plat du jour et dit \"parfait\" sans avoir vu le bordel en cuisine. Vision sélective.",
  "Le boss qui annonce un \"petit changement de carte\" la veille d'un samedi blindé. Petit. Bien sûr.",
  "Le patron qui compte la caisse trois fois parce qu'il manque deux euros. La rigueur, c'est sacré.",
  "Le boss qui dit \"faites comme chez vous\" aux clients. Monsieur, chez eux ils crient pas après le serveur. Si ?",
  "Le patron qui débarque pile quand tout est calme et repart pile quand le rush commence. Le timing du destin.",
  "Le boss qui offre un café à l'équipe après un gros service : moment de grâce inattendu.",
  "Le patron qui dit \"le client est roi\". Ouais, et nous on est quoi, les serfs du royaume ?",
  "Le boss qui teste un nouveau plat sur l'équipe avant le service. Cobayes consentants, mais cobayes quand même.",
  "Le patron qui dit \"bonne soirée l'équipe\" en partant pendant qu'on attaque le rush. Merci. Vraiment.",
  "La panne de courant en plein service. Dîner aux chandelles forcé. \"Comme c'est romantique !\" Non madame, c'est la cata.",
  "Le plat du jour épuisé à 12h15. La journée commence fort, accrochez-vous.",
  "Le livreur en retard, le frigo vide, et le service dans une heure. Improvisation niveau expert.",
  "La machine à café qui rend l'âme un dimanche matin. Le pire scénario possible, scientifiquement prouvé.",
  "Un évier qui se bouche en plein coup de feu. La plonge devient une piscine. Joie.",
  "Le serveur malade qui manque, et toi qui fais le boulot de deux. Bonjour le dédoublement.",
  "La réservation \"fantôme\" qui n'apparaît nulle part mais \"j'ai appelé hier !\". Bien sûr, monsieur.",
  "Le groupe annoncé de 10 qui arrive à 20. On improvise, on rallonge, on prie.",
  "Le climatiseur en panne un soir de canicule. La salle devient un sauna avec menu.",
  "Le terminal de paiement qui plante quand TOUTES les tables veulent payer. Le cauchemar logistique ultime.",
  "Le collègue qui arrive en retard avec un café pour tout le monde : pardonné instantanément.",
  "Le serveur qui imite le client relou après son départ : spectacle gratuit pour l'équipe.",
  "Le commis qui apprend vite et soulage tout le monde : trésor national de la cuisine.",
  "Le moment où un collègue te sauve d'une table impossible : dette d'honneur à vie.",
  "L'équipe qui se passe le mot d'un regard quand un client chiant arrive : télépathie de salle.",
  "Le serveur qui garde le moral de tous quand ça craque : le pilier invisible de l'équipe.",
  "Le repas d'équipe après la fermeture : les meilleures rigolades de la semaine.",
  "Le nouveau qui ramène des viennoiseries son premier jour : adopté immédiatement.",
  "Le collègue qui connaît tous les ragots et anime les coupures : la radio interne du resto.",
  "L'équipe qui range en musique à 1h du matin : crevés, mais on danse encore un peu.",
  "La table romantique qui se dispute. Tu sais plus si t'apportes le dessert ou les mouchoirs.",
  "Le client qui drague le serveur. Monsieur, j'ai 14 tables, je peux pas gérer une histoire d'amour en plus.",
  "La table de potes qui rit trop fort et fait l'ambiance de la salle. Eux au moins, on les aime.",
  "Le premier rendez-vous gêné où tu fais semblant de rien voir. Discrétion professionnelle, niveau ninja.",
  "La table qui te prend pour leur psy et te raconte toute leur vie. C'est compris dans le menu, ça ?",
  "Le grand-père qui laisse un compliment sincère sur le service : ça vaut tout l'or du monde.",
  "La famille bruyante mais joyeuse qui repart en remerciant chaleureusement : on oublie la fatigue.",
  "Le client habitué qui demande de tes nouvelles : le métier a aussi ces beaux moments-là.",
  "La table qui fête une bonne nouvelle et t'inclut dans la joie : c'est pour ça qu'on aime ce job.",
  "Le couple âgé qui vient depuis 20 ans : on fait partie de leur histoire, sans même le savoir.",
  "\"Vous avez du vrai sucre, pas du faux ?\" Le sucre faux, ça existe pas, monsieur. Comme votre logique.",
  "La table qui commande tout \"à partager\" puis se bat pour le dernier morceau. Le partage, version gladiateurs.",
  "Le client qui veut \"le menu d'avant, celui de l'an dernier\". On a pas de machine à remonter le temps, désolé.",
  "\"C'est compris dans le prix ?\" Pour la dixième fois : oui. Tout est compris. Même ma patience. Surtout ma patience.",
  "Le mec qui demande \"c'est quoi le mieux ?\" et conteste chaque suggestion. Décide tout seul alors, expert.",
  "La table qui veut \"une ambiance plus calme\" en plein samedi soir festif. On éteint la joie pour vous ?",
  "\"Vous faites des parts de bébé ?\" Madame, votre \"bébé\" mesure 1m80.",
  "Le client qui renvoie le vin \"trop vineux\". C'est... c'est du vin, monsieur. Par définition.",
  "La table qui veut payer chacun sa part exacte sur 15 personnes. Sortez les calculatrices, on en a pour la nuit.",
  "\"Je veux le plat mais comme à la maison.\" Bah cuisinez-le à la maison alors, c'est plus simple pour tout le monde.",
  "Le mec qui demande la recette complète du chef. Bien essayé, espion industriel.",
  "La table qui se plaint que \"c'est trop bon, du coup on a trop mangé\". C'est... une plainte, ça ?",
  "\"Vous pouvez réchauffer mon plat, j'ai trop parlé.\" C'est pas un micro-ondes ici, c'est un resto.",
  "Le client qui veut goûter avant de payer \"pour être sûr\". On est pas au supermarché, mon grand.",
  "La table qui demande l'addition séparée après avoir tout partagé et tout mélangé. Mission mathématiquement impossible.",
  "\"Vous avez wifi, prises, et chargeur ?\" On est un resto, pas un coworking, monsieur.",
  "Le client qui critique le plat puis demande s'il peut l'emporter. Tu le détestes mais tu le veux, ce paradoxe.",
  "\"C'est trop épicé.\" Vous avez commandé le plat avec trois piments sur la carte. C'était un indice.",
  "La table qui fait durer le café deux heures en occupant quatre places le soir d'affluence. Camping non autorisé.",
  "Le mec qui veut \"un truc surprenant mais sans risque\". La surprise sans risque, ça s'appelle l'ennui, monsieur.",
  "Le moment où tu confonds \"bon appétit\" et \"au revoir\" tellement t'es cramé.",
  "Tu rêves de t'asseoir, mais t'as oublié comment on fait. La position assise, c'est un mythe lointain.",
  "Fin de service : ton cerveau a quitté le bâtiment, ton corps fait le reste en pilote automatique.",
  "Tu comptes les heures, puis t'arrêtes parce que ça déprime trop. Ignorance volontaire, technique de survie.",
  "Le serveur qui sourit à la dernière table avec ses dernières forces. Héroïsme silencieux.",
  "Tu rentres, tu te poses, et tu réalises que tu peux plus te relever. La chaise t'a capturé.",
  "Le lendemain d'un gros service : courbatures dignes d'un marathon, sans la médaille.",
  "Tu dors enfin, et tu rêves que tu prends des commandes. Même le sommeil bosse au resto.",
  "La fatigue de fin de saison : tu fonctionnes au café et à la volonté pure.",
  "Mais bizarrement, tu reviens le lendemain. Parce qu'au fond, t'adores ça. Espèce de fou.",
  "\"Vous prenez les pièces jaunes ?\" Pour 40 euros d'addition ? On va y passer la nuit, monsieur.",
  "Le client qui demande à voir \"tous les desserts en vrai\" avant de choisir. C'est un défilé de mode, ça ?",
  "La table qui commande à 14h pile \"vous servez encore ?\" avec le sourire innocent. Le timing assassin.",
  "\"Je veux la même chose qu'eux.\" Ils ont rien commandé encore. On tourne en rond, vous et moi.",
  "Le mec qui demande \"c'est quoi votre spécialité ?\" et prend le plat le plus banal. Toujours.",
  "La table qui chuchote pour critiquer, mais tu entends tout. L'acoustique, ça pardonne pas, les amis.",
  "\"Vous avez changé de chef ? C'est moins bon.\" C'est le même chef depuis dix ans, madame.",
  "Le client qui demande un \"supplément gratuit\". Le supplément, par définition... laissez tomber.",
  "La table qui réserve pour 19h et débarque à 21h \"vous avez gardé la table ?\". Non. Devinez pourquoi.",
  "\"Vous pouvez nous chanter un truc ?\" On est serveurs, pas la comédie musicale du dîner, monsieur.",
  "Le client qui pose son sac sur la chaise d'à côté dans un resto bondé. La chaise paie pas de loyer, elle.",
  "La table qui veut \"l'addition mais on reste encore un peu\". Vous partez ou vous emménagez ?",
  "\"C'est bon mais y'avait mieux ailleurs.\" Allez-y alors, on retient personne, promis.",
  "Le mec qui commande de l'eau plate, gazeuse, puis du robinet \"pour comparer\". On fait de la dégustation d'eau maintenant ?",
  "La table qui veut absolument la recette \"pour la refaire\", note tout, et reviendra jamais. On le sait.",
  "\"Vous fermez les yeux sur un petit pourboire en moins ?\" Mes yeux je les ferme sur rien à cette heure, monsieur.",
  "Le client qui veut \"le menu enfant pour adulte\". Soit vous assumez, soit vous payez plein tarif, choisissez.",
  "La table qui demande \"vous avez une terrasse ?\" sous la pluie battante. On a une terrasse aquatique, oui.",
  "\"C'est self-service ?\" Non monsieur. Mais merci de m'avoir donné une idée pour me reposer un peu.",
  "Le client qui critique tout puis demande la carte de fidélité. La cohérence, ça se mange pas ici.",
  "Quand un collègue galère, on plonge tous l'aider. Personne coule seul dans ce resto.",
  "Le high-five discret entre serveurs après une table impossible enfin partie : pure victoire.",
  "L'équipe qui se comprend sans parler en plein rush : c'est de la magie, ou des années de guerre commune.",
  "Le moment où le boss reconnaît le boulot de l'équipe : ça vaut une augmentation. Presque.",
  "Le serveur qui partage son pourboire avec la cuisine : la solidarité, c'est ça aussi.",
  "Quand un nouveau réussit son premier gros service, toute l'équipe est fière comme des parents.",
  "Le café partagé à 1h après la fermeture : les meilleures conversations naissent là, épuisés mais heureux.",
  "L'équipe qui couvre le collègue qui a un coup dur : on est une famille, pas juste des collègues.",
  "Le fou rire incontrôlable en plein service qu'on essaie de cacher aux clients : moment de pure complicité.",
  "Quand tout le monde s'y met pour finir plus vite et rentrer : l'union fait la force, littéralement.",
  "Le serveur qui forme le nouveau avec patience : transmettre, c'est faire vivre le métier.",
  "L'équipe qui se serre les coudes un soir de catastrophe : c'est dans la galère qu'on se révèle.",
  "Le moment où on réalise qu'on forme une vraie bande, pas juste des employés : ça réchauffe le cœur.",
  "Le collègue qui te défend face à un client injuste : loyauté sans faille, respect éternel.",
  "Quand la soirée est finie et qu'on est tous cuits mais qu'on rigole encore : c'est ça, la vraie paie.",
  "On commence à vide, on finit cramés, mais entre les deux on a fait vivre 100 personnes. Pas mal.",
  "Chaque service est un combat. Chaque fin de service est une victoire. On collectionne les deux.",
  "On n'a pas choisi le métier le plus facile. On a choisi le plus vivant. Et ça, ça se paie en sueur.",
  "Le resto, c'est pas un job, c'est un sport de combat avec des assiettes et des sourires.",
  "À la fin de la soirée, peu importe le chaos, on se regarde et on sait : on l'a fait. Ensemble.",
  "On porte des assiettes, mais surtout on porte des moments, des souvenirs, des sourires.",
  "Les pieds en compote, le dos cassé, mais le cœur plein : c'est le bilan d'un bon service.",
  "On fait ce métier de tarés, et au fond on l'adore. Sinon on serait déjà partis.",
  "Une équipe soudée peut affronter n'importe quel rush. Et la nôtre, elle est en béton armé.",
  "Le secret d'un bon resto, c'est pas la carte. C'est les gens derrière. C'est nous.",
  "On transforme un repas en souvenir. C'est un super-pouvoir, même si personne nous donne de cape.",
  "Chaque jour on remet ça, parce qu'on aime nourrir, faire plaisir, et survivre ensemble.",
  "Le client voit une assiette. Nous on voit des heures de boulot et une équipe qui se démène. Fierté.",
  "On rentre crevés mais on revient toujours. C'est ça, l'amour du métier. Ou la folie. Les deux.",
  "Petite équipe, grand cœur, énorme niveau. On n'a rien à envier à personne.",
  "Le rush nous casse, mais il nous soude aussi. Plus c'est dur, plus on est proches.",
  "On fait pas semblant : ce métier prend tout, mais il rend beaucoup. À ceux qui aiment vraiment.",
  "À la fin, c'est jamais la fatigue qu'on retient. C'est les rires, les victoires, l'équipe.",
  "On est les soldats de l'ombre du plaisir des autres. Et on porte l'uniforme avec fierté.",
  "Une bonne soirée, c'est quand le client repart heureux et que l'équipe repart fière. Double victoire.",
  "On bosse quand les autres se reposent, mais on vit des trucs qu'ils vivront jamais. Échange équitable.",
  "La salle se vide, les lumières s'éteignent, et on reste là, cuits mais contents. Ce moment-là vaut tout.",
  "Le métier nous teste chaque jour, et chaque jour on relève le défi. C'est ça, les champions.",
  "On n'a pas de médailles, pas de podium, mais on a l'équipe. Et c'est largement suffisant.",
  "Chaque service raconte une histoire. Et nous, on en écrit une nouvelle chaque soir, ensemble.",
  "Le vrai luxe, c'est une équipe sur qui compter quand tout part en vrille. Et ça, on l'a.",
  "On encaisse les coups durs, on garde le sourire, on avance. Parce qu'on est bâtis pour ça.",
  "Derrière chaque grand resto, y'a une équipe qui se donne à fond. La nôtre, c'est la meilleure.",
  "On finit la semaine sur les rotules, mais fiers comme jamais. C'est ça, le métier qu'on aime.",
  "Un service réussi, c'est de l'art collectif. Et chaque membre de l'équipe est un artiste.",
  "On rentre tard, on se lève tôt, mais on tient. Parce qu'ensemble, on est increvables.",
  "Le resto, c'est notre arène. On y entre nerveux, on en sort grandis. Chaque soir.",
  "Peu importe les tables relous, les pieds en feu, les coups de bourre : on lâche jamais.",
  "À toute l'équipe : vous êtes l'âme de cette maison. Sans vous, c'est juste quatre murs et des chaises.",
  "On a tenu. Encore. Ensemble. Crevés, fiers, soudés. Bravo la team — vous êtes des champions. Toujours.",
];

const PAR_JOUR = 6;
const DELAI_AUTO = 5000;

function jourDeLAnnee(): number {
  const now = new Date();
  const debut = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - debut.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

function citationsDuJour(): string[] {
  const total = CITATIONS.length;
  const depart = (jourDeLAnnee() * PAR_JOUR) % total;
  const res: string[] = [];
  for (let i = 0; i < PAR_JOUR; i++) {
    res.push(CITATIONS[(depart + i) % total]);
  }
  return res;
}

export default function CitationDuJour() {
  const citations = citationsDuJour();
  const [index, setIndex] = useState(0);
  const [pause, setPause] = useState(false);
  const touchX = useRef<number | null>(null);

  useEffect(() => {
    if (pause) return;
    const t = setInterval(() => {
      setIndex((i) => (i + 1) % citations.length);
    }, DELAI_AUTO);
    return () => clearInterval(t);
  }, [pause, citations.length]);

  function aller(nouvelIndex: number) {
    setIndex((nouvelIndex + citations.length) % citations.length);
    setPause(true);
    setTimeout(() => setPause(false), 10000);
  }

  function onTouchStart(e: React.TouchEvent) {
    touchX.current = e.touches[0].clientX;
  }
  function onTouchEnd(e: React.TouchEvent) {
    if (touchX.current === null) return;
    const delta = e.changedTouches[0].clientX - touchX.current;
    if (delta > 40) aller(index - 1);
    else if (delta < -40) aller(index + 1);
    touchX.current = null;
  }

  const citation = citations[index];

  const fleche = {
    width: '34px', height: '34px', flexShrink: 0, display: 'flex',
    alignItems: 'center', justifyContent: 'center', background: '#1b6ec2',
    color: '#fff', border: '3px solid #111', borderRadius: '8px',
    boxShadow: '2px 2px 0 #111', cursor: 'pointer', fontSize: '18px',
    lineHeight: 1, padding: 0,
  } as React.CSSProperties;

  return (
    <section
      className="relative my-2"
      style={{ fontFamily: 'var(--font-graff, "Bangers", system-ui)' }}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute rounded-2xl opacity-20 citation-rayons"
        style={{
          inset: '-12px',
          background:
            'repeating-conic-gradient(from 0deg, #1b6ec2 0deg 9deg, #0d4e8c 9deg 18deg)',
        }}
      />

      <div
        className="relative rounded-xl"
        style={{
          background: '#fff7e6',
          border: '4px solid #111',
          boxShadow: '7px 7px 0 #111',
          padding: '26px 18px 22px',
        }}
      >
        <span
          className="absolute citation-shk"
          style={{
            top: '-26px', left: '-12px', background: '#ffcf33', color: '#111',
            fontSize: '26px', padding: '4px 16px', border: '3px solid #111',
            borderRadius: '8px', transform: 'rotate(-6deg)', boxShadow: '3px 3px 0 #111',
            WebkitTextStroke: '1px #111',
          }}
        >
          BAM!
        </span>

        <span
          className="absolute text-center citation-fl"
          style={{
            bottom: '-18px', right: '-10px', background: '#ff4d4d', color: '#fff',
            fontSize: '15px', lineHeight: 1.05, padding: '4px 12px', border: '3px solid #111',
            borderRadius: '8px', transform: 'rotate(7deg)', boxShadow: '3px 3px 0 #111',
            WebkitTextStroke: '0.6px #111',
          }}
        >
          ILS ONT FAIM
          <br />
          LES GENS!
        </span>

        <span
          className="inline-block mb-2"
          style={{
            background: '#1b6ec2', color: '#fff', fontSize: '12px', padding: '3px 12px',
            border: '2px solid #111', borderRadius: '6px', transform: 'rotate(-2deg)',
            letterSpacing: '0.5px',
          }}
        >
          ★ LA PENSÉE DU JOUR
        </span>

        <div className="flex items-center gap-2">
          <button aria-label="Citation precedente" onClick={() => aller(index - 1)} style={fleche}>
            ‹
          </button>

          <p
            key={index}
            className="citation-texte flex-1"
            style={{
              color: '#111', fontSize: '18px', lineHeight: 1.45, letterSpacing: '0.5px',
              margin: 0, minHeight: '100px', display: 'flex', alignItems: 'center',
            }}
          >
            {citation}
          </p>

          <button aria-label="Citation suivante" onClick={() => aller(index + 1)} style={fleche}>
            ›
          </button>
        </div>

        <div className="flex items-center justify-center gap-1.5 mt-3">
          {citations.map((_, i) => (
            <button
              key={i}
              aria-label={'Citation ' + (i + 1)}
              onClick={() => aller(i)}
              style={{
                width: i === index ? '18px' : '7px', height: '7px', borderRadius: '4px',
                border: '1.5px solid #111', background: i === index ? '#ff4d4d' : 'transparent',
                padding: 0, cursor: 'pointer', transition: 'width 0.2s',
              }}
            />
          ))}
        </div>

        <p
          className="text-right"
          style={{ color: '#555', fontSize: '14px', letterSpacing: '1px', margin: '4px 0 0' }}
        >
          — L'ARPÈGE
        </p>
      </div>

      <style>{`
        @keyframes citationShk { 0%,100% { transform: rotate(-6deg) scale(1); } 50% { transform: rotate(-9deg) scale(1.06); } }
        @keyframes citationFl { 0%,100% { transform: rotate(7deg) scale(1); } 50% { transform: rotate(10deg) scale(1.06); } }
        @keyframes citationSpin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes citationFade { 0% { opacity: 0; transform: translateY(8px); } 100% { opacity: 1; transform: translateY(0); } }
        .citation-rayons { animation: citationSpin 18s linear infinite; }
        .citation-shk { animation: citationShk 0.35s ease-in-out 4 0.7s; }
        .citation-fl { animation: citationFl 0.4s ease-in-out 4 1.1s; }
        .citation-texte { animation: citationFade 0.4s ease-out; }
      `}</style>
    </section>
  );
}
