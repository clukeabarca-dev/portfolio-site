type LightboxItem = {
  src: string;
  alt: string;
  caption: string;
};

const candidates = Array.from(document.querySelectorAll<HTMLImageElement>("main img")).filter((image) => {
  const src = image.currentSrc || image.getAttribute("src");

  return Boolean(src) && !image.closest("a[href]");
});

if (candidates.length > 0) {
  const items: LightboxItem[] = [];
  const seen = new Map<string, number>();

  candidates.forEach((image) => {
    const src = image.currentSrc || image.getAttribute("src") || "";
    const caption = image.closest("figure")?.querySelector("figcaption")?.textContent?.replace(/\s+/g, " ").trim();
    const existingIndex = seen.get(src);

    if (existingIndex === undefined) {
      seen.set(src, items.length);
      image.dataset.lightboxIndex = String(items.length);
      items.push({
        src,
        alt: image.alt,
        caption: caption || image.alt,
      });
    } else {
      image.dataset.lightboxIndex = String(existingIndex);
    }

    image.classList.add("lightbox-trigger");
    image.tabIndex = 0;
    image.setAttribute("role", "button");
    image.setAttribute("aria-label", image.alt ? `Open image: ${image.alt}` : "Open image");
  });

  let currentIndex = 0;
  let lastFocusedElement: Element | null = null;

  const lightbox = document.createElement("div");
  lightbox.className = "lightbox";
  lightbox.setAttribute("role", "dialog");
  lightbox.setAttribute("aria-modal", "true");
  lightbox.setAttribute("aria-label", "Image preview");
  lightbox.setAttribute("aria-hidden", "true");
  lightbox.innerHTML = `
    <button class="lightbox__button lightbox__button--close" type="button" aria-label="Close image preview">x</button>
    <button class="lightbox__button lightbox__button--previous" type="button" aria-label="Previous image">&lt;</button>
    <figure class="lightbox__figure">
      <img class="lightbox__image" alt="" />
      <figcaption class="lightbox__caption">
        <span class="lightbox__count"></span>
        <span class="lightbox__caption-text"></span>
      </figcaption>
    </figure>
    <button class="lightbox__button lightbox__button--next" type="button" aria-label="Next image">&gt;</button>
  `;
  document.body.append(lightbox);

  const closeButton = lightbox.querySelector<HTMLButtonElement>(".lightbox__button--close");
  const previousButton = lightbox.querySelector<HTMLButtonElement>(".lightbox__button--previous");
  const nextButton = lightbox.querySelector<HTMLButtonElement>(".lightbox__button--next");
  const previewImage = lightbox.querySelector<HTMLImageElement>(".lightbox__image");
  const count = lightbox.querySelector<HTMLElement>(".lightbox__count");
  const caption = lightbox.querySelector<HTMLElement>(".lightbox__caption-text");

  const updateLightbox = () => {
    const item = items[currentIndex];

    if (!item || !previewImage || !count || !caption || !previousButton || !nextButton) return;

    previewImage.src = item.src;
    previewImage.alt = item.alt;
    count.textContent = `${currentIndex + 1} / ${items.length}`;
    caption.textContent = item.caption;

    const hasSeries = items.length > 1;
    previousButton.hidden = !hasSeries;
    nextButton.hidden = !hasSeries;
  };

  const openLightbox = (index: number) => {
    currentIndex = index;
    lastFocusedElement = document.activeElement;
    updateLightbox();
    lightbox.classList.add("is-active");
    lightbox.setAttribute("aria-hidden", "false");
    document.body.classList.add("is-lightbox-open");
    closeButton?.focus();
  };

  const closeLightbox = () => {
    lightbox.classList.remove("is-active");
    lightbox.setAttribute("aria-hidden", "true");
    document.body.classList.remove("is-lightbox-open");

    if (lastFocusedElement instanceof HTMLElement) {
      lastFocusedElement.focus();
    }
  };

  const showOffset = (offset: number) => {
    currentIndex = (currentIndex + offset + items.length) % items.length;
    updateLightbox();
  };

  document.addEventListener("click", (event) => {
    const target = event.target;

    if (!(target instanceof HTMLElement)) return;

    const image =
      target.closest<HTMLImageElement>("img[data-lightbox-index]") ??
      target.closest("figure")?.querySelector<HTMLImageElement>("img[data-lightbox-index]");
    const index = image?.dataset.lightboxIndex;

    if (!image || image.closest("a[href]") || index === undefined) return;

    openLightbox(Number(index));
  });

  document.addEventListener("keydown", (event) => {
    const target = event.target;

    if (target instanceof HTMLImageElement && target.dataset.lightboxIndex !== undefined) {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openLightbox(Number(target.dataset.lightboxIndex));
      }
    }

    if (!lightbox.classList.contains("is-active")) return;

    if (event.key === "Escape") {
      closeLightbox();
    }

    if (event.key === "ArrowLeft" && items.length > 1) {
      event.preventDefault();
      showOffset(-1);
    }

    if (event.key === "ArrowRight" && items.length > 1) {
      event.preventDefault();
      showOffset(1);
    }
  });

  closeButton?.addEventListener("click", closeLightbox);
  previousButton?.addEventListener("click", () => showOffset(-1));
  nextButton?.addEventListener("click", () => showOffset(1));
  lightbox.addEventListener("click", (event) => {
    if (event.target === lightbox) {
      closeLightbox();
    }
  });
}
