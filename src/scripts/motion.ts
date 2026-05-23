import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (!prefersReducedMotion) {
  gsap.registerPlugin(ScrollTrigger);

  gsap.utils.toArray<HTMLElement>("[data-reveal]").forEach((element) => {
    gsap.fromTo(
      element,
      { autoAlpha: 0, y: 28 },
      {
        autoAlpha: 1,
        y: 0,
        duration: 0.85,
        ease: "power3.out",
        scrollTrigger: {
          trigger: element,
          start: "top 88%",
          once: true,
        },
      },
    );
  });

  gsap.utils.toArray<HTMLElement>("[data-parallax]").forEach((element) => {
    gsap.to(element, {
      yPercent: -8,
      ease: "none",
      scrollTrigger: {
        trigger: element,
        start: "top bottom",
        end: "bottom top",
        scrub: 0.8,
      },
    });
  });

  gsap.utils.toArray<HTMLElement>("[data-sticky-chapter]").forEach((element) => {
    const media = element.querySelector("[data-chapter-media]");

    if (!media) return;

    gsap.fromTo(
      media,
      { scale: 0.96, clipPath: "inset(8% 8% 8% 8%)" },
      {
        scale: 1,
        clipPath: "inset(0% 0% 0% 0%)",
        ease: "none",
        scrollTrigger: {
          trigger: element,
          start: "top 80%",
          end: "bottom 30%",
          scrub: true,
        },
      },
    );
  });
}
