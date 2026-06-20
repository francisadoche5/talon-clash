// Translation dictionary for Talon Clash.
//
// Keys are flat dot-paths, e.g. "nav.market". To add a new language, copy the
// `en` block, translate every value, and add it under its language code below
// (use the two-letter code Telegram reports in WebApp.initDataUnsafe.user.language_code).
//
// To localize MORE strings later: add the key/value here for every language,
// then in a component call `t('your.key')` from `useLanguage()` instead of
// hardcoding the English text. Anything not yet wrapped in `t()` will keep
// showing its original hardcoded English — this file currently covers the
// navigation, Lobby, Energy modal, Market, Inventory and Earn screens, which
// are the highest-traffic parts of the app.

export const LANGUAGES = [
  { code: 'en', label: 'English',    flag: '🇬🇧' },
  { code: 'es', label: 'Español',    flag: '🇪🇸' },
  { code: 'pt', label: 'Português',  flag: '🇧🇷' },
  { code: 'fr', label: 'Français',   flag: '🇫🇷' },
  { code: 'ru', label: 'Русский',    flag: '🇷🇺' },
  { code: 'tr', label: 'Türkçe',     flag: '🇹🇷' },
  { code: 'ar', label: 'العربية',     flag: '🇸🇦' },
  { code: 'id', label: 'Indonesia',  flag: '🇮🇩' },
];

const translations = {
  en: {
    'nav.market': 'Market', 'nav.inventory': 'Inventory', 'nav.lobby': 'Lobby',
    'nav.clans': 'Clans', 'nav.skills': 'Skills', 'nav.earn': 'Earn',

    'lobby.dailyQuests': 'Daily Quests', 'lobby.battle': 'BATTLE', 'lobby.epic': 'EPIC',
    'lobby.mode': 'MODE', 'lobby.auto': 'AUTO', 'lobby.power': 'Power',
    'lobby.characteristics': 'Characteristics', 'lobby.yourPower': 'Your power', 'lobby.continue': 'Continue',

    'energy.title': 'Energy', 'energy.restoreInstantly': 'Restore energy instantly',
    'energy.regenRate': '+0.17 ⚡ each 10 seconds', 'energy.free': 'FREE', 'energy.watchAd': 'Watch Ad',
    'energy.limitReached': 'Limit reached', 'energy.owned': 'OWNED', 'energy.use': 'USE',

    'market.store': 'STORE', 'market.paysWith': "Pays with Star Credits first, Telegram Stars if you're short",
    'market.special': 'Special', 'market.starCredits': 'Star Credits', 'market.chests': 'Chests',
    'market.feathers': 'Feathers', 'market.boosters': 'Boosters', 'market.epicBoosters': 'Epic Boosters',
    'market.hammers': 'Hammers',

    'inventory.equipped': 'Equipped', 'inventory.inventory': 'Inventory', 'inventory.chests': 'Chests',
    'inventory.open': 'Open', 'inventory.opening': 'Opening…', 'inventory.awesome': 'Awesome!',
    'inventory.youGotItem': 'You got an item!', 'inventory.equip': 'Equip', 'inventory.forge': 'Forge',
    'inventory.burn': 'Burn', 'inventory.close': 'Close',

    'earn.daily': 'Daily', 'earn.weekly': 'Weekly', 'earn.invite': 'Invite',
    'earn.inviteFriends': 'Invite Friends', 'earn.earnFeathers': 'Earn feathers for every friend you invite!',
    'earn.copy': 'Copy Link', 'earn.copied': 'Copied!', 'earn.shareTelegram': 'Share via Telegram',
    'earn.invitedFriends': 'Invited Friends', 'earn.noFriendsYet': "You haven't invited anyone yet.",

    'common.save': 'Save', 'common.cancel': 'Cancel', 'common.close': 'Close', 'common.loading': 'Loading…',
    'common.language': 'Language',
  },

  es: {
    'nav.market': 'Mercado', 'nav.inventory': 'Inventario', 'nav.lobby': 'Sala',
    'nav.clans': 'Clanes', 'nav.skills': 'Habilidades', 'nav.earn': 'Ganar',

    'lobby.dailyQuests': 'Misiones diarias', 'lobby.battle': 'BATALLA', 'lobby.epic': 'ÉPICO',
    'lobby.mode': 'MODO', 'lobby.auto': 'AUTO', 'lobby.power': 'Poder',
    'lobby.characteristics': 'Características', 'lobby.yourPower': 'Tu poder', 'lobby.continue': 'Continuar',

    'energy.title': 'Energía', 'energy.restoreInstantly': 'Restaurar energía al instante',
    'energy.regenRate': '+0.17 ⚡ cada 10 segundos', 'energy.free': 'GRATIS', 'energy.watchAd': 'Ver anuncio',
    'energy.limitReached': 'Límite alcanzado', 'energy.owned': 'EN STOCK', 'energy.use': 'USAR',

    'market.store': 'TIENDA', 'market.paysWith': 'Paga primero con Créditos Estelares, y con Telegram Stars si te faltan',
    'market.special': 'Especial', 'market.starCredits': 'Créditos Estelares', 'market.chests': 'Cofres',
    'market.feathers': 'Plumas', 'market.boosters': 'Potenciadores', 'market.epicBoosters': 'Potenciadores Épicos',
    'market.hammers': 'Martillos',

    'inventory.equipped': 'Equipado', 'inventory.inventory': 'Inventario', 'inventory.chests': 'Cofres',
    'inventory.open': 'Abrir', 'inventory.opening': 'Abriendo…', 'inventory.awesome': '¡Genial!',
    'inventory.youGotItem': '¡Conseguiste un objeto!', 'inventory.equip': 'Equipar', 'inventory.forge': 'Forjar',
    'inventory.burn': 'Destruir', 'inventory.close': 'Cerrar',

    'earn.daily': 'Diario', 'earn.weekly': 'Semanal', 'earn.invite': 'Invitar',
    'earn.inviteFriends': 'Invitar amigos', 'earn.earnFeathers': '¡Gana plumas por cada amigo que invites!',
    'earn.copy': 'Copiar enlace', 'earn.copied': '¡Copiado!', 'earn.shareTelegram': 'Compartir por Telegram',
    'earn.invitedFriends': 'Amigos invitados', 'earn.noFriendsYet': 'Todavía no has invitado a nadie.',

    'common.save': 'Guardar', 'common.cancel': 'Cancelar', 'common.close': 'Cerrar', 'common.loading': 'Cargando…',
    'common.language': 'Idioma',
  },

  pt: {
    'nav.market': 'Mercado', 'nav.inventory': 'Inventário', 'nav.lobby': 'Lobby',
    'nav.clans': 'Clãs', 'nav.skills': 'Habilidades', 'nav.earn': 'Ganhar',

    'lobby.dailyQuests': 'Missões diárias', 'lobby.battle': 'BATALHA', 'lobby.epic': 'ÉPICO',
    'lobby.mode': 'MODO', 'lobby.auto': 'AUTO', 'lobby.power': 'Poder',
    'lobby.characteristics': 'Características', 'lobby.yourPower': 'Seu poder', 'lobby.continue': 'Continuar',

    'energy.title': 'Energia', 'energy.restoreInstantly': 'Restaurar energia instantaneamente',
    'energy.regenRate': '+0.17 ⚡ a cada 10 segundos', 'energy.free': 'GRÁTIS', 'energy.watchAd': 'Ver anúncio',
    'energy.limitReached': 'Limite atingido', 'energy.owned': 'EM ESTOQUE', 'energy.use': 'USAR',

    'market.store': 'LOJA', 'market.paysWith': 'Paga primeiro com Créditos Star, e com Telegram Stars se faltar',
    'market.special': 'Especial', 'market.starCredits': 'Créditos Star', 'market.chests': 'Baús',
    'market.feathers': 'Penas', 'market.boosters': 'Impulsionadores', 'market.epicBoosters': 'Impulsionadores Épicos',
    'market.hammers': 'Martelos',

    'inventory.equipped': 'Equipado', 'inventory.inventory': 'Inventário', 'inventory.chests': 'Baús',
    'inventory.open': 'Abrir', 'inventory.opening': 'Abrindo…', 'inventory.awesome': 'Incrível!',
    'inventory.youGotItem': 'Você ganhou um item!', 'inventory.equip': 'Equipar', 'inventory.forge': 'Forjar',
    'inventory.burn': 'Destruir', 'inventory.close': 'Fechar',

    'earn.daily': 'Diário', 'earn.weekly': 'Semanal', 'earn.invite': 'Convidar',
    'earn.inviteFriends': 'Convidar amigos', 'earn.earnFeathers': 'Ganhe penas por cada amigo que você convidar!',
    'earn.copy': 'Copiar link', 'earn.copied': 'Copiado!', 'earn.shareTelegram': 'Compartilhar no Telegram',
    'earn.invitedFriends': 'Amigos convidados', 'earn.noFriendsYet': 'Você ainda não convidou ninguém.',

    'common.save': 'Salvar', 'common.cancel': 'Cancelar', 'common.close': 'Fechar', 'common.loading': 'Carregando…',
    'common.language': 'Idioma',
  },

  fr: {
    'nav.market': 'Marché', 'nav.inventory': 'Inventaire', 'nav.lobby': 'Lobby',
    'nav.clans': 'Clans', 'nav.skills': 'Compétences', 'nav.earn': 'Gagner',

    'lobby.dailyQuests': 'Quêtes quotidiennes', 'lobby.battle': 'COMBAT', 'lobby.epic': 'ÉPIQUE',
    'lobby.mode': 'MODE', 'lobby.auto': 'AUTO', 'lobby.power': 'Puissance',
    'lobby.characteristics': 'Caractéristiques', 'lobby.yourPower': 'Votre puissance', 'lobby.continue': 'Continuer',

    'energy.title': 'Énergie', 'energy.restoreInstantly': "Restaurer l'énergie instantanément",
    'energy.regenRate': '+0.17 ⚡ chaque 10 secondes', 'energy.free': 'GRATUIT', 'energy.watchAd': 'Regarder une pub',
    'energy.limitReached': 'Limite atteinte', 'energy.owned': 'EN STOCK', 'energy.use': 'UTILISER',

    'market.store': 'BOUTIQUE', 'market.paysWith': "Paie d'abord avec les Star Credits, puis Telegram Stars si besoin",
    'market.special': 'Spécial', 'market.starCredits': 'Star Credits', 'market.chests': 'Coffres',
    'market.feathers': 'Plumes', 'market.boosters': 'Boosters', 'market.epicBoosters': 'Boosters Épiques',
    'market.hammers': 'Marteaux',

    'inventory.equipped': 'Équipé', 'inventory.inventory': 'Inventaire', 'inventory.chests': 'Coffres',
    'inventory.open': 'Ouvrir', 'inventory.opening': 'Ouverture…', 'inventory.awesome': 'Génial !',
    'inventory.youGotItem': 'Vous avez obtenu un objet !', 'inventory.equip': 'Équiper', 'inventory.forge': 'Forger',
    'inventory.burn': 'Détruire', 'inventory.close': 'Fermer',

    'earn.daily': 'Quotidien', 'earn.weekly': 'Hebdomadaire', 'earn.invite': 'Inviter',
    'earn.inviteFriends': 'Inviter des amis', 'earn.earnFeathers': 'Gagnez des plumes pour chaque ami invité !',
    'earn.copy': 'Copier le lien', 'earn.copied': 'Copié !', 'earn.shareTelegram': 'Partager via Telegram',
    'earn.invitedFriends': 'Amis invités', 'earn.noFriendsYet': "Vous n'avez encore invité personne.",

    'common.save': 'Enregistrer', 'common.cancel': 'Annuler', 'common.close': 'Fermer', 'common.loading': 'Chargement…',
    'common.language': 'Langue',
  },

  ru: {
    'nav.market': 'Магазин', 'nav.inventory': 'Инвентарь', 'nav.lobby': 'Лобби',
    'nav.clans': 'Кланы', 'nav.skills': 'Навыки', 'nav.earn': 'Заработок',

    'lobby.dailyQuests': 'Ежедневные задания', 'lobby.battle': 'БОЙ', 'lobby.epic': 'ЭПИК',
    'lobby.mode': 'РЕЖИМ', 'lobby.auto': 'АВТО', 'lobby.power': 'Сила',
    'lobby.characteristics': 'Характеристики', 'lobby.yourPower': 'Ваша сила', 'lobby.continue': 'Продолжить',

    'energy.title': 'Энергия', 'energy.restoreInstantly': 'Восстановить энергию мгновенно',
    'energy.regenRate': '+0.17 ⚡ каждые 10 секунд', 'energy.free': 'БЕСПЛАТНО', 'energy.watchAd': 'Смотреть рекламу',
    'energy.limitReached': 'Лимит достигнут', 'energy.owned': 'В НАЛИЧИИ', 'energy.use': 'ИСПОЛЬЗОВАТЬ',

    'market.store': 'МАГАЗИН', 'market.paysWith': 'Сначала списываются Star Credits, а Telegram Stars — если их не хватает',
    'market.special': 'Спецпредложения', 'market.starCredits': 'Star Credits', 'market.chests': 'Сундуки',
    'market.feathers': 'Перья', 'market.boosters': 'Бустеры', 'market.epicBoosters': 'Эпик-бустеры',
    'market.hammers': 'Молотки',

    'inventory.equipped': 'Надето', 'inventory.inventory': 'Инвентарь', 'inventory.chests': 'Сундуки',
    'inventory.open': 'Открыть', 'inventory.opening': 'Открытие…', 'inventory.awesome': 'Отлично!',
    'inventory.youGotItem': 'Вы получили предмет!', 'inventory.equip': 'Надеть', 'inventory.forge': 'Улучшить',
    'inventory.burn': 'Уничтожить', 'inventory.close': 'Закрыть',

    'earn.daily': 'Ежедневно', 'earn.weekly': 'Еженедельно', 'earn.invite': 'Приглашение',
    'earn.inviteFriends': 'Пригласить друзей', 'earn.earnFeathers': 'Получайте перья за каждого приглашённого друга!',
    'earn.copy': 'Скопировать ссылку', 'earn.copied': 'Скопировано!', 'earn.shareTelegram': 'Поделиться через Telegram',
    'earn.invitedFriends': 'Приглашённые друзья', 'earn.noFriendsYet': 'Вы пока никого не пригласили.',

    'common.save': 'Сохранить', 'common.cancel': 'Отмена', 'common.close': 'Закрыть', 'common.loading': 'Загрузка…',
    'common.language': 'Язык',
  },

  tr: {
    'nav.market': 'Market', 'nav.inventory': 'Envanter', 'nav.lobby': 'Lobi',
    'nav.clans': 'Klanlar', 'nav.skills': 'Yetenekler', 'nav.earn': 'Kazan',

    'lobby.dailyQuests': 'Günlük Görevler', 'lobby.battle': 'SAVAŞ', 'lobby.epic': 'EPİK',
    'lobby.mode': 'MOD', 'lobby.auto': 'OTO', 'lobby.power': 'Güç',
    'lobby.characteristics': 'Özellikler', 'lobby.yourPower': 'Gücün', 'lobby.continue': 'Devam',

    'energy.title': 'Enerji', 'energy.restoreInstantly': 'Enerjiyi anında doldur',
    'energy.regenRate': 'Her 10 saniyede +0.17 ⚡', 'energy.free': 'ÜCRETSİZ', 'energy.watchAd': 'Reklam İzle',
    'energy.limitReached': 'Limite ulaşıldı', 'energy.owned': 'STOKTA', 'energy.use': 'KULLAN',

    'market.store': 'MAĞAZA', 'market.paysWith': 'Önce Star Credits, yetmezse Telegram Stars kullanılır',
    'market.special': 'Özel', 'market.starCredits': 'Star Credits', 'market.chests': 'Sandıklar',
    'market.feathers': 'Tüyler', 'market.boosters': 'Güçlendiriciler', 'market.epicBoosters': 'Epik Güçlendiriciler',
    'market.hammers': 'Çekiçler',

    'inventory.equipped': 'Kuşanılmış', 'inventory.inventory': 'Envanter', 'inventory.chests': 'Sandıklar',
    'inventory.open': 'Aç', 'inventory.opening': 'Açılıyor…', 'inventory.awesome': 'Harika!',
    'inventory.youGotItem': 'Bir eşya kazandın!', 'inventory.equip': 'Kuşan', 'inventory.forge': 'Geliştir',
    'inventory.burn': 'Yok Et', 'inventory.close': 'Kapat',

    'earn.daily': 'Günlük', 'earn.weekly': 'Haftalık', 'earn.invite': 'Davet Et',
    'earn.inviteFriends': 'Arkadaşlarını Davet Et', 'earn.earnFeathers': 'Davet ettiğin her arkadaş için tüy kazan!',
    'earn.copy': 'Bağlantıyı Kopyala', 'earn.copied': 'Kopyalandı!', 'earn.shareTelegram': "Telegram'da Paylaş",
    'earn.invitedFriends': 'Davet Edilen Arkadaşlar', 'earn.noFriendsYet': 'Henüz kimseyi davet etmedin.',

    'common.save': 'Kaydet', 'common.cancel': 'İptal', 'common.close': 'Kapat', 'common.loading': 'Yükleniyor…',
    'common.language': 'Dil',
  },

  ar: {
    'nav.market': 'السوق', 'nav.inventory': 'المخزون', 'nav.lobby': 'الردهة',
    'nav.clans': 'العشائر', 'nav.skills': 'المهارات', 'nav.earn': 'اكسب',

    'lobby.dailyQuests': 'المهام اليومية', 'lobby.battle': 'قتال', 'lobby.epic': 'أسطوري',
    'lobby.mode': 'النمط', 'lobby.auto': 'تلقائي', 'lobby.power': 'القوة',
    'lobby.characteristics': 'الخصائص', 'lobby.yourPower': 'قوتك', 'lobby.continue': 'استمرار',

    'energy.title': 'الطاقة', 'energy.restoreInstantly': 'استعادة الطاقة فوراً',
    'energy.regenRate': '+0.17 ⚡ كل 10 ثوانٍ', 'energy.free': 'مجاني', 'energy.watchAd': 'مشاهدة إعلان',
    'energy.limitReached': 'تم الوصول للحد', 'energy.owned': 'متوفر', 'energy.use': 'استخدام',

    'market.store': 'المتجر', 'market.paysWith': 'يُدفع أولاً من Star Credits، ومن Telegram Stars عند النقص',
    'market.special': 'عروض خاصة', 'market.starCredits': 'Star Credits', 'market.chests': 'الصناديق',
    'market.feathers': 'الريش', 'market.boosters': 'المعززات', 'market.epicBoosters': 'معززات أسطورية',
    'market.hammers': 'المطارق',

    'inventory.equipped': 'مجهّز', 'inventory.inventory': 'المخزون', 'inventory.chests': 'الصناديق',
    'inventory.open': 'فتح', 'inventory.opening': 'جارٍ الفتح…', 'inventory.awesome': 'رائع!',
    'inventory.youGotItem': 'لقد حصلت على عنصر!', 'inventory.equip': 'تجهيز', 'inventory.forge': 'تطوير',
    'inventory.burn': 'تدمير', 'inventory.close': 'إغلاق',

    'earn.daily': 'يومي', 'earn.weekly': 'أسبوعي', 'earn.invite': 'دعوة',
    'earn.inviteFriends': 'دعوة الأصدقاء', 'earn.earnFeathers': 'اكسب ريشاً عن كل صديق تدعوه!',
    'earn.copy': 'نسخ الرابط', 'earn.copied': 'تم النسخ!', 'earn.shareTelegram': 'مشاركة عبر تيليجرام',
    'earn.invitedFriends': 'الأصدقاء المدعوون', 'earn.noFriendsYet': 'لم تدعُ أي صديق حتى الآن.',

    'common.save': 'حفظ', 'common.cancel': 'إلغاء', 'common.close': 'إغلاق', 'common.loading': 'جارٍ التحميل…',
    'common.language': 'اللغة',
  },

  id: {
    'nav.market': 'Pasar', 'nav.inventory': 'Inventaris', 'nav.lobby': 'Lobi',
    'nav.clans': 'Klan', 'nav.skills': 'Skill', 'nav.earn': 'Dapatkan',

    'lobby.dailyQuests': 'Misi Harian', 'lobby.battle': 'BERTARUNG', 'lobby.epic': 'EPIK',
    'lobby.mode': 'MODE', 'lobby.auto': 'OTO', 'lobby.power': 'Power',
    'lobby.characteristics': 'Karakteristik', 'lobby.yourPower': 'Power kamu', 'lobby.continue': 'Lanjut',

    'energy.title': 'Energi', 'energy.restoreInstantly': 'Pulihkan energi secara instan',
    'energy.regenRate': '+0.17 ⚡ setiap 10 detik', 'energy.free': 'GRATIS', 'energy.watchAd': 'Tonton Iklan',
    'energy.limitReached': 'Batas tercapai', 'energy.owned': 'TERSEDIA', 'energy.use': 'GUNAKAN',

    'market.store': 'TOKO', 'market.paysWith': 'Membayar dengan Star Credits dahulu, lalu Telegram Stars jika kurang',
    'market.special': 'Spesial', 'market.starCredits': 'Star Credits', 'market.chests': 'Peti',
    'market.feathers': 'Bulu', 'market.boosters': 'Booster', 'market.epicBoosters': 'Booster Epik',
    'market.hammers': 'Palu',

    'inventory.equipped': 'Terpakai', 'inventory.inventory': 'Inventaris', 'inventory.chests': 'Peti',
    'inventory.open': 'Buka', 'inventory.opening': 'Membuka…', 'inventory.awesome': 'Keren!',
    'inventory.youGotItem': 'Kamu mendapatkan item!', 'inventory.equip': 'Pakai', 'inventory.forge': 'Tingkatkan',
    'inventory.burn': 'Hancurkan', 'inventory.close': 'Tutup',

    'earn.daily': 'Harian', 'earn.weekly': 'Mingguan', 'earn.invite': 'Undang',
    'earn.inviteFriends': 'Undang Teman', 'earn.earnFeathers': 'Dapatkan bulu untuk setiap teman yang kamu undang!',
    'earn.copy': 'Salin Tautan', 'earn.copied': 'Tersalin!', 'earn.shareTelegram': 'Bagikan via Telegram',
    'earn.invitedFriends': 'Teman yang Diundang', 'earn.noFriendsYet': 'Kamu belum mengundang siapa pun.',

    'common.save': 'Simpan', 'common.cancel': 'Batal', 'common.close': 'Tutup', 'common.loading': 'Memuat…',
    'common.language': 'Bahasa',
  },
};

export default translations;
