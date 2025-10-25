// Short selector
const $ = (sel, ctx = document) => ctx.querySelector(sel);

// Burger menu
const burger = $('.burger');
const nav = $('#primary-nav');

if (burger && nav) {
    burger.addEventListener('click', (e) => {
        e.stopPropagation();
        const isOpen = nav.classList.toggle('open');
        burger.setAttribute('aria-expanded', String(isOpen));
    });

    // Close burger menu on click
    nav.addEventListener('click', (e) => {
        if (e.target.tagName === 'A' && nav.classList.contains('open')) {
            nav.classList.remove('open');
            burger.setAttribute('aria-expanded', 'false');
        }
    });

    // Close burger menu on click not on menu
    document.addEventListener('click', (e) => {
        const inside = nav.contains(e.target) || burger.contains(e.target);
         nav.classList.remove('open');
            burger.setAttribute('aria-expanded', 'false');
    });
}

// Modal

const modal = $('.modal');
const openModalBtn = $('.open-modal');

function openModal() {
  if (!modal) return;
  modal.hidden = false;
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  if (!modal) return;
  modal.hidden = true;
  document.body.style.overflow = '';
}

openModalBtn?.addEventListener('click', openModal);
modal?.addEventListener('click', (e) => {
  if (e.target.matches('[data-close]')) closeModal();
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && modal && !modal.hidden) closeModal();
});

// Form: validation and sending
const form = $('#lead-form');
const statusEl = $('.form-status');
// const FORMSPREE_ENDPOINT = 'https://formspree.io/f/xovkgago';
const MAKE_WEBHOOK = 'https://hook.eu2.make.com/k45xljhphabkfm96fo670btca0o88jmw';

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).toLowerCase());
}

function t(key) {
    const lang = localStorage.getItem(LANG_KEY) || document.documentElement.lang || 'ru';
    const dict = i18n[lang] || i18n.ru;
    return dict[key] || key;
}

let lastStatusKey = '';

function showStatus(key, type = 'info') {
    if (!statusEl) return;
    lastStatusKey = key;
    statusEl.textContent = t(key);
    statusEl.style.color = 
        type === 'success' ? '#22c55e' : type === 'error' ? '#f87171' : '#94a3b8';
}

let isSubmitting = false;

// Sending by Enter

fomr?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        form.requestSubmit?.(); 
    }
})

form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!form) return;
    if (isSubmitting) return;
    isSubmitting = true;

   const nameInput = form.querySelector('input[name="name"]');
   const emailInput = form.querySelector('input[name="email"]');
   const messageInput = form.querySelector('textarea[name="message"]');

   const name = (nameInput?.value || '').trim();
   const email = (emailInput?.value || '').trim();
   const message = (messageInput?.value || '').trim();

   if (!name) { 
    showStatus('status.name_required', 'error');
    isSubmitting = false;
    return;
   }

   if (!isValidEmail(email)) {
    showStatus('status.email_invalid', 'error');
    isSubmitting = false;
    return;
   }

   showStatus('status.sending', 'info');

   const params = new URLSearchParams(location.search);
   const utmKeys = ['utm_source','utm_medium','utm_campaign','utm_term','utm_content'];
   const hasUtm = utmKeys.some(k => params.get(k));
   const currentLang = localStorage.getItem('site_lang') || document.documentElement.lang || 'ru';
   const isMobile = /Mobi|Android/i.test(navigator.userAgent);

   const computedSource = hasUtm
        ? `utm?${utmKeys.map(k => `${k}=${params.get(k) || ''}`).join('&')}`
        : `${location.hostname}${location.pathname}|${currentLang}|${isMobile ? 'mobile' : 'desktop'}`;

    const payload = { name, email, message, source: computedSource };

    // Diagnostic on client
    console.debug('payload ->', payload); 
    if (!name || !email) {
        console.warn('Stop: empty fields just before fetch', payload);
        showStatus('status.error', 'error');
        isSubmitting = false;
        return;
    }

    try {
        const res = await fetch(MAKE_WEBHOOK, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error(`Network error ${res.status}`);

        showStatus('status.success', 'success');
        form.reset();
        setTimeout(closeModal, 1000);
    } catch (err) {
        console.error(err);
        showStatus('status.error', 'error');
    } finally {
        isSubmitting = false;
    }

    try { 
        gtag && gtag('event', 'lead_submit', {
            method: 'modal_form' });
    } catch(e) {}
});

