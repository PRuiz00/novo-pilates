/**
 * Eixo Pilates — Interações, Animações GSAP e Experiência do Usuário
 * Mantém 100% de fidelidade visual, com suporte a animações fluidas e acessibilidade.
 */

// ==========================================================================
// Utilitários DOM
// ==========================================================================
const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

// ==========================================================================
// Tela de Carregamento (Loader)
// ==========================================================================
(function initLoader() {
  const loader  = document.getElementById('loader');
  const bar     = document.getElementById('loaderBar');
  const percent = document.getElementById('loaderPercent');

  if (!loader || !bar || !percent) return;

  // Bloqueia scroll enquanto o loader está visível
  document.body.style.overflow = 'hidden';

  let current  = 0;
  const target = 100;

  // Duração total realista: 1.8 s até 100 %
  // Usamos uma curva de easing para acelerar no início e desacelerar no final
  const totalMs = 1800;
  const startTime = performance.now();

  function easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  function step(now) {
    const elapsed  = now - startTime;
    const progress = Math.min(elapsed / totalMs, 1);
    const eased    = easeInOutCubic(progress);
    current        = Math.round(eased * target);

    bar.style.width    = current + '%';
    percent.textContent = current + '%';

    if (progress < 1) {
      requestAnimationFrame(step);
    } else {
      // Chega ao 100% — pequena pausa antes de sumir
      bar.style.width    = '100%';
      percent.textContent = '100%';

      setTimeout(() => {
        loader.classList.add('is-done');
        document.body.style.overflow = '';

        // Remove do DOM após a transição de saída (0.7s + 0.2s delay = 0.9s)
        loader.addEventListener('animationend', () => {
          loader.classList.add('is-hidden');
          loader.setAttribute('aria-hidden', 'true');
        }, { once: true });
      }, 320);
    }
  }

  requestAnimationFrame(step);
})();

// ==========================================================================
// Redução de Movimento e Preferências de Acessibilidade
// ==========================================================================
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const isMotionAllowed = () => !reducedMotion.matches;

// ==========================================================================
// Ajuste de Escala dos Vetores e Ícones SVG
// ==========================================================================
function scaleAssets() {
  const scale = window.innerWidth >= 1100 ? Math.min(1, window.innerWidth / 1920) : 1;
  document.documentElement.style.setProperty('--asset-scale', scale);
  document.documentElement.style.setProperty('--icon-scale', scale);

  $$('.icon img').forEach((image) => {
    if (window.innerWidth >= 1100) {
      image.style.transform = `scale(${scale})`;
    } else {
      image.style.removeProperty('transform');
    }
  });
}

scaleAssets();
window.addEventListener('resize', scaleAssets, { passive: true });

// ==========================================================================
// Controle do Vídeo do Hero
// ==========================================================================
const heroVideo = $('.hero-video');

function syncMotion() {
  if (!heroVideo) return;
  if (reducedMotion.matches || document.hidden) {
    heroVideo.pause();
  } else {
    heroVideo.play().catch(() => {});
  }
}

reducedMotion.addEventListener('change', syncMotion);
document.addEventListener('visibilitychange', syncMotion);
syncMotion();

// ==========================================================================
// Contagem Regressiva da Oferta
// ==========================================================================
let remaining = 2 * 86400 + 16 * 3600 + 24 * 60 + 48;
const countdownEnd = Date.now() + remaining * 1000;

function updateCountdown() {
  remaining = Math.max(0, Math.ceil((countdownEnd - Date.now()) / 1000));
  const units = {
    days: Math.floor(remaining / 86400),
    hours: Math.floor((remaining % 86400) / 3600),
    minutes: Math.floor((remaining % 3600) / 60),
    seconds: remaining % 60,
  };

  Object.entries(units).forEach(([key, value]) => {
    const el = $(`[data-count="${key}"]`);
    if (el) {
      el.textContent = String(value).padStart(2, '0');
    }
  });
}

setInterval(updateCountdown, 1000);
updateCountdown();

// ==========================================================================
// Menu Mobile e Navegação
// ==========================================================================
const menuToggle = $('.mobile-menu-toggle');
const nav = $('.nav');
const header = $('.header');

