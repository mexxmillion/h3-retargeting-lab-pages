document.querySelectorAll('[data-example]').forEach((example) => {
  const video = example.querySelector('video');
  example.querySelectorAll('[data-mode]').forEach((button) => {
    button.addEventListener('click', () => {
      if (button.getAttribute('aria-pressed') === 'true') return;
      const time = video.currentTime;
      const playing = !video.paused;
      const muted = video.muted;
      const volume = video.volume;
      example.querySelectorAll('[data-mode]').forEach((item) => item.setAttribute('aria-pressed', String(item === button)));
      video.addEventListener('loadedmetadata', () => {
        video.currentTime = Math.min(time, Math.max(0, video.duration - 0.05));
        video.muted = muted;
        video.volume = volume;
        if (playing) video.play().catch(() => {});
      }, { once: true });
      video.preload = 'auto';
      video.removeAttribute('poster');
      video.src = `assets/oct26/${example.dataset.example}-${button.dataset.mode}.mp4`;
      video.load();
    });
  });
});

document.querySelectorAll('video').forEach((video) => {
  video.addEventListener('play', () => {
    document.querySelectorAll('video').forEach((other) => { if (other !== video) other.pause(); });
  });
});

fetch('assets/oct26/attempt-ledger.json').then((response) => {
  if (!response.ok) throw new Error('Ledger unavailable');
  return response.json();
}).then((ledger) => {
  const rows = document.querySelector('#attempt-rows');
  rows.replaceChildren();
  ledger.jobs.forEach((job) => {
    const row = document.createElement('tr');
    const first = document.createElement('td');
    first.textContent = job.family;
    const id = document.createElement('code');
    id.textContent = job.id;
    first.append(id);
    row.append(first);
    const status = document.createElement('td');
    status.textContent = job.status;
    const description = document.createElement('td');
    description.textContent = job.description;
    const time = document.createElement('td');
    time.textContent = job.wall_seconds == null ? 'Not recorded' : `${(job.wall_seconds / 60).toFixed(1)} min`;
    row.append(status, description, time);
    rows.append(row);
  });
  const history = document.querySelector('#yesterday-jobs');
  ledger.yesterday_completed_jobs.forEach((job) => {
    const li = document.createElement('li');
    const link = document.createElement('a');
    link.href = job.url;
    link.textContent = job.id;
    li.append(link, document.createTextNode(` · ${job.created_at_utc} · ${job.prompt.slice(0, 110)}…`));
    history.append(li);
  });
}).catch(() => { /* The static JSON link remains available. */ });
