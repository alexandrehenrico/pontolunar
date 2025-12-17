/**
 * SCRIPT PRINCIPAL - PONTO LUNAR
 * Responsável pelo carrossel, animações de scroll e interatividade.
 */

document.addEventListener('DOMContentLoaded', () => {

    /* =========================================
       1. CARROSSEL DE INTEGRANTES
       ========================================= */
    const track = document.querySelector('.carousel-track');
    const slides = Array.from(track.children);
    const nextButton = document.querySelector('.next-btn');
    const prevButton = document.querySelector('.prev-btn');
    const dotsNav = document.querySelector('.carousel-nav');
    const dots = Array.from(dotsNav.children);

    // Tamanho do slide com base no container
    // Recalcula ao redimensionar a janela
    let slideWidth = slides[0].getBoundingClientRect().width;

    // Posiciona os slides um ao lado do outro
    const setSlidePosition = (slide, index) => {
        slide.style.left = slideWidth * index + 'px';
    };
    slides.forEach(setSlidePosition);

    // Mover para o slide alvo
    const moveToSlide = (track, currentSlide, targetSlide) => {
        track.style.transform = 'translateX(-' + targetSlide.style.left + ')';
        currentSlide.classList.remove('current-slide');
        targetSlide.classList.add('current-slide');
    };

    // Atualizar as bolinhas (indicadores)
    const updateDots = (currentDot, targetDot) => {
        currentDot.classList.remove('current-slide');
        targetDot.classList.add('current-slide');
    };

    // Mostrar/Esconder setas (loop infinito não precisa disso, mas se não for loop...)
    // Vamos implementar loop simples ou travar nas pontas?
    // O pedido não especificou, mas "Carrossel JavaScript" geralmente tem loop ou trava. 
    // Vamos fazer loop infinito para ser mais "pro",
    // mas a estrutura HTML atual favorece navegação linear simples.
    // Vamos manter navegação linear com travamento nas pontas para simplicidade e robustez (sem bugs).
    
    const hideShowArrows = (slides, prevButton, nextButton, targetIndex) => {
        if (targetIndex === 0) {
            prevButton.style.opacity = '0.5';
            prevButton.style.pointerEvents = 'none';
            nextButton.style.opacity = '1';
            nextButton.style.pointerEvents = 'all';
        } else if (targetIndex === slides.length - 1) {
            prevButton.style.opacity = '1';
            prevButton.style.pointerEvents = 'all';
            nextButton.style.opacity = '0.5';
            nextButton.style.pointerEvents = 'none';
        } else {
            prevButton.style.opacity = '1';
            prevButton.style.pointerEvents = 'all';
            nextButton.style.opacity = '1';
            nextButton.style.pointerEvents = 'all';
        }
    };

    // Inicializa estado dos botões
    hideShowArrows(slides, prevButton, nextButton, 0);

    // CLIQUE NO BOTÃO PRÓXIMO
    nextButton.addEventListener('click', e => {
        const currentSlide = track.querySelector('.current-slide');
        const nextSlide = currentSlide.nextElementSibling;
        const currentDot = dotsNav.querySelector('.current-slide');
        const nextDot = currentDot.nextElementSibling;
        const nextIndex = slides.findIndex(slide => slide === nextSlide);

        moveToSlide(track, currentSlide, nextSlide);
        updateDots(currentDot, nextDot);
        hideShowArrows(slides, prevButton, nextButton, nextIndex);
    });

    // CLIQUE NO BOTÃO ANTERIOR
    prevButton.addEventListener('click', e => {
        const currentSlide = track.querySelector('.current-slide');
        const prevSlide = currentSlide.previousElementSibling;
        const currentDot = dotsNav.querySelector('.current-slide');
        const prevDot = currentDot.previousElementSibling;
        const prevIndex = slides.findIndex(slide => slide === prevSlide);

        moveToSlide(track, currentSlide, prevSlide);
        updateDots(currentDot, prevDot);
        hideShowArrows(slides, prevButton, nextButton, prevIndex);
    });

    // CLIQUE NOS INDICADORES (DOTS)
    dotsNav.addEventListener('click', e => {
        const targetDot = e.target.closest('button');

        if (!targetDot) return;

        const currentSlide = track.querySelector('.current-slide');
        const currentDot = dotsNav.querySelector('.current-slide');
        const targetIndex = dots.findIndex(dot => dot === targetDot);
        const targetSlide = slides[targetIndex];

        moveToSlide(track, currentSlide, targetSlide);
        updateDots(currentDot, targetDot);
        hideShowArrows(slides, prevButton, nextButton, targetIndex);
    });

    // SUPORTE A SWIPE (TOUCH) NO MOBILE
    let touchStartX = 0;
    let touchEndX = 0;

    track.addEventListener('touchstart', e => {
        touchStartX = e.changedTouches[0].screenX;
    });

    track.addEventListener('touchend', e => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    });

    function handleSwipe() {
        // Limiar Mínimo para considerar swipe
        if (Math.abs(touchEndX - touchStartX) < 50) return;

        const currentSlide = track.querySelector('.current-slide');
        
        if (touchEndX < touchStartX) {
            // Swipe para Esquerda (Next)
            const nextSlide = currentSlide.nextElementSibling;
            if (nextSlide) {
                nextButton.click();
            }
        } else {
            // Swipe para Direita (Prev)
            const prevSlide = currentSlide.previousElementSibling;
            if (prevSlide) {
                prevButton.click();
            }
        }
    }

    // AJUSTAR CARROSSEL AO REDIMENSIONAR TELA
    window.addEventListener('resize', () => {
        slideWidth = slides[0].getBoundingClientRect().width;
        slides.forEach(setSlidePosition);
        
        // Mantém o slide atual visível no resize
        const currentSlide = track.querySelector('.current-slide');
        const targetSlide = currentSlide; 
        // Apenas para re-aplicar o transform correto com a nova largura
        track.style.transform = 'translateX(-' + targetSlide.style.left + ')';
    });


    /* =========================================
       2. ANIMAÇÕES DE SCROLL (OBSERVER)
       ========================================= */
    const scrollElements = document.querySelectorAll('.scroll-animate');

    const elementInView = (el, offset = 100) => {
        const elementTop = el.getBoundingClientRect().top;
        return (
            elementTop <= 
            (window.innerHeight || document.documentElement.clientHeight) - offset
        );
    };

    const displayScrollElement = (element) => {
        element.classList.add('visible');
    };

    // Usando IntersectionObserver para melhor performance
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                // Opcional: Para animação acontecer apenas uma vez, removemos o observer
                observer.unobserve(entry.target); 
            }
        });
    }, {
        threshold: 0.15, // Gatilho quando 15% do elemento estiver visível
        rootMargin: "0px 0px -50px 0px"
    });

    scrollElements.forEach((el) => {
        observer.observe(el);
    });

});