// i18n (RU/EN/LV)
const i18n = {
    ru: {
        title: 'Простой лендинг',
        logo: 'Мой сайт',
        'nav.features': 'Преимущества',
        'nav.contact': 'Контакты',
        'hero.title': 'Headline',
        'hero.subtitle': 'Короткое описание ценности',
        'hero.cta': 'Оставить заявку',
        'features.title': 'Преимущества',
        'features.item1': 'Быстрый деплой',
        'features.item2': 'Автоматизация заявок',
        'features.item3': 'Подключенная аналитика',
        'features.item1_desc': 'Vercel + чистый HTML/CSS/JS. Запуск за 1 день.',
        'features.item2_desc': 'Make → Google Sheets/Email/Telegram без сервера.',
        'features.item3_desc': 'GA4 события: посещения, lead_submit.',
        'contact.title': 'Контакты',
        'contact.text': 'Напишите мне - отвечаю в течении дня.',
        'form.title': 'Оставить заявку',
        'form.name': 'Имя',
        'form.email': 'Email',
        'form.message': 'Сообщение',
        'form.name_ph': 'Имя',
        'form.email_ph': 'you@example.com',
        'form.message_ph': 'Коротко опишите задачу',
        'form.submit': 'Отправить',
        'form.close': 'Закрыть',
        'status.sending': 'Отправка...',
        'status.success': 'Заявка отправлена! Я скоро с вами свяжусь.',
        'status.error': 'Не удалось отправить. Попробуйте позже.',
        'status.name_required': 'Укажите имя',
        'status.email_invalid': 'Некорректный email',
    },
    en: {
        title: 'Simple landing',
        logo: 'My Site',
        'nav.features': 'Features',
        'nav.contact': 'Contact',
        'hero.title': 'Headline',
        'hero.subtitle': 'A short value proposition',
        'hero.cta': 'Get in touch',
        'features.title': 'Features',
        'features.item1': 'Fast deploy',
        'features.item2': 'Lead automation',
        'features.item3': 'Analytics connected',
        'features.item1_desc': 'Vercel + plain HTML/CSS/JS. Launch in 1 day.',
        'features.item2_desc': 'Make → Google Sheets/Email/Telegram, no server',
        'features.item3_desc': 'GA4 events: visit, lead_submit.',
        'contact.title': 'Contact',
        'contact.text': 'Write me - I reply within a day.',
        'form.title': 'Leave a request',
        'form.name': 'Name',
        'form.email': 'Email',
        'form.message': 'Message',
        'form.name_ph': 'Name',
        'form.email_ph': 'you@example.com',
        'form.message_ph': 'Briefly describe your task',
        'form.submit': 'Send',
        'form.close': 'Close',
        'status.sending': 'Sending...',
        'status.success': 'Request sent! I will contact you soon.',
        'status.error': 'Failed to send. Please try again later.',
        'status.name_required': 'Please enter your name',
        'status.email_invalid': 'Invalid email address',
    },
    lv: {
        title: 'Vienkārša lapa',
        logo: 'Mana lapa',
        'nav.features': 'Priekšrocības',
        'nav.contact': 'Kontakti',
        'hero.title': 'Headline',
        'hero.subtitle': 'Īss vērtības piedāvājums',
        'hero.cta': 'Sazināties',
        'features.title': 'Priekšrocības',
        'features.item1': 'Ātra izvietošana',
        'features.item1_desc': 'Vercel + tīrs HTML/CSS/JS. Palaišana 1 dienā.',
        'features.item2_desc': 'Make → Google Sheets/E-pasts/Telegram, bez servera',
        'features.item3_desc': 'GA4 notikumi: apmeklējums, lead submit.',
        'features.item2': 'Pieteikumu automatizācija',
        'features.item3': 'Pievienota analītika',
        'contact.title': 'Kontakti',
        'contact.text': 'Rakstiet man - atbildu dienas laikā.',
        'form.title': 'Atstājiet pieteikumu',
        'form.name': 'Vārds',
        'form.email': 'E-pasts',
        'form.message': 'Ziņa',
        'form.name_ph': 'Jūsu vārds',
        'form.email_ph': 'you@example.com',
        'form.message_ph': 'Īsi aprakstiet uzdevumu',
        'form.submit': 'Nosūtīt',
        'form.close': 'Aizvērt',
        'status.sending': 'Sūtīšana...',
        'status.success': 'Pieteikums nosūtīts! Es drīzumā sazināšos.',
        'status.error': 'Neizdevās nosūtīt. Lūdzu, mēģiniet vēlreiz.',
        'status.name_required': 'Ievadiet vārdu',
        'status.email_invalid': 'Nederīga e-pasta adrese',
    },
};

const LANG_KEY = 'site_lang';
const langBtn = document.getElementById('lang-toggle');

function applyLang(lang) {
    const dict = i18n[lang] || i18n.ru;
    document.documentElement.lang = lang;

    // Texts by data-i18n
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (dict[key]) el.textContent = dict[key];
    });

    // Placeholders forms
    const nameInput = document.querySelector('input[name="name"]');
    const emailInput = document.querySelector('input[name="email"]');
    const messageInput = document.querySelector('textarea[name="message"]');
    if (nameInput && dict['form.name_ph']) nameInput.placeholder = dict['form.name_ph'];
    if (emailInput && dict['form.email_ph']) emailInput.placeholder = dict['form.email_ph'];
    if (messageInput && dict['form.message_ph']) messageInput.placeholder = dict['form.message_ph'];

    // Write on button - next language
    if (langBtn) langBtn.textContent = lang === 'ru' ? 'EN' : lang === 'en' ? 'LV' : 'RU';
    localStorage.setItem(LANG_KEY, lang);

    if (statusEl && lastStatusKey) statusEl.textContent = t(lastStatusKey);
}

langBtn?.addEventListener('click', () => {
    const current = localStorage.getItem(LANG_KEY) || 'ru';
    const next = current === 'ru' ? 'en' : current === 'en' ? 'lv' : 'ru';
    applyLang(next);
});

// first loading - browser language
const initial = localStorage.getItem(LANG_KEY) || (navigator.language || 'ru').slice(0,2);
applyLang(['ru','en','lv'].includes(initial) ? initial : 'ru');