const groups = new Map();

document.querySelectorAll('[data-sync-group]').forEach((container) => {
  groups.set(container.dataset.syncGroup, [...container.querySelectorAll('video')]);
});

document.querySelectorAll('[data-controls-for]').forEach((toolbar) => {
  const videos = groups.get(toolbar.dataset.controlsFor) || [];
  toolbar.addEventListener('click', async (event) => {
    const button = event.target.closest('button');
    if (!button || videos.length === 0) return;
    if (button.dataset.action === 'restart') {
      videos.forEach((video) => {
        video.pause();
        video.currentTime = 0;
      });
      button.parentElement.querySelector('[data-action="play"]').textContent = 'Play pair';
      return;
    }
    const shouldPlay = videos.every((video) => video.paused);
    if (shouldPlay) {
      const anchor = videos.every((video) => video.ended) ? 0 : videos[0].currentTime;
      videos.forEach((video, index) => {
        video.currentTime = anchor;
        video.muted = index !== 0;
      });
      await Promise.allSettled(videos.map((video) => video.play()));
      button.textContent = 'Pause pair';
    } else {
      videos.forEach((video) => video.pause());
      button.textContent = 'Play pair';
    }
  });
});

groups.forEach((videos, groupName) => {
  videos.forEach((video) => video.addEventListener('ended', () => {
    if (videos.every((item) => item.paused)) {
      const button = document.querySelector(`[data-controls-for="${groupName}"] [data-action="play"]`);
      if (button) button.textContent = 'Play pair';
    }
  }));
});

document.querySelectorAll('video[controls]').forEach((video) => {
  video.addEventListener('play', () => {
    document.querySelectorAll('video[controls]').forEach((other) => {
      if (other !== video && !other.closest('[data-sync-group]')) other.pause();
    });
  });
});

const header = document.querySelector('.site-header');
const observer = new IntersectionObserver(([entry]) => {
  header.classList.toggle('scrolled', !entry.isIntersecting);
}, { threshold: 0.05 });
observer.observe(document.querySelector('.hero'));