if (menuToggle && nav) {
  menuToggle.addEventListener('click', () => {
    const expanded = menuToggle.getAttribute('aria-expanded') !== 'true';
    menuToggle.setAttribute('aria-expanded', String(expanded));
    menuToggle.setAttribute('aria-label', expanded ? 'Fechar menu' : 'Abrir menu');
    nav.classList.toggle('is-open', expanded);
  });

  $$('.nav a').forEach((link) => {
    link.addEventListener('click', () => {
      nav.classList.remove('is-open');
      menuToggle.setAttribute('aria-expanded', 'false');
      menuToggle.setAttribute('aria-label', 'Abrir menu');
    });
  });
}

// ==========================================================================
// Header Fixo com Efeito de Rolagem Suave
// ==========================================================================
function syncHeaderOnScroll() {
  if (!header) return;
  const isScrolled = window.scrollY > 80;
  header.classList.toggle('is-scrolled', isScrolled);
}

window.addEventListener('scroll', syncHeaderOnScroll, { passive: true });
syncHeaderOnScroll();

// ==========================================================================
// Observador de Seções Ativas na Navegação
// ==========================================================================
const navObserver = new IntersectionObserver(
  (entries) => {
    entries
      .filter((entry) => entry.isIntersecting)
      .forEach((entry) => {
        $$('.nav a').forEach((link) => {
          link.classList.toggle('active', link.hash === `#${entry.target.id}`);
        });
      });
  },
  { rootMargin: '-15% 0px -60% 0px', threshold: 0 }
);

$$('#inicio, #espaco, #aulas, #comentarios, #redes-sociais').forEach((section) => {
  navObserver.observe(section);
});

// ==========================================================================
// FAQ com Animação Suave GSAP
// ==========================================================================
const faqItems = $$('.faq-item');

faqItems.forEach((item) => {
  const summary = $('summary', item);
  const answer = $('.faq-answer', item);

  if (!summary || !answer) return;

  summary.addEventListener('click', (event) => {
    event.preventDefault();

    const isOpen = item.open;

    // Fecha os outros itens com transição suave
    faqItems.forEach((other) => {
      if (other !== item && other.open) {
        if (typeof gsap !== 'undefined' && isMotionAllowed()) {
          const otherAnswer = $('.faq-answer', other);
          gsap.to(otherAnswer, {
            height: 0,
            opacity: 0,
            duration: 0.28,
            ease: 'power2.inOut',
            onComplete: () => {
              other.open = false;
              gsap.set(otherAnswer, { clearProps: 'all' });
            },
          });
        } else {
          other.open = false;
        }
      }
    });

    if (isOpen) {
      // Fechando item atual
      if (typeof gsap !== 'undefined' && isMotionAllowed()) {
        gsap.to(answer, {
          height: 0,
          opacity: 0,
          duration: 0.28,
          ease: 'power2.inOut',
          onComplete: () => {
            item.open = false;
            gsap.set(answer, { clearProps: 'all' });
          },
        });
      } else {
        item.open = false;
      }
    } else {
      // Abrindo item atual
      item.open = true;
      if (typeof gsap !== 'undefined' && isMotionAllowed()) {
        const fullHeight = answer.scrollHeight;
        gsap.fromTo(
          answer,
          { height: 0, opacity: 0 },
          {
            height: fullHeight,
            opacity: 1,
            duration: 0.35,
            ease: 'power2.out',
            onComplete: () => {
              gsap.set(answer, { clearProps: 'height' });
            },
          }
        );
      }
    }
  });
});

// ==========================================================================
// Diálogos e Modais
// ==========================================================================
function openDialog(dialog) {
  if (!dialog) return;
  dialog.showModal();
  document.body.style.overflow = 'hidden';

  if (typeof gsap !== 'undefined' && isMotionAllowed()) {
    gsap.fromTo(
      dialog,
      { opacity: 0, scale: 0.95, y: 15 },
      { opacity: 1, scale: 1, y: 0, duration: 0.3, ease: 'power2.out' }
    );
  }
}

$$('dialog').forEach((dialog) => {
  $$('[data-close]', dialog).forEach((button) => {
    button.addEventListener('click', () => dialog.close());
  });

  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) {
      const bounds = dialog.getBoundingClientRect();
      if (
        event.clientX < bounds.left ||
        event.clientX > bounds.right ||
        event.clientY < bounds.top ||
        event.clientY > bounds.bottom
      ) {
        dialog.close();
      }
    }
  });

  dialog.addEventListener('close', () => {
    document.body.style.removeProperty('overflow');
    $$('video', dialog).forEach((video) => video.pause());
  });
});

// ==========================================================================
// Formulário de Agendamento
// ==========================================================================
const bookingDialog = $('.booking-dialog');
const bookingForm = $('#booking-form');

