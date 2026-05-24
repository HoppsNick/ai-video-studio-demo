const tiles = document.querySelectorAll(".media-tile video");

const mediaObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      const video = entry.target;
      if (entry.isIntersecting) {
        video.play().catch(() => undefined);
      } else {
        video.pause();
      }
    });
  },
  {threshold: 0.35},
);

tiles.forEach((video) => mediaObserver.observe(video));
