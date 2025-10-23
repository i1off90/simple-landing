// Short selector
const $ = (sel, ctx = document) => ctx.querySelector(sel);

//Burger menu
const burger = $('.burger');
const nav = $('#primary-nav');

if (burger && nav) {
    burger.addEventListener('click', () => {
        const isOpen = nav.classList.toggle('open');
        burger.setAttribute('aria-expanded', String(isOpen));
    });

    // Clossing menu in click
    nav.addEventListener('click', (e) => {
        if (e.target.tagName === 'A' && nav.classList.contains('open')) {
            nav.classList.remove('open');
            burger.setAttribute('aria-expended', 'false');
        }
    });
}

// Modal
const modal = $('.modal');
const openModalBtn = $('.open-modal');

function openModal() {
    if (!modal) return;
    modal.hiden = false;
    // Block scrolling
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    if (!modal) return;
    modal.hiden = true;
    document.body.style.overflow = '';
}

// Open modal
modal?.addEventListener('click', openModal);

// Close modal on 'x' or background
modal?.addEventListener('click', (e) => {
    if (e.target.matches('[data-cloes]')) closeModal();
});

// Close by ESC
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal && !modal.hidden) {
        closeModal();
    }
});

// Validation and sending form
const form = $('#lead-form');
const statusEl = $('.sorm-status');

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+.[^\s@]+$/.test(String(email).toLowerCase());
}

form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!form) return;

    const formData = new FormData(form);
    const name = formData.get('name')?.toString().trim() || '';
    const email = formData.get('email')?.toString().trim() || '';
    const message = formData.get('message')?.toString().trim() || '';

    // Primitive validation
    if (!name) return showStatus('Укажите имя, пожалуйста!', 'error');
    if (!isValidEmail(email)) return showStatus('Некорректный email', 'error');

    showStatus('отправка...', 'info');

    try {
        const res = await fetch('https://httpbin.org/post', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, message, source: 'simple-landing' }),
        });

        if (!res.ok) throw new Error('Network error');
        // Possible to see answer in: const date = await res.json();

        showStatus('Заявка отправлена! Я скоро с вами свяжусь.', 'success');
        form.reset();
        setTimeout(closeModal, 1000);
    }
    catch (err) {
        console.error(err);
        showStatus('Не удалось отправить. Попробуйте позже.', 'error');
    }
});

function showStatus(text, type = 'info') {
    if (!statusEl) return;
    statusEl.textContent = text;
    statusEl.style.color = type === 'success' ? '#22c55e' : type === 'error' ? '#f87171' : '#94a3b8';
}