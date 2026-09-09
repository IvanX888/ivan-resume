/* =========================================================
 * Иван Серко — портфолио
 * Модульная структура, без глобальных переменных.
 * ========================================================= */
'use strict';

/* ---------- Конфигурация ---------- */

const CONFIG = {
    particles: {
        count: 55,
        maxSpeed: 0.25,
        maxSize: 1.5,
        minSize: 0.5,
        linkDistance: 140,
        mouseRadius: 180,
        mouseForce: 0.008,
        fillColor: 'rgba(201, 168, 76, 0.35)',
        linkColor: 'rgba(90, 122, 150, ', // альфа добавляется при рисовании
    },
    scenarioSwitchDelay: 220,
    fadeInThreshold: 0.1,
};

/* Данные сценариев — единственный источник истины.
 * При изменении текста меняется только здесь, разметка собирается в JS. */
const SCENARIOS = [
    {
        emoji: '⚙️',
        title: 'Промышленное производство — типичные задачи и мои решения',
        items: [
            '<strong>Автоматизировать учёт смен и техники</strong> — создам систему, где мастер в пару кликов формирует наряды, а программа считает часы и трудозатраты автоматически',
            '<strong>Провести тендер или закупку</strong> — подготовлю документацию, найду поставщиков, сопровожу от заявки до контракта',
            '<strong>Обновить или наладить оборудование</strong> — разберусь в проблеме, найду решение, внедрю: от диагностики до запуска',
            '<strong>Крутить гайки и варить</strong> — знаю производство изнутри: сварка, монтаж, ремонт. Разбираюсь в технике не по бумажкам, а по делу',
            '<strong>Написать ПО под ваш процесс</strong> — веб-приложение, PWA или Telegram-бот для конкретной задачи вашего цеха',
            '<strong>Продавать и продвигать продукцию</strong> — сайт, реклама, соцсети, прямые продажи: выстрою канал, который работает',
            '<strong>Новаторство и оптимизация</strong> — не боюсь внедрять новое: найду, где процесс тормозит, и предложу решение, которое реально работает',
            '<strong>Юридически защитить сделки</strong> — договоры, претензии, суды с контрагентами и поставщиками',
        ],
    },
    {
        emoji: '🥛',
        title: 'Продовольственное производство — где я пригожусь',
        items: [
            '<strong>Отладить умное оборудование</strong> — разберусь в ПО и железе, чтобы не вызывать дорогих мастеров каждый раз',
            '<strong>Продвигать и продавать продукцию</strong> — сайт, реклама, соцсети, прямые продажи: создам канал, который работает. Опыт менеджера по продажам и маркетолога — в одном лице',
            '<strong>Решать споры с партнёрами</strong> — международные контракты, претензии, суды — найду решение и защищу интересы',
            '<strong>Автоматизировать учёт</strong> — от сырья до готовой продукции: прозрачность и контроль в реальном времени',
            '<strong>Получить лицензии и согласования</strong> — разберу в требованиях, соберу документы, доведу до результата',
            '<strong>Новаторство</strong> — предложу, как оптимизировать процессы и сократить издержки без потери качества',
        ],
    },
    {
        emoji: '🏗️',
        title: 'Строительство — мой хлеб',
        items: [
            '<strong>Согласование проектов</strong> — работа с госорганами, экспертизой, получение разрешений',
            '<strong>Учёт на объекте</strong> — автоматизация табелей, техники, материалов: всё в одном приложении',
            '<strong>Договоры и претензии</strong> — подрядчики, заказчики, субподряд: защита интересов в суде и досудебно',
            '<strong>Закупки и тендеры</strong> — государственные закупки по Закону РБ, электронные торговые процедуры, коммерческие закупки — полный цикл',
            '<strong>Цифровизация процессов</strong> — от журнала работ до системы контроля качества',
            '<strong>Продажи и привлечение заказчиков</strong> — могу выстроить канал продаж для строительных услуг',
        ],
    },
    {
        emoji: '🏢',
        title: 'Любая компания — универсальная помощь',
        items: [
            '<strong>Создать цифровой продукт</strong> — сайт, приложение, бот, автоматизация: от идеи до запуска',
            '<strong>Настроить продажи</strong> — реклама, лендинг, воронка, прямые продажи: клиенты приходят сами',
            '<strong>Менеджер по продажам</strong> — могу лично продавать, вести переговоры, закрывать сделки и строить отношения с клиентами',
            '<strong>Юридическая защита</strong> — договоры, споры, лицензии, НПА — любая задача',
            '<strong>Автоматизация рутины</strong> — отчёты, документооборот, учёт: освобожу время сотрудников',
            '<strong>Управление проектами</strong> — запуск нового направления, внедрение, оптимизация',
            '<strong>Новаторство</strong> — найду нестандартные решения для стандартных проблем',
        ],
    },
];

/* ---------- Утилиты ---------- */

const prefersReducedMotion = () =>
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- Фоновая анимация частиц (hero) ---------- */

class ParticleField {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.mouse = { x: null, y: null };
        this.particles = [];

        this.resize = this.resize.bind(this);
        this.animate = this.animate.bind(this);

        window.addEventListener('resize', this.resize);
        this.bindPointerEvents();
        this.resize();
        this.spawn();

        if (!prefersReducedMotion()) {
            requestAnimationFrame(this.animate);
        } else {
            this.drawStatic(); // уважение к prefers-reduced-motion: статичный кадр
        }
    }

    resize() {
        const dpr = window.devicePixelRatio || 1;
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.canvas.width = this.width * dpr;
        this.canvas.height = this.height * dpr;
        this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    spawn() {
        const { count, maxSpeed, maxSize, minSize } = CONFIG.particles;
        this.particles = Array.from({ length: count }, () => ({
            x: Math.random() * this.width,
            y: Math.random() * this.height,
            vx: (Math.random() - 0.5) * maxSpeed * 2,
            vy: (Math.random() - 0.5) * maxSpeed * 2,
            size: Math.random() * (maxSize - minSize) + minSize,
        }));
    }

    bindPointerEvents() {
        const setMouse = (x, y) => { this.mouse.x = x; this.mouse.y = y; };
        const clearMouse = () => { this.mouse.x = null; this.mouse.y = null; };

        this.canvas.addEventListener('mousemove', (e) => setMouse(e.clientX, e.clientY));
        this.canvas.addEventListener('mouseleave', clearMouse);
        this.canvas.addEventListener('touchmove', (e) => setMouse(e.touches[0].clientX, e.touches[0].clientY), { passive: true });
        this.canvas.addEventListener('touchend', clearMouse);
    }

    updateParticle(p) {
        const { mouseRadius, mouseForce } = CONFIG.particles;
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0 || p.x > this.width) p.vx *= -1;
        if (p.y < 0 || p.y > this.height) p.vy *= -1;

        if (this.mouse.x !== null) {
            const dx = this.mouse.x - p.x;
            const dy = this.mouse.y - p.y;
            const dist = Math.hypot(dx, dy);
            if (dist < mouseRadius && dist > 0) {
                p.x -= dx * mouseForce;
                p.y -= dy * mouseForce;
            }
        }
    }

    drawParticle(p) {
        const { ctx } = this;
        ctx.fillStyle = CONFIG.particles.fillColor;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
    }

    drawLinks() {
        const { ctx } = this;
        const { linkDistance, linkColor } = CONFIG.particles;

        for (let i = 0; i < this.particles.length; i++) {
            for (let j = i + 1; j < this.particles.length; j++) {
                const a = this.particles[i];
                const b = this.particles[j];
                const dist = Math.hypot(a.x - b.x, a.y - b.y);
                if (dist < linkDistance) {
                    ctx.strokeStyle = `${linkColor}${0.12 * (1 - dist / linkDistance)})`;
                    ctx.lineWidth = 0.8;
                    ctx.beginPath();
                    ctx.moveTo(a.x, a.y);
                    ctx.lineTo(b.x, b.y);
                    ctx.stroke();
                }
            }
        }
    }

    drawStatic() {
        this.ctx.clearRect(0, 0, this.width, this.height);
        this.particles.forEach((p) => this.drawParticle(p));
        this.drawLinks();
    }

    animate() {
        this.ctx.clearRect(0, 0, this.width, this.height);
        this.particles.forEach((p) => { this.updateParticle(p); this.drawParticle(p); });
        this.drawLinks();
        requestAnimationFrame(this.animate);
    }
}

/* ---------- Переключение сценариев ---------- */

class ScenarioSwitcher {
    constructor() {
        this.tabs = Array.from(document.querySelectorAll('.scenario-tab'));
        this.card = document.getElementById('scenarioCard');
        this.cardTitle = this.card.querySelector('h3');
        this.cardList = this.card.querySelector('.scenario-list');

        this.tabs.forEach((tab, index) => {
            tab.addEventListener('click', () => this.show(index));
        });
    }

    show(index) {
        this.tabs.forEach((tab, i) => tab.classList.toggle('active', i === index));

        const scenario = SCENARIOS[index];
        this.card.classList.add('is-switching');

        setTimeout(() => {
            this.cardTitle.innerHTML = `<span class="emoji">${scenario.emoji}</span> ${scenario.title}`;
            this.cardList.innerHTML = scenario.items
                .map((item) => `<li>${item}</li>`)
                .join('');
            this.card.classList.remove('is-switching');
        }, CONFIG.scenarioSwitchDelay);
    }
}

/* ---------- Появление блоков при скролле ---------- */

function initFadeIn() {
    const elements = document.querySelectorAll('.fade-in');
    if (prefersReducedMotion() || !('IntersectionObserver' in window)) {
        elements.forEach((el) => el.classList.add('visible'));
        return;
    }
    const observer = new IntersectionObserver(
        (entries) => entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target); // наблюдаем только до первого показа
            }
        }),
        { threshold: CONFIG.fadeInThreshold }
    );
    elements.forEach((el) => observer.observe(el));
}

/* ---------- Плавный скролл к якорям ---------- */

function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach((link) => {
        link.addEventListener('click', (event) => {
            const target = document.querySelector(link.getAttribute('href'));
            if (!target) return;
            event.preventDefault();
            target.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
        });
    });
}

/* ---------- Мобильное меню ---------- */

function initMobileMenu() {
    const button = document.querySelector('.mobile-menu-btn');
    const menu = document.getElementById('mobileMenu');
    if (!button || !menu) return;

    button.addEventListener('click', () => {
        const isOpen = menu.classList.toggle('open');
        button.textContent = isOpen ? '✕' : '☰';
        button.setAttribute('aria-expanded', String(isOpen));
    });

    // Закрываем меню после перехода по ссылке
    menu.addEventListener('click', (event) => {
        if (event.target.closest('a')) {
            menu.classList.remove('open');
            button.textContent = '☰';
            button.setAttribute('aria-expanded', 'false');
        }
    });
}

/* ---------- Инициализация ---------- */

document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.querySelector('.hero-canvas');
    if (canvas) new ParticleField(canvas);

    new ScenarioSwitcher();
    initFadeIn();
    initSmoothScroll();
    initMobileMenu();
});
