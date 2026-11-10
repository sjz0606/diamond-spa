/* Diamond SPA — concept site logic (i18n, live clock, massage ring, picker, branches) */
(function () {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const root = document.documentElement;

  /* ---------- capability: WebGL / reduced motion / low power ---------- */
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let glOk = false;
  try { const c = document.createElement('canvas'); glOk = !!(c.getContext('webgl2') || c.getContext('webgl')); } catch (e) {}
  const lowPower = (navigator.deviceMemory && navigator.deviceMemory <= 2) || (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 2);
  const forceNoGL = new URLSearchParams(location.search).has('nogl');
  const useGL = glOk && !reduce && !lowPower && !forceNoGL;
  if (!useGL) root.classList.add('no-gl');
  window.DS = { steamP: 0, reduce, useGL };

  /* ---------- i18n ---------- */
  const T = {
    ru: {
      skip: 'К подбору программы', clockLabel: 'Ташкент', openNow: 'открыто',
      navSteam: 'Пар и вода', navMassage: 'Массаж', navBranches: 'Филиалы',
      heroA: 'В Ташкенте', heroB: 'Мы открыты — как и всегда.',
      heroLead: 'Больше 20 видов массажа, финская сауна и кедровая бочка, хаммам и бассейн. Три филиала, круглосуточно и без выходных.',
      ctaPick: 'Подобрать программу', ctaCall: 'Позвонить',
      bMinor: 'Минор', bMirobod: 'Мирабад', bNovza: 'Новза',
      heroHint: 'Коснитесь кадра — по нему пойдёт волна',
      steamTitle: 'Пар и вода',
      s1t: 'Финская сауна', s1p: 'Сухой жар деревянной парной. Прогреться перед массажем — или просто посидеть в тишине после долгого дня.',
      s2t: 'Кедровая бочка', s2p: 'Мини-парная из кедра: вы сидите внутри, голова остаётся снаружи. Тело прогревается мягко.',
      s3t: 'Турецкий хаммам', s3p: 'Мягкое тепло хаммама разгоняет кровь, и тело готово к массажу. Здесь же — пилинг с кесе.',
      s4t: 'Бассейн', s4p: 'После пара — прохладная вода. «В горячем пару набраться сил, в прохладной воде обновиться».',
      steamNote: 'Сауна, кедровая бочка, хаммам и бассейн — на Миноре. Что есть в других филиалах, уточняйте по телефону.',
      massageTitle: 'Массаж',
      massageLead: 'Больше двадцати видов. Здесь — те, что мастера Diamond показывают в своих видео. Покрутите кольцо или выберите, чего хочется.',
      gAll: 'Все', gRelax: 'Расслабиться', gMuscle: 'Спина и мышцы', gStress: 'Уйти от стресса', gSkin: 'Кожа и тонус',
      add: 'Добавить в подбор', added: 'В подборе — убрать',
      src: 'Из материалов Diamond SPA в Instagram',
      pickerTitle: 'Подобрать программу',
      pickerLead: 'Отметьте, чего хочется, — мы соберём сообщение для администратора выбранного филиала. Стоимость и свободное время он подскажет сразу.',
      st1: 'Чего хочется', st2: 'Массаж', st2hint: 'Подходящие под цель отмечены рамкой. Можно выбрать несколько — или оставить выбор мастеру.',
      st3: 'Пар и вода', extrasNote: 'В этом филиале набор зон уточнит администратор.',
      st4: 'Когда', wNow: 'Сейчас', wEvening: 'Сегодня вечером', wNight: 'Сегодня ночью', wTime: 'Ко времени', wTimeLabel: 'Дата и время',
      st5: 'Сколько гостей', st6: 'Филиал',
      noteTitle: 'Ваше сообщение', actCall: 'Позвонить в филиал', actCopy: 'Скопировать текст', actDirect: 'Написать в Instagram',
      noteFine: 'Цены и длительность сеансов на сайте не указаны — администратор назовёт их по телефону или в Direct.',
      branchesTitle: 'Три филиала. Все открыты сейчас.',
      branchesLead: 'Круглосуточно, без выходных. Выберите ближайший — и звоните в любое время.',
      open247: 'Открыто · круглосуточно', map: 'Открыть на карте',
      svcMinor: 'Массаж, финская сауна, кедровая бочка, хаммам, бассейн',
      svcOther: 'Массаж. Остальные зоны уточняйте по телефону филиала',
      footLine: 'Массаж, сауна, хаммам и бассейн в Ташкенте. 24/7.',
      concept: 'Концепт сайта · Lumagen',
      copied: 'Текст скопирован', copiedOpen: 'Текст скопирован — вставьте его в чат', copyFail: 'Не удалось скопировать — выделите текст вручную',
      // message
      mHello: 'Здравствуйте! Хочу записаться в Diamond SPA.', mBranch: 'Филиал', mProg: 'Массаж', mProgAny: 'посоветуйте, пожалуйста, под мою цель',
      mGoal: 'Цель', mExtras: 'Дополнительно', mWhen: 'Когда', mGuests: 'Гостей', mAsk: 'Подскажите, пожалуйста, стоимость и свободное время.',
      wNowM: 'сейчас, как можно скорее', wEveningM: 'сегодня вечером', wNightM: 'сегодня ночью', wTimeM: 'ко времени — уточню',
      goalM: { relax: 'расслабиться', muscle: 'снять напряжение в спине и мышцах', stress: 'отдохнуть от стресса', skin: 'кожа и тонус тела' },
      prev: 'Назад', next: 'Вперёд'
    },
    uz: {
      skip: 'Dastur tanlashga o‘tish', clockLabel: 'Toshkent', openNow: 'ochiq',
      navSteam: 'Bug‘ va suv', navMassage: 'Massaj', navBranches: 'Filiallar',
      heroA: 'Toshkentda soat', heroB: 'Biz ochiqmiz — har doimgidek.',
      heroLead: '20 dan ortiq massaj turi, fin saunasi va kedr bochkasi, hammom va basseyn. Uchta filial, kecha-kunduz, dam olish kunlarisiz.',
      ctaPick: 'Dastur tanlash', ctaCall: 'Qo‘ng‘iroq qilish',
      bMinor: 'Minor', bMirobod: 'Mirobod', bNovza: 'Novza',
      heroHint: 'Kadrga teging — undan to‘lqin tarqaladi',
      steamTitle: 'Bug‘ va suv',
      s1t: 'Fin saunasi', s1p: 'Yog‘och bug‘xonaning quruq issig‘i. Massajdan oldin qizib olish — yoki uzun kundan keyin jimjitlikda o‘tirish uchun.',
      s2t: 'Kedr bochkasi', s2p: 'Kedrdan yasalgan mini-bug‘xona: o‘zingiz ichida o‘tirasiz, boshingiz tashqarida qoladi. Tana yumshoq qiziydi.',
      s3t: 'Turk hammomi', s3p: 'Hammomning mayin issiqligi qon aylanishini tezlashtiradi, tana esa massajga tayyor bo‘ladi. Shu yerda — kese bilan piling.',
      s4t: 'Basseyn', s4p: 'Bug‘dan keyin — salqin suv. «Issiq bug‘da kuch top, sovuq suvda yangilan».',
      steamNote: 'Sauna, kedr bochkasi, hammom va basseyn — Minor filialida. Boshqa filiallarda nimalar borligini telefon orqali aniqlang.',
      massageTitle: 'Massaj',
      massageLead: 'Yigirmadan ortiq turi bor. Bu yerda — Diamond ustalari o‘z videolarida ko‘rsatadiganlari. Halqani aylantiring yoki maqsadni tanlang.',
      gAll: 'Hammasi', gRelax: 'Bo‘shashish', gMuscle: 'Bel va mushaklar', gStress: 'Stressdan xalos bo‘lish', gSkin: 'Teri va tana tonusi',
      add: 'Tanlovga qo‘shish', added: 'Tanlovda — olib tashlash',
      src: 'Diamond SPA Instagram materiallaridan',
      pickerTitle: 'Dastur tanlash',
      pickerLead: 'Nimani xohlayotganingizni belgilang — tanlangan filial administratori uchun xabar tayyorlab beramiz. Narx va bo‘sh vaqtni u darhol aytadi.',
      st1: 'Nimani xohlaysiz', st2: 'Massaj', st2hint: 'Maqsadingizga mosi ramka bilan belgilangan. Bir nechtasini tanlash yoki tanlovni ustaga qoldirish mumkin.',
      st3: 'Bug‘ va suv', extrasNote: 'Bu filialdagi zonalarni administrator aniqlashtiradi.',
      st4: 'Qachon', wNow: 'Hozir', wEvening: 'Bugun kechqurun', wNight: 'Bugun tunda', wTime: 'Belgilangan vaqtga', wTimeLabel: 'Sana va vaqt',
      st5: 'Mehmonlar soni', st6: 'Filial',
      noteTitle: 'Sizning xabaringiz', actCall: 'Filialga qo‘ng‘iroq qilish', actCopy: 'Matnni nusxalash', actDirect: 'Instagramda yozish',
      noteFine: 'Saytda narx va seans davomiyligi ko‘rsatilmagan — administrator ularni telefonda yoki Direct’da aytadi.',
      branchesTitle: 'Uchta filial. Hammasi hozir ochiq.',
      branchesLead: 'Kecha-kunduz, dam olish kunlarisiz. Eng yaqinini tanlang — va istalgan vaqtda qo‘ng‘iroq qiling.',
      open247: 'Ochiq · kecha-kunduz', map: 'Xaritada ochish',
      svcMinor: 'Massaj, fin saunasi, kedr bochkasi, hammom, basseyn',
      svcOther: 'Massaj. Boshqa zonalarni filial telefoni orqali aniqlang',
      footLine: 'Toshkentda massaj, sauna, hammom va basseyn. 24/7.',
      concept: 'Sayt konsepti · Lumagen',
      copied: 'Matn nusxalandi', copiedOpen: 'Matn nusxalandi — uni chatga joylang', copyFail: 'Nusxalab bo‘lmadi — matnni qo‘lda belgilang',
      mHello: 'Assalomu alaykum! Diamond SPA’ga yozilmoqchiman.', mBranch: 'Filial', mProg: 'Massaj', mProgAny: 'maqsadimga mosini maslahat bering',
      mGoal: 'Maqsad', mExtras: 'Qo‘shimcha', mWhen: 'Qachon', mGuests: 'Mehmonlar', mAsk: 'Narxi va bo‘sh vaqtni aytib bera olasizmi?',
      wNowM: 'hozir, imkon qadar tezroq', wEveningM: 'bugun kechqurun', wNightM: 'bugun tunda', wTimeM: 'belgilangan vaqtga — aniqlashtiraman',
      goalM: { relax: 'bo‘shashish', muscle: 'bel va mushaklardagi zo‘riqishni yo‘qotish', stress: 'stressdan dam olish', skin: 'teri va tana tonusi' },
      prev: 'Orqaga', next: 'Oldinga'
    }
  };

  /* ---------- data (only facts from @diamondspa.uz posts/highlights + public directory) ---------- */
  const PROGRAMS = [
    { id: 'klassik', img: 'media/p/DfR8flos0d4.jpg', goals: ['relax', 'muscle'],
      ru: ['Классический массаж', 'Снимает мышечную усталость и напряжение, накопленные за день.'],
      uz: ['Klassik massaj', 'Kun davomida to‘plangan charchoq va mushaklardagi taranglikni yo‘qotadi.'] },
    { id: 'relax', img: 'media/p/Db0rSp0Mz3E.jpg', goals: ['relax', 'stress'],
      ru: ['Релакс-массаж', 'Мягкий темп, тишина и тепло — чтобы выдохнуть и ни о чём не думать.'],
      uz: ['Relaks massaj', 'Sokin sur’at, jimjitlik va iliqlik — nafas rostlab, hech narsani o‘ylamaslik uchun.'] },
    { id: 'mix2', img: 'media/p/DZxod8fsMQA.jpg', goals: ['relax', 'muscle'],
      ru: ['Микс 2 в 1', 'Классический + релакс в одном сеансе, 1 час.'],
      uz: ['2 v 1 miks', 'Bitta seansda klassik + relaks, 1 soat.'] },
    { id: 'royal', img: 'media/p/DafvZilsI31.jpg', goals: ['relax', 'stress'],
      ru: ['Королевский массаж', 'Синхронный массаж тела в четыре руки — два мастера одновременно.'],
      uz: ['Korolevskiy massaj', 'To‘rt qo‘l bilan sinxron tana massaji — bir vaqtning o‘zida ikki usta.'] },
    { id: 'sport', img: 'media/p/DX93ijgskek.jpg', goals: ['muscle'],
      ru: ['Спортивный массаж', 'Для тех, кто тренируется, — и для тех, кто весь день сидит за работой и «застыл».'],
      uz: ['Sport massaji', 'Sportchilar uchun — va kun bo‘yi o‘tirib ishlab, qotib qolganlar uchun ham.'] },
    { id: 'health', img: 'media/p/DTfviBYjKLh.jpg', goals: ['relax', 'muscle'],
      ru: ['Оздоровительный массаж', 'С головы до кончиков пальцев ног, средней жёсткости — подходит всем.'],
      uz: ['Sog‘lomlashtiruvchi massaj', 'Boshdan boshlab oyoq uchi barmoqlarigacha, o‘rtacha qattiqlikda — hammaga mos.'] },
    { id: 'medical', img: 'media/p/DXHXZMkDGTY.jpg', goals: ['muscle'],
      ru: ['Лечебный массаж', 'Расскажите администратору, что беспокоит, — он подскажет подходящего мастера.'],
      uz: ['Davolovchi massaj', 'Nima bezovta qilayotganini administratorga ayting — u mos ustani tavsiya qiladi.'] },
    { id: 'antistress', img: 'media/p/Deb-jxBshKB.jpg', goals: ['stress', 'relax'],
      ru: ['Антистресс', 'Когда устала не спина, а голова: отпустить напряжение и переключиться.'],
      uz: ['Antistress', 'Bel emas, bosh charchaganda: zo‘riqishni qo‘yib yuborish va chalg‘ish uchun.'] },
    { id: 'foot', img: 'media/hl/h00_26.jpg', goals: ['relax', 'stress'],
      ru: ['Массаж стоп', 'На стопе больше 20 точек — их массаж ощутимо влияет на самочувствие.'],
      uz: ['Oyoq massaji', 'Oyoq ostida 20 dan ortiq nuqta bor — ularning massaji salomatlikka katta ta’sir ko‘rsatadi.'] },
    { id: 'scrub', img: 'media/hl/h00_36.jpg', goals: ['skin'],
      ru: ['Скраб-массаж', 'Скраб очищает кожу от ороговевших клеток, разгоняет кровь — кожа становится гладкой и мягкой.'],
      uz: ['Skrabli massaj', 'Skrab o‘lik hujayralarni olib tashlaydi, qon aylanishini yaxshilaydi — teri silliq va yumshoq bo‘ladi.'] },
    { id: 'honey', img: 'media/p/DYXnTJLM-eb.jpg', goals: ['skin', 'relax'],
      ru: ['Медовый массаж', 'Есть в меню Diamond наравне с классическим, релаксом и спортивным. Подробности — у администратора.'],
      uz: ['Asal massaji', 'Diamond menyusida klassik, relaks va sport massaji bilan birga bor. Batafsil — administratordan.'] },
    { id: 'anticell', img: 'media/p/DTVgCqEDIw1.jpg', goals: ['skin'],
      ru: ['Антицеллюлитный массаж', 'Для тонуса тела. Курс и частоту подскажет мастер.'],
      uz: ['Antitsellyulit massaji', 'Tana tonusi uchun. Kurs va qatnov chastotasini usta aytadi.'] },
    { id: 'peeling', img: 'media/p/DUs2wW5DCqu.jpg', goals: ['skin', 'relax'],
      ru: ['Пилинг тела в хаммаме', 'Тепло хаммама, кесе и пена — а после него массаж ложится особенно хорошо.'],
      uz: ['Hammomda tana pilingi', 'Hammom issiqligi, kese va ko‘pik — undan keyin massaj ayniqsa yoqimli.'] },
    { id: 'mix4', img: 'media/vp/Dak9IZksxz2_5.jpg', goals: ['muscle', 'relax'],
      ru: ['Микс 4 в 1', 'Самый насыщенный набор: отдых и польза в одном визите. Состав уточните у администратора.'],
      uz: ['4 v 1 miks', 'Dam va foydaning eng kuchli to‘plami. Tarkibini administratordan aniqlang.'] }
  ];
  const BRANCHES = [
    { id: 'minor', ig: 'diamondspa.uz', phones: ['+998930815555', '+998930083232', '+998953411515'], full: true,
      map: 'https://yandex.uz/maps/10335/tashkent/?text=Diamond%20Spa%2C%20%D0%BF%D1%80%D0%BE%D1%81%D0%BF%D0%B5%D0%BA%D1%82%20%D0%90%D0%BC%D0%B8%D1%80%D0%B0%20%D0%A2%D0%B5%D0%BC%D1%83%D1%80%D0%B0%2C%20122%D0%91',
      ru: ['Минор', 'Юнусабадский р-н, пр. Амира Темура, 122Б — рядом с метро «Минор»'],
      uz: ['Minor', 'Yunusobod tumani, Amir Temur shoh ko‘chasi, 122B — «Minor» metrosi yonida'] },
    { id: 'mirobod', ig: 'diamondspa.uz', phones: ['+998930915555'], full: false,
      map: 'https://yandex.uz/maps/10335/tashkent/?text=%D0%A2%D0%B0%D1%88%D0%BA%D0%B5%D0%BD%D1%82%2C%20%D1%83%D0%BB%D0%B8%D1%86%D0%B0%20%D0%90%D0%B2%D0%BB%D0%B8%D1%91%20%D0%9E%D1%82%D0%B0%2C%209',
      ru: ['Мирабад', 'Мирабадский р-н, ул. Авлиё Ота, 9 (массив Госпитальный)'],
      uz: ['Mirobod', 'Mirobod tumani, Avliyo Ota ko‘chasi, 9 (Gospitalniy massivi)'] },
    { id: 'novza', ig: 'diamondspa.uz', phones: ['+998930415555'], full: false,
      map: 'https://yandex.uz/maps/10335/tashkent/?text=%D0%A2%D0%B0%D1%88%D0%BA%D0%B5%D0%BD%D1%82%2C%20%D0%BF%D1%80%D0%BE%D1%81%D0%BF%D0%B5%D0%BA%D1%82%20%D0%91%D1%83%D0%BD%D1%91%D0%B4%D0%BA%D0%BE%D1%80%2C%2011',
      ru: ['Новза', 'Чиланзарский р-н, пр. Бунёдкор, квартал Чиланзар-Е, 11'],
      uz: ['Novza', 'Chilonzor tumani, Bunyodkor shoh ko‘chasi, Chilonzor-E mavzesi, 11'] }
  ];
  const EXTRAS = { sauna: 's1t', barrel: 's2t', hammam: 's3t', pool: 's4t' };
  const fmtPhone = p => p.replace(/^\+998(\d{2})(\d{3})(\d{2})(\d{2})$/, '+998 $1 $2 $3 $4');

  /* ---------- state ---------- */
  const qs = new URLSearchParams(location.search).get('lang');
  let lang = (qs === 'uz' || qs === 'ru') ? qs : (localStorage.getItem('ds_lang') || 'ru');
  if (lang !== 'uz' && lang !== 'ru') lang = 'ru';
  const S = { goal: null, progs: new Set(), extras: new Set(), when: 'now', time: '', guests: 1, branch: 'minor' };
  const t = k => (T[lang][k] ?? T.ru[k] ?? k);

  /* ---------- toast ---------- */
  let toastT;
  function toast(msg) { const el = $('#toast'); el.textContent = msg; el.classList.add('is-on'); clearTimeout(toastT); toastT = setTimeout(() => el.classList.remove('is-on'), 2600); }

  /* ---------- clock (Asia/Tashkent) ---------- */
  const tf = new Intl.DateTimeFormat('ru-RU', { timeZone: 'Asia/Tashkent', hour: '2-digit', minute: '2-digit', hour12: false });
  function tick() { const s = tf.format(new Date()); $$('.js-time').forEach(e => { if (e.textContent !== s) e.textContent = s; }); }
  tick(); setInterval(tick, 10000);

  /* ---------- i18n apply ---------- */
  function applyLang() {
    root.lang = lang;
    $$('[data-i18n]').forEach(el => { const v = T[lang][el.dataset.i18n]; if (typeof v === 'string') el.textContent = v; });
    $$('.lang button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.lang === lang)));
    document.title = lang === 'uz' ? 'Diamond SPA — massaj, sauna, hammom. Toshkent, kecha-kunduz' : 'Diamond SPA — массаж, сауна, хаммам. Ташкент, круглосуточно';
    $('#ringPrev').setAttribute('aria-label', t('prev')); $('#ringNext').setAttribute('aria-label', t('next'));
    renderRingLabels(); renderDetail(); renderProgChips(); renderBranchPick(); renderBranches(); renderNote();
  }
  $$('.lang button').forEach(b => b.addEventListener('click', () => {
    lang = b.dataset.lang; localStorage.setItem('ds_lang', lang);
    const u = new URL(location.href); u.searchParams.set('lang', lang); history.replaceState(null, '', u);
    applyLang();
  }));

  /* ---------- header solid on scroll + mobile bar ---------- */
  const top = $('#top'), mbar = $('#mbar');
  function onScroll() {
    const y = scrollY;
    top.classList.toggle('is-solid', y > 40);
    const pk = $('#picker').getBoundingClientRect();
    const inPicker = pk.top < innerHeight * .6 && pk.bottom > innerHeight * .4;
    const sr = $('#steam').getBoundingClientRect();
    const inSteam = !root.classList.contains('no-gl') && sr.top < 0 && sr.bottom > innerHeight;
    mbar.classList.toggle('is-on', y > innerHeight * .7 && !inPicker && !inSteam);
    // steam progress (0..3)
    const st = $('#steam');
    if (!root.classList.contains('no-gl')) {
      const r = st.getBoundingClientRect();
      const span = st.offsetHeight - innerHeight;
      const p = Math.min(1, Math.max(0, -r.top / span));
      window.DS.steamP = p * 3;
      const pp = Math.min(2.9999, p * 3), fi = Math.floor(pp);
      const near = Math.min(3, fi + (pp - fi > .65 ? 1 : 0));
      $$('.steam__list li').forEach((li, i) => li.classList.toggle('is-on', i === near));
      $$('.steam__progress i').forEach((el, i) => el.classList.toggle('is-on', i === near));
    }
  }
  addEventListener('scroll', onScroll, { passive: true }); addEventListener('resize', onScroll);

  /* ---------- massage ring ---------- */
  const stage = $('#ringStage'), ring = $('#ring');
  const N = PROGRAMS.length, STEP = 360 / N;
  let angle = 0, target = 0, vel = 0, dragging = false, R = 600, CW = 260, goalFilter = 'all';
  PROGRAMS.forEach((p, i) => {
    const c = document.createElement('div');
    c.className = 'card'; c.dataset.i = i;
    c.innerHTML = `<img data-src="${p.img}" alt="" decoding="async" draggable="false"><span class="card__name"></span>`;
    c.addEventListener('click', () => { if (moved < 6) goTo(i); });
    stage.appendChild(c);
  });
  const cards = $$('.card', stage);
  // load all ring photos together once the section approaches (hidden cards would otherwise lazy-load late)
  new IntersectionObserver((en, io) => { if (en[0].isIntersecting) { $$('img[data-src]', stage).forEach(i => { i.src = i.dataset.src; delete i.dataset.src; }); io.disconnect(); } }, { rootMargin: '800px 0px' }).observe(ring);
  function sizeRing() {
    const w = ring.clientWidth;
    CW = w < 640 ? Math.min(230, w * .58) : Math.min(280, Math.max(220, w * .19));
    R = (CW / 2) / Math.tan(Math.PI / N) * 1.12;
    stage.style.setProperty('--cw', CW + 'px');
    cards.forEach(c => c.style.setProperty('--cw', CW + 'px'));
  }
  function renderRingLabels() { cards.forEach((c, i) => { $('.card__name', c).textContent = PROGRAMS[i][lang][0]; c.setAttribute('aria-label', PROGRAMS[i][lang][0]); }); }
  const norm = a => ((a % 360) + 540) % 360 - 180;
  function layout() {
    cards.forEach((c, i) => {
      const rel = norm(i * STEP + angle);
      const a = Math.abs(rel);
      if (a > 84) { c.style.visibility = 'hidden'; return; }
      c.style.visibility = 'visible';
      c.style.transform = `translateZ(${R}px) rotateY(${-rel}deg) translateZ(${-R}px)`;
      c.style.opacity = String(Math.max(0, 1 - Math.max(0, a - 50) / 34));
      c.style.zIndex = String(100 - Math.round(a));
      c.style.setProperty('--sheen', (Math.max(0, 1 - a / 40) * .22).toFixed(3));
      c.style.setProperty('--tilt', (rel * 1.4).toFixed(1));
    });
  }
  function current() { return ((Math.round(-angle / STEP) % N) + N) % N; }
  let lastCur = -1;
  function goTo(i) {
    const cur = -angle / STEP; let d = i - cur; d = ((d % N) + N + N / 2) % N - N / 2; target = -(cur + d) * STEP; animate();
  }
  let raf = 0;
  function animate() {
    if (raf) return;
    const step = () => {
      raf = 0;
      if (!dragging) {
        if (Math.abs(vel) > .05) { target += vel; vel *= .9; if (Math.abs(vel) <= .05) target = Math.round(target / STEP) * STEP; }
        angle += (target - angle) * (reduce ? 1 : .14);
      }
      layout();
      const c = current(); if (c !== lastCur) { lastCur = c; renderDetail(); }
      if (dragging || Math.abs(target - angle) > .02 || Math.abs(vel) > .05) raf = requestAnimationFrame(step);
      else { angle = target; layout(); }
    };
    raf = requestAnimationFrame(step);
  }
  let sx = 0, sy = 0, lx = 0, moved = 0, pid = null, axis = null;
  ring.addEventListener('pointerdown', e => { if (e.target.closest('.ring__arrow')) return; pid = e.pointerId; sx = lx = e.clientX; sy = e.clientY; moved = 0; axis = null; vel = 0; });
  ring.addEventListener('pointermove', e => {
    if (pid !== e.pointerId) return;
    const dx = e.clientX - sx, dy = e.clientY - sy;
    if (!axis && (Math.abs(dx) > 6 || Math.abs(dy) > 6)) { axis = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y'; if (axis === 'x') { dragging = true; try { ring.setPointerCapture(pid); } catch (_) {} } }
    if (axis !== 'x') return;
    const d = (e.clientX - lx) * (180 / (R * Math.PI)) * 1.1;
    angle += d; target = angle; vel = d; lx = e.clientX; moved = Math.abs(dx); animate();
  });
  const end = e => { if (pid !== e.pointerId) return; pid = null; if (dragging) { dragging = false; target = angle; if (Math.abs(vel) < .5) target = Math.round(angle / STEP) * STEP; else vel = Math.max(-6, Math.min(6, vel)); animate(); } setTimeout(() => moved = 0, 30); };
  ring.addEventListener('pointerup', end); ring.addEventListener('pointercancel', end);
  $('#ringPrev').addEventListener('click', () => goTo((current() - 1 + N) % N));
  $('#ringNext').addEventListener('click', () => goTo((current() + 1) % N));
  ring.addEventListener('keydown', e => { if (e.key === 'ArrowLeft') { e.preventDefault(); goTo((current() - 1 + N) % N); } if (e.key === 'ArrowRight') { e.preventDefault(); goTo((current() + 1) % N); } });

  function renderDetail() {
    const p = PROGRAMS[current()]; if (!p) return;
    $('#detailName').textContent = p[lang][0];
    $('#detailDesc').textContent = p[lang][1];
    $('#detailSrc').textContent = t('src');
    const on = S.progs.has(p.id);
    const b = $('#detailAdd'); b.textContent = on ? t('added') : t('add'); b.setAttribute('aria-pressed', String(on));
  }
  $('#detailAdd').addEventListener('click', () => {
    const p = PROGRAMS[current()];
    if (S.progs.has(p.id)) S.progs.delete(p.id); else { S.progs.add(p.id); toast(p[lang][0] + ' — ' + (lang === 'uz' ? 'tanlovga qo‘shildi' : 'добавлен в подбор')); }
    renderDetail(); renderProgChips(); renderNote();
  });
  function setGoalFilter(g) {
    goalFilter = g;
    $$('#goalChips button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.goal === g)));
    cards.forEach((c, i) => c.classList.toggle('is-dim', g !== 'all' && !PROGRAMS[i].goals.includes(g)));
    if (g !== 'all') { const first = PROGRAMS.findIndex(p => p.goals.includes(g)); const cur = current(); if (!PROGRAMS[cur].goals.includes(g)) goTo(first); }
  }
  $$('#goalChips button').forEach(b => b.addEventListener('click', () => {
    setGoalFilter(b.dataset.goal);
    if (b.dataset.goal !== 'all') { S.goal = b.dataset.goal; syncChips(); renderProgChips(); renderNote(); }
  }));
  sizeRing(); layout(); addEventListener('resize', () => { sizeRing(); layout(); });

  /* ---------- picker ---------- */
  function syncChips() {
    $$('[data-field="goal"] button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.v === S.goal)));
    $$('[data-field="extras"] button').forEach(b => b.setAttribute('aria-pressed', String(S.extras.has(b.dataset.v))));
    $$('[data-field="when"] button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.v === S.when)));
    $('#timeField').hidden = S.when !== 'time';
    $('#guests').textContent = S.guests;
    const br = BRANCHES.find(b => b.id === S.branch);
    $('#extrasNote').hidden = br.full || !S.extras.size;
  }
  function renderProgChips() {
    const box = $('#progChips'); box.innerHTML = '';
    PROGRAMS.forEach(p => {
      const b = document.createElement('button'); b.type = 'button'; b.textContent = p[lang][0];
      b.setAttribute('aria-pressed', String(S.progs.has(p.id)));
      if (S.goal && p.goals.includes(S.goal)) b.classList.add('is-match');
      b.addEventListener('click', () => { S.progs.has(p.id) ? S.progs.delete(p.id) : S.progs.add(p.id); renderProgChips(); renderDetail(); renderNote(); });
      box.appendChild(b);
    });
    // matching first
    if (S.goal) $$('button', box).sort((a, b) => b.classList.contains('is-match') - a.classList.contains('is-match')).forEach(b => box.appendChild(b));
  }
  function renderBranchPick() {
    const box = $('#branchPick'); box.innerHTML = '';
    BRANCHES.forEach(br => {
      const b = document.createElement('button'); b.type = 'button'; b.dataset.v = br.id;
      b.setAttribute('aria-pressed', String(S.branch === br.id));
      b.innerHTML = `<i class="dot"></i><strong></strong><small></small>`;
      $('strong', b).textContent = br[lang][0] + ' · ' + fmtPhone(br.phones[0]);
      $('small', b).textContent = br[lang][1];
      b.addEventListener('click', () => { S.branch = br.id; renderBranchPick(); syncChips(); renderNote(); });
      box.appendChild(b);
    });
  }
  $$('[data-field="goal"] button').forEach(b => b.addEventListener('click', () => { S.goal = S.goal === b.dataset.v ? null : b.dataset.v; syncChips(); renderProgChips(); renderNote(); }));
  $$('[data-field="extras"] button').forEach(b => b.addEventListener('click', () => { const v = b.dataset.v; S.extras.has(v) ? S.extras.delete(v) : S.extras.add(v); syncChips(); renderNote(); }));
  $$('[data-field="when"] button').forEach(b => b.addEventListener('click', () => { S.when = b.dataset.v; syncChips(); renderNote(); if (S.when === 'time') $('#timeInput').focus(); }));
  $('#timeInput').addEventListener('input', e => { S.time = e.target.value; renderNote(); });
  $('#gMinus').addEventListener('click', () => { S.guests = Math.max(1, S.guests - 1); syncChips(); renderNote(); });
  $('#gPlus').addEventListener('click', () => { S.guests = Math.min(10, S.guests + 1); syncChips(); renderNote(); });

  function message() {
    const br = BRANCHES.find(b => b.id === S.branch);
    const L = [t('mHello'), ''];
    L.push(`${t('mBranch')}: ${br[lang][0]} — ${br[lang][1]}`);
    if (S.goal) L.push(`${t('mGoal')}: ${T[lang].goalM[S.goal]}`);
    const progs = PROGRAMS.filter(p => S.progs.has(p.id)).map(p => p[lang][0]);
    L.push(`${t('mProg')}: ${progs.length ? progs.join(', ') : t('mProgAny')}`);
    if (S.extras.size) L.push(`${t('mExtras')}: ${[...S.extras].map(x => t(EXTRAS[x]).toLowerCase()).join(', ')}`);
    let when = t({ now: 'wNowM', evening: 'wEveningM', night: 'wNightM', time: 'wTimeM' }[S.when]);
    if (S.when === 'time' && S.time) {
      const d = new Date(S.time);
      if (!isNaN(d)) when = d.toLocaleString(lang === 'uz' ? 'uz-Latn-UZ' : 'ru-RU', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' });
    }
    L.push(`${t('mWhen')}: ${when}`);
    L.push(`${t('mGuests')}: ${S.guests}`);
    L.push('', t('mAsk'));
    return L.join('\n');
  }
  function renderNote() {
    $('#noteText').textContent = message();
    const br = BRANCHES.find(b => b.id === S.branch);
    $('#actCall').href = 'tel:' + br.phones[0];
    $('#actCall span').textContent = t('actCall') + ' · ' + fmtPhone(br.phones[0]).replace('+998 ', '');
  }
  async function copy(text) {
    try { await navigator.clipboard.writeText(text); return true; } catch (e) {
      const ta = document.createElement('textarea'); ta.value = text; ta.setAttribute('readonly', ''); ta.style.position = 'fixed'; ta.style.opacity = '0'; document.body.appendChild(ta); ta.select();
      let ok = false; try { ok = document.execCommand('copy'); } catch (_) {} ta.remove(); return ok;
    }
  }
  $('#actCopy').addEventListener('click', async () => toast((await copy(message())) ? t('copied') : t('copyFail')));
  $('#actDirect').addEventListener('click', async () => {
    const br = BRANCHES.find(b => b.id === S.branch);
    const ok = await copy(message());
    toast(ok ? t('copiedOpen') : t('copyFail'));
    setTimeout(() => window.open('https://ig.me/m/' + br.ig, '_blank', 'noopener'), 450);
  });

  /* ---------- branches list ---------- */
  function renderBranches() {
    const box = $('#branchList'); box.innerHTML = '';
    BRANCHES.forEach(br => {
      const el = document.createElement('article'); el.className = 'branch'; el.id = 'br-' + br.id;
      el.innerHTML = `<p class="branch__status"><i class="dot"></i><span></span></p><h3></h3><p class="branch__addr"></p><ul class="branch__phones"></ul><p class="branch__svc"></p><a class="branch__map" target="_blank" rel="noopener"></a>`;
      $('.branch__status span', el).textContent = t('open247') + ' · ' + tf.format(new Date());
      $('h3', el).textContent = br[lang][0];
      $('.branch__addr', el).textContent = br[lang][1];
      br.phones.forEach(p => { const li = document.createElement('li'); li.innerHTML = `<a href="tel:${p}">${fmtPhone(p)}</a>`; $('.branch__phones', el).appendChild(li); });
      $('.branch__svc', el).textContent = br.full ? t('svcMinor') : t('svcOther');
      const m = $('.branch__map', el); m.href = br.map; m.textContent = t('map');
      box.appendChild(el);
    });
  }
  setInterval(() => $$('.branch__status span').forEach(s => s.textContent = t('open247') + ' · ' + tf.format(new Date())), 30000);
  $$('[data-branch-link]').forEach(a => a.addEventListener('click', () => {
    const id = a.dataset.branchLink; S.branch = id; renderBranchPick(); syncChips(); renderNote();
    setTimeout(() => { const el = $('#br-' + id); if (el) { el.classList.remove('is-hl'); void el.offsetWidth; el.classList.add('is-hl'); } }, 500);
  }));

  syncChips();
  applyLang();
  onScroll();
})();
