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
const FORMSPREE_ENDPOINT = 'https://formspree.io/f/xovkgago';

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).toLowerCase());
}

function showStatus(text, type = 'info') {
    if (!statusEl) return;
    statusEl.textContent = text;
    statusEl.style.color = 
        type === 'success' ? '#22c55e' : type === 'error' ? '#f87171' : '#94a3b8';
}

form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!form) return;

    const formData = new FormData(form);
    const name = (formData.get('name') || '').toString().trim();
    const email = (formData.get('email') || '').toString().trim();
    const message = (formData.get('message') || '').toString().trim();

    // Easy validation
    if (!name) {
        showStatus('Укажите имя', 'error');
        return;
    }
    if (!isValidEmail(email)) {
        showStatus('Некорректный email', 'error');
        return;
    }

    showStatus('Отправка...', 'info');

    try {
        const res = await fetch(FORMSPREE_ENDPOINT, {
            method: 'POST',
            headers: { Accept: 'application/json' },
            body: new FormData(form)
        });

        if (!res.ok) throw new Error('Network error');

        showStatus('Заявка отправлена! Я скоро с вами свяжусь.', 'success');
        form.reset();
        setTimeout(closeModal, 1000);
    } catch (err) {
        console.error(err);
        showStatus('Не удалось отправить. Попробуйте позже.', 'error');
    }

     try {
        gtag && gtag('event', 'lead_submit', {
            method: 'modal_form' });
    } catch(e) {}


});