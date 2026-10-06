// ============================================================
// KLIP EKLEMEK ARTIK ÇOK BASİT:
//
// 1) Videonu clips/ klasörüne at.
// 2) Şu isimlerden birini kullan:
//      cs2-01.mp4, cs2-02.mp4, cs2-03.mp4 ...
//      valo-01.mp4, valo-02.mp4, valo-03.mp4 ...
// 3) Siteyi yenile. Başka hiçbir dosyaya dokunma.
//
// Başlık, dosya adından otomatik oluşturulur.
// ============================================================

const MAX_CLIPS_PER_GAME = 50;
const clips = [];

for (let i = 1; i <= MAX_CLIPS_PER_GAME; i++) {
  const number = String(i).padStart(2, "0");
  clips.push({
    game: "cs2",
    gameLabel: "CS2",
    title: `CS2 Clip #${number}`,
    description: "CS2 highlight",
    file: `clips/cs2-${number}.mp4`
  });
  clips.push({
    game: "valo",
    gameLabel: "VALORANT",
    title: `VALORANT Clip #${number}`,
    description: "VALORANT highlight",
    file: `clips/valo-${number}.mp4`
  });
}

const grid = document.getElementById("clipGrid");
const heroCount = document.getElementById("heroCount");
const modal = document.getElementById("videoModal");
const modalVideo = document.getElementById("modalVideo");
const modalGame = document.getElementById("modalGame");
const modalTitle = document.getElementById("modalTitle");
const modalDescription = document.getElementById("modalDescription");
const closeModalButton = document.getElementById("closeModal");

let availableClips = [];
let currentFilter = "all";

function renderClips(filter = "all") {
  currentFilter = filter;
  const visible = filter === "all"
    ? availableClips
    : availableClips.filter(clip => clip.game === filter);

  grid.innerHTML = visible.map((clip, index) => `
    <article class="clip-card" data-id="${clip.id}">
      <div class="video-preview">
        <video src="${clip.file}" muted playsinline preload="metadata"></video>
        <div class="video-overlay">
          <span class="badge">${clip.gameLabel}</span>
          <span class="play">▶</span>
        </div>
      </div>
      <div class="clip-info">
        <div>
          <h3>${clip.title}</h3>
          <p>${clip.description}</p>
        </div>
        <span class="clip-no">${String(index + 1).padStart(2, "0")}</span>
      </div>
    </article>
  `).join("");

  grid.querySelectorAll(".clip-card").forEach(card => {
    const clip = availableClips.find(item => item.id === card.dataset.id);
    card.addEventListener("click", () => openClip(clip));
  });

  grid.querySelectorAll("video").forEach(video => {
    video.addEventListener("mouseenter", () => video.play().catch(() => {}));
    video.addEventListener("mouseleave", () => {
      video.pause();
      video.currentTime = 0;
    });
  });
}

function openClip(clip) {
  if (!clip) return;

  modalGame.textContent = clip.gameLabel;
  modalTitle.textContent = clip.title;
  modalDescription.textContent = clip.description;
  modalVideo.src = clip.file;
  modal.classList.remove("hidden");
  modal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
  modalVideo.play().catch(() => {});
}

function closeModal() {
  modalVideo.pause();
  modalVideo.removeAttribute("src");
  modalVideo.load();
  modal.classList.add("hidden");
  modal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

function discoverClips() {
  // Her aday video için bir <video> oluşturuyoruz.
  // Dosya yoksa tarayıcı hata verir ve o klip listeden silinir.
  const checks = clips.map((clip, index) => new Promise(resolve => {
    const video = document.createElement("video");
    video.preload = "metadata";
    video.muted = true;

    const finish = (exists) => {
      if (exists) {
        availableClips.push({
          ...clip,
          id: `${clip.game}-${index}`
        });
      }
      resolve();
    };

    video.addEventListener("loadedmetadata", () => finish(true), { once: true });
    video.addEventListener("error", () => finish(false), { once: true });
    video.src = clip.file;
  }));

  Promise.all(checks).then(() => {
    availableClips.sort((a, b) => a.file.localeCompare(b.file));
    heroCount.textContent = String(availableClips.length).padStart(2, "0");
    renderClips(currentFilter);
  });
}

document.querySelectorAll(".filter").forEach(button => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".filter").forEach(b => b.classList.remove("active"));
    button.classList.add("active");
    renderClips(button.dataset.filter);
  });
});

closeModalButton.addEventListener("click", closeModal);
modal.addEventListener("click", event => {
  if (event.target.dataset.close === "true") closeModal();
});
document.addEventListener("keydown", event => {
  if (event.key === "Escape" && !modal.classList.contains("hidden")) closeModal();
});

// İlk açılışta clips/ klasöründeki uygun dosyaları otomatik bul.
discoverClips();