if (bookingForm) {
  const dateField = $('[name="date"]', bookingForm);
  if (dateField) {
    const now = new Date();
    dateField.min = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
      now.getDate()
    ).padStart(2, '0')}`;
  }

  $$('[data-book]').forEach((button) => {
    button.addEventListener('click', () => {
      $('.booking-form-view').hidden = false;
      $('.booking-success').hidden = true;
      const formatSelect = $('[name="format"]', bookingForm);
      if (formatSelect) {
        formatSelect.value = button.dataset.book;
      }
      openDialog(bookingDialog);
    });
  });

  bookingForm.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!bookingForm.reportValidity()) return;

    const data = new FormData(bookingForm);
    const rawName = String(data.get('name') || '').trim();
    const name = rawName.split(' ')[0] || 'Visitante';
    const rawDate = data.get('date');
    const day = rawDate
      ? new Date(`${rawDate}T12:00:00`).toLocaleDateString('pt-BR', {
          day: 'numeric',
          month: 'long',
        })
      : 'data escolhida';

    const successText = $('.success-text');
    if (successText) {
      successText.textContent = `${name}, você escolheu ${String(
        data.get('format')
      ).toLowerCase()} para ${day}, no período da ${String(data.get('period')).toLowerCase()}.`;
    }

    $('.booking-form-view').hidden = true;
    $('.booking-success').hidden = false;
    bookingDialog.scrollTop = 0;

    const returnBtn = $('.booking-success [data-close]');
    if (returnBtn) returnBtn.focus();
  });
}

// ==========================================================================
// Depoimentos e Mídia
// ==========================================================================
const testimonials = [
  { poster: 'assets/imagens/imgRectangle12.png', video: 'assets/videos/depoimento1.mp4' },
  { poster: 'assets/imagens/imgRectangle14.png', video: null },
  { poster: 'assets/imagens/imgRectangle15.png', video: null },
  { poster: 'assets/imagens/imgRectangle16.png', video: null },
];

$$('[data-testimonial]').forEach((button) => {
  button.addEventListener('click', () => {
    const media = testimonials[Number(button.dataset.testimonial)];
    const slot = $('.testimonial-dialog-media');
    if (!slot || !media) return;

    slot.replaceChildren();

    if (media.video) {
      const video = document.createElement('video');
      video.src = media.video;
      video.poster = media.poster;
      video.controls = true;
      video.playsInline = true;
      slot.append(video);
      openDialog($('.testimonial-dialog'));
      video.play().catch(() => {});
    } else {
      const image = document.createElement('img');
      image.src = media.poster;
      image.alt = 'Capa do depoimento ilustrativo';
      const note = document.createElement('p');
      note.className = 'testimonial-placeholder';
      note.textContent = 'Prévia ilustrativa. O vídeo deste depoimento ainda não foi adicionado.';
      slot.append(image, note);
      openDialog($('.testimonial-dialog'));
    }
  });
});

// ==========================================================================
// Animações GSAP e ScrollTrigger
// ==========================================================================
function initGSAPAnimations() {
  if (typeof gsap === 'undefined') return;

  if (typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
  }

  if (!isMotionAllowed()) return;

  // 1. Entrada Suave do Hero
  const heroTl = gsap.timeline({ defaults: { ease: 'power3.out' } });

  heroTl
    .from('.header', {
      y: -30,
      opacity: 0,
      duration: 0.8,
    })
    .from(
      '.hero .eyebrow',
      {
        y: 20,
        opacity: 0,
        duration: 0.7,
      },
      '-=0.4'
    )
    .from(
      '.hero h1',
      {
        y: 35,
        opacity: 0,
        duration: 0.85,
      },
      '-=0.5'
    )
    .from(
      '.hero-description',
      {
        y: 25,
        opacity: 0,
        duration: 0.75,
      },
      '-=0.55'
    )
    .from(
      ['.hero-offer', '.hero-proof', '.mobile-proof', '.hero-invitation'],
      {
        y: 20,
        opacity: 0,
        stagger: 0.1,
        duration: 0.7,
      },
      '-=0.45'
    )
    .from(
      '.hero-button',
      {
        y: 25,
        opacity: 0,
        scale: 0.98,
        duration: 0.7,
      },
      '-=0.4'
    );

  // Se ScrollTrigger não estiver disponível, encerra aqui
  if (typeof ScrollTrigger === 'undefined') return;

  // 2. Animação da Seção Espaço
  gsap.from('.space-heading > *', {
    scrollTrigger: {
      trigger: '.space-section',
      start: 'top 80%',
      toggleActions: 'play none none none',
    },
    y: 30,
    opacity: 0,
    stagger: 0.15,
    duration: 0.8,
    ease: 'power3.out',
  });

  gsap.from('.space-card', {
    scrollTrigger: {
      trigger: '.space-grid',
      start: 'top 82%',
      toggleActions: 'play none none none',
    },
    y: 40,
    opacity: 0,
    stagger: 0.18,
    duration: 0.85,
    ease: 'power3.out',
  });

  // 3. Métricas Interativas (Contador Numérico)
  const metricItems = [
    { el: $('.metric-one strong'), target: 100, prefix: '+', suffix: '' },
    { el: $('.metric-two strong'), target: 6, prefix: '', suffix: '+' },
    { el: $('.metric-three strong'), target: 50, prefix: '', suffix: ' min' },
  ];

  metricItems.forEach(({ el, target, prefix, suffix }) => {
    if (!el) return;
    // Zera o valor imediatamente para evitar flash do valor final antes da animação
    el.textContent = `${prefix}0${suffix}`;
    // Torna visível agora que o JS controlará o valor
    el.setAttribute('data-metric', '');
    const obj = { val: 0 };
    gsap.to(obj, {
      scrollTrigger: {
        trigger: '.metrics',
        start: 'top 85%',
        toggleActions: 'play none none none',
      },
      val: target,
      duration: 1.8,
      ease: 'power2.out',
      onUpdate: () => {
        el.textContent = `${prefix}${Math.floor(obj.val)}${suffix}`;
      },
      onComplete: () => {
        el.textContent = `${prefix}${target}${suffix}`;
      },
    });
  });

  // 4. Seção Nossas Aulas
  gsap.from('.classes-copy > *', {
    scrollTrigger: {
      trigger: '.classes-section',
      start: 'top 80%',
      toggleActions: 'play none none none',
    },
    y: 30,
    opacity: 0,
    stagger: 0.12,
    duration: 0.8,
    ease: 'power3.out',
  });

  gsap.from('.classes-image', {
    scrollTrigger: {
      trigger: '.classes-intro',
      start: 'top 80%',
      toggleActions: 'play none none none',
    },
    x: 40,
    opacity: 0,
    duration: 0.9,
    ease: 'power3.out',
  });

  gsap.from('.class-card', {
    scrollTrigger: {
      trigger: '.class-cards',
      start: 'top 82%',
      toggleActions: 'play none none none',
    },
    y: 40,
    opacity: 0,
    stagger: 0.2,
    duration: 0.85,
    ease: 'power3.out',
  });

  // 5. Seção Comentários / Depoimentos
  gsap.from('.testimonials-heading > *', {
    scrollTrigger: {
      trigger: '.testimonials-section',
      start: 'top 80%',
      toggleActions: 'play none none none',
    },
    y: 30,
    opacity: 0,
    stagger: 0.15,
    duration: 0.8,
    ease: 'power3.out',
  });

  gsap.from('.testimonial', {
    scrollTrigger: {
      trigger: '.testimonials-grid',
      start: 'top 82%',
      toggleActions: 'play none none none',
    },
    y: 35,
    opacity: 0,
    stagger: 0.14,
    duration: 0.8,
    ease: 'power3.out',
  });

  // 6. Seção Dúvidas Frequentes (FAQ)
  gsap.from('.faq-heading > *', {
    scrollTrigger: {
      trigger: '.faq-section',
      start: 'top 80%',
      toggleActions: 'play none none none',
    },
    y: 30,
    opacity: 0,
    stagger: 0.15,
    duration: 0.8,
    ease: 'power3.out',
  });

  gsap.from('.faq-item', {
    scrollTrigger: {
      trigger: '.faq-list',
      start: 'top 82%',
      toggleActions: 'play none none none',
    },
    y: 25,
    opacity: 0,
    stagger: 0.1,
    duration: 0.7,
    ease: 'power3.out',
  });

  // 7. Footer
  gsap.from('.footer-inner > *', {
    scrollTrigger: {
      trigger: '.footer',
      start: 'top 80%',
      toggleActions: 'play none none none',
    },
    y: 30,
    opacity: 0,
    stagger: 0.12,
    duration: 0.85,
    ease: 'power3.out',
  });
}

// Inicializa quando o DOM estiver pronto
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initGSAPAnimations);
} else {
  initGSAPAnimations();
}
