import type { Locale } from "./messages";

const en = {
  heroFirst: "Find places.",
  heroSecond: "Keep exploring.",
  heroIntro:
    "Your next coffee, a late-night pharmacy, the everyday essentials. Find the places around you, and know when to go.",
  start: "Start your search",
  menu: "Menu",
  help: "Get help",
  close: "Close",
  local: "A little closer to everything.",
  starting: "Discover your neighbourhood",
  intro: "Good places. Less searching. More living.",
  introText:
    "Open24 brings local places, opening hours and directions together. A simpler way to make the most of what's around you.",
  searchTitle: "What are you looking for?",
  searchHint: "Start with a place, a category, or a city.",
  categoryTitle: "Everyday places. Extraordinary finds.",
  categoryText: "From your morning routine to your late-night essentials.",
  howTitle: "Out the door, in three steps.",
  howText: "A clear path from looking for a place to getting there.",
  stepTitles: [
    "Start where you are",
    "Find your kind of place",
    "Make your way there",
  ],
  benefitTitles: [
    "Your time matters.",
    "A clearer picture.",
    "Your next stop, sorted.",
  ],
  benefitText: [
    "Filter by open now or 24/7 and spend less time checking doors.",
    "See reported hours and verification details before you head out.",
    "Compare nearby places, save a favourite, and get directions in one place.",
  ],
  localTitle: "Your neighbourhood, at a glance.",
  localText:
    "Start in Qarshi, choose another city, or share your location. Explore real listings as they become available.",
  businessTitle: "Your business. Their next favourite.",
  businessText:
    "Let your neighbours know where you are and when you're open. Add your business and keep your details up to date.",
  faqTitle: "A few things worth knowing.",
  faqText: "A little clarity before you head out.",
  faq: [
    [
      "How do you know a place is open?",
      "Opening status is calculated from the business's reported schedule and timezone. Hours can change, so check the verification details and call ahead when it matters.",
    ],
    [
      "Do I need to share my location?",
      "No. Choose a city, search an address or select a point on the map. Your location is requested only when you choose Use my location.",
    ],
    [
      "Can I save places for later?",
      "Yes. Create an account to save favourites and find them again from your profile.",
    ],
    [
      "How can I add my business?",
      "Create an account and submit your business details. We review the listing and ownership request before it is published.",
    ],
    [
      "What if the opening hours are wrong?",
      "Use Report hours on the place's page. Our team can then review the details and correct the listing.",
    ],
  ],
  closingTitle: "There's more around you.",
  closingText:
    "A good place is closer than you think. Find your next stop with Open24.",
  footerText: "Local places. Open possibilities.",
  discover: "Discover",
  company: "Open24",
  account: "Your account",
  allPlaces: "All places",
  faqLabel: "Questions & answers",
  illustrated: "Neighbourhood inspiration",
  radiusTitle: "Make nearby your own.",
  radiusText:
    "A quick stop or a little further afield? Choose your search radius and explore places around Qarshi.",
  radiusResult: "Your search radius",
  radiusAction: "Explore this area",
};

export const redesignCopy: Record<Locale, typeof en> = {
  en,
  uz: {
    heroFirst: "Joy toping.",
    heroSecond: "Vaqt tejang.",
    heroIntro:
      "Bir finjon qahva, tungi dorixona yoki kundalik ehtiyojlar. Atrofingizdagi joylarni toping va qachon borishni biling.",
    start: "Qidirishni boshlash",
    menu: "Menyu",
    help: "Yordam",
    close: "Yopish",
    local: "Hamma narsa sizga yaqinroq.",
    starting: "Mahallangizni kashf eting",
    intro: "Yaxshi joylar. Kamroq qidiruv. Ko‘proq hayot.",
    introText:
      "Open24 mahalliy joylar, ish vaqti va yo‘nalishlarni birlashtiradi. Atrofingizdagi imkoniyatlardan foydalanishning sodda yo‘li.",
    searchTitle: "Nimani qidiryapsiz?",
    searchHint: "Joy, toifa yoki shahar nomidan boshlang.",
    categoryTitle: "Kundalik joylar. Yangi kashfiyotlar.",
    categoryText: "Tonggi odatlaringizdan tungi ehtiyojlaringizgacha.",
    howTitle: "Uch qadamda yo‘lga chiqing.",
    howText: "Joy qidirishdan unga yetib borishgacha aniq yo‘l.",
    stepTitles: [
      "Joylashuvdan boshlang",
      "Kerakli joyni toping",
      "Yo‘lga chiqing",
    ],
    benefitTitles: [
      "Vaqtingiz qadrli.",
      "Aniqroq ma’lumot.",
      "Keyingi manzil tayyor.",
    ],
    benefitText: [
      "Hozir ochiq yoki 24/7 filtrini tanlang va eshiklarni tekshirishga kamroq vaqt sarflang.",
      "Yo‘lga chiqishdan oldin ish vaqti va tekshiruv ma’lumotlarini ko‘ring.",
      "Yaqin joylarni solishtiring, sevimlilarga saqlang va yo‘nalishni oling.",
    ],
    localTitle: "Mahallangiz bir qarashda.",
    localText:
      "Qarshidan boshlang, boshqa shaharni tanlang yoki joylashuvingizni ulashing. Mavjud haqiqiy joylarni ko‘rib chiqing.",
    businessTitle: "Biznesingiz. Ularning yangi sevimli joyi.",
    businessText:
      "Qo‘shnilaringizga qayerda ekaningiz va qachon ochiqligingizni bildiring. Biznesingizni qo‘shing va ma’lumotlarini yangilab boring.",
    faqTitle: "Bilishga arziydigan savollar.",
    faqText: "Yo‘lga chiqishdan oldin bir oz aniqlik.",
    faq: [
      [
        "Joy ochiqligi qanday aniqlanadi?",
        "Holat biznes taqdim etgan jadval va vaqt mintaqasi asosida hisoblanadi. Ish vaqti o‘zgarishi mumkin, shuning uchun tekshiruv ma’lumotlarini ko‘ring va zarur bo‘lsa oldindan qo‘ng‘iroq qiling.",
      ],
      [
        "Joylashuvimni ulashishim shartmi?",
        "Yo‘q. Shaharni tanlang, manzilni qidiring yoki xaritada nuqta belgilang. Joylashuvingiz faqat o‘zingiz tanlaganingizda so‘raladi.",
      ],
      [
        "Joylarni keyinroq ko‘rish uchun saqlay olamanmi?",
        "Ha. Hisob yarating, joylarni sevimlilarga saqlang va profilingizdan qayta toping.",
      ],
      [
        "Biznesimni qanday qo‘shaman?",
        "Hisob yarating va biznes ma’lumotlarini yuboring. E’lon va egalik so‘rovi chop etilishidan oldin tekshiriladi.",
      ],
      [
        "Ish vaqti noto‘g‘ri bo‘lsa-chi?",
        "Joy sahifasidagi ish vaqti haqida xabar berish tugmasidan foydalaning. Jamoamiz ma’lumotlarni tekshirib, tuzatishi mumkin.",
      ],
    ],
    closingTitle: "Atrofingizda imkoniyatlar ko‘p.",
    closingText:
      "Yaxshi joy siz o‘ylagandan yaqinroq. Keyingi manzilingizni Open24 bilan toping.",
    footerText: "Yaqin joylar. Ochiq imkoniyatlar.",
    discover: "Kashf eting",
    company: "Open24",
    account: "Hisobingiz",
    allPlaces: "Barcha joylar",
    faqLabel: "Savol va javoblar",
    illustrated: "Mahalla manzarasi",
    radiusTitle: "Yaqinlik chegarasini tanlang.",
    radiusText:
      "Yaqin manzilmi yoki biroz uzoqroqmi? Qidiruv radiusini tanlang va Qarshi atrofidagi joylarni ko‘ring.",
    radiusResult: "Qidiruv radiusi",
    radiusAction: "Shu hududni ko‘rish",
  },
  ru: {
    heroFirst: "Находите места.",
    heroSecond: "Берегите время.",
    heroIntro:
      "Чашка кофе, ночная аптека или повседневные покупки. Находите места рядом и узнавайте, когда зайти.",
    start: "Начать поиск",
    menu: "Меню",
    help: "Помощь",
    close: "Закрыть",
    local: "Всё становится немного ближе.",
    starting: "Откройте свой район",
    intro: "Хорошие места. Меньше поисков. Больше жизни.",
    introText:
      "Open24 объединяет местные заведения, часы работы и маршруты. Простой способ узнать, что есть рядом.",
    searchTitle: "Что вы ищете?",
    searchHint: "Начните с места, категории или города.",
    categoryTitle: "Знакомые места. Новые открытия.",
    categoryText: "От утренних привычек до ночных покупок.",
    howTitle: "Всего три шага — и вы в пути.",
    howText: "Понятный путь от поиска места до прибытия.",
    stepTitles: [
      "Укажите, где вы",
      "Найдите нужное место",
      "Отправляйтесь в путь",
    ],
    benefitTitles: [
      "Ваше время важно.",
      "Больше ясности.",
      "Следующая остановка найдена.",
    ],
    benefitText: [
      "Выберите «Открыто сейчас» или «24/7», чтобы реже встречать закрытые двери.",
      "Посмотрите часы работы и данные проверки, прежде чем идти.",
      "Сравнивайте места, сохраняйте избранное и стройте маршруты в одном месте.",
    ],
    localTitle: "Ваш район с первого взгляда.",
    localText:
      "Начните с Карши, выберите другой город или поделитесь местоположением. Изучайте реальные опубликованные места.",
    businessTitle: "Ваш бизнес. Их новое любимое место.",
    businessText:
      "Расскажите соседям, где вы находитесь и когда открыты. Добавьте свой бизнес и поддерживайте данные в актуальном состоянии.",
    faqTitle: "Несколько важных вопросов.",
    faqText: "Немного ясности перед выходом.",
    faq: [
      [
        "Как определяется, открыто ли место?",
        "Статус рассчитывается по заявленному расписанию и часовому поясу. Часы могут меняться: проверьте сведения о проверке и при необходимости позвоните заранее.",
      ],
      [
        "Обязательно делиться местоположением?",
        "Нет. Выберите город, найдите адрес или укажите точку на карте. Доступ к геолокации запрашивается только по вашему выбору.",
      ],
      [
        "Можно сохранять места?",
        "Да. Создайте аккаунт, сохраняйте места в избранное и возвращайтесь к ним из профиля.",
      ],
      [
        "Как добавить свой бизнес?",
        "Создайте аккаунт и отправьте сведения о бизнесе. Мы проверим заявку и право управления перед публикацией.",
      ],
      [
        "Что делать, если часы работы неверны?",
        "Сообщите об ошибке на странице места. Наша команда сможет проверить и исправить данные.",
      ],
    ],
    closingTitle: "Вокруг вас столько интересного.",
    closingText:
      "Хорошее место ближе, чем кажется. Найдите следующую остановку с Open24.",
    footerText: "Места рядом. Открытые возможности.",
    discover: "Открывайте",
    company: "Open24",
    account: "Ваш аккаунт",
    allPlaces: "Все места",
    faqLabel: "Вопросы и ответы",
    illustrated: "Атмосфера района",
    radiusTitle: "Выберите свой радиус.",
    radiusText:
      "Совсем рядом или чуть дальше? Выберите радиус поиска и изучайте места вокруг Карши.",
    radiusResult: "Радиус поиска",
    radiusAction: "Изучить район",
  },
};
