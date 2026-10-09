import { useEffect } from 'react';

/** Blendet alle Elemente mit der Klasse "reveal" sanft ein, sobald sie ins Bild scrollen. */
export function useReveal() {
  useEffect(() => {
    const show = (el: Element) => el.classList.add('is-visible');

    if (!('IntersectionObserver' in window)) {
      document.querySelectorAll('.reveal').forEach(show);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            show(entry.target);
            observer.unobserve(entry.target);
          }
        }
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.08 }
    );

    const observeAll = () =>
      document.querySelectorAll('.reveal:not(.is-visible)').forEach((el) => observer.observe(el));
    observeAll();

    // Später eingeblendete Inhalte (z. B. nach Filterwechsel) ebenfalls erfassen
    const mutations = new MutationObserver(observeAll);
    mutations.observe(document.body, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      mutations.disconnect();
    };
  }, []);
}
