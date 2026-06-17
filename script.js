let currentStory = 0;
const totalStories = 6;
const storyDuration = 6000;
let startTimestamp;
let animationFrameId;
let secretRevealed = false;

// AJUSTE AS DATAS REAIS SE PRECISAR
const dataNamoro = new Date(2025, 11, 17, 20, 0);
const dataNascimentoBebes = new Date(2026, 2, 21, 10, 0);

function startStoryTimer() {
  cancelAnimationFrame(animationFrameId);
  startTimestamp = Date.now();

  function step() {
    let elapsed = Date.now() - startTimestamp;
    let percentage = Math.min((elapsed / storyDuration) * 100, 100);
    document.getElementById("bar" + currentStory).style.width =
      percentage + "%";

    if (currentStory === 1)
      atualizarContadorGenerico(dataNamoro, "contadorNamoro");
    if (currentStory === 3)
      atualizarContadorGenerico(dataNascimentoBebes, "contadorBebes");

    if (elapsed < storyDuration) {
      animationFrameId = requestAnimationFrame(step);
    } else if (currentStory < totalStories - 1) {
      changeStory(1);
    }
  }

  animationFrameId = requestAnimationFrame(step);
}

function atualizarContadorGenerico(dataAlvo, idElemento) {
  const agora = new Date();
  let diff = Math.abs(agora - dataAlvo);
  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff % 86400000) / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);

  const elemento = document.getElementById(idElemento);
  if (elemento) {
    elemento.innerText = `${d} dias, ${h}h, ${m}m, ${s}s`;
  }
}

function handleTap(event) {
  if (
    (event.target.closest && event.target.closest("#muteBtn")) ||
    event.target.id === "revealBtn" ||
    (document.getElementById("conteudoOculto") &&
      document.getElementById("conteudoOculto").contains(event.target))
  ) {
    return;
  }

  createHeartManual(event);

  if (currentStory === totalStories - 1 && secretRevealed) return;

  const container = document.getElementById("story-container");
  const rect = container.getBoundingClientRect();

  // Corrige leitura de coordenadas para Touch e Mouse
  let clientX = event.clientX;
  if (event.changedTouches && event.changedTouches[0]) {
    clientX = event.changedTouches[0].clientX;
  } else if (event.touches && event.touches[0]) {
    clientX = event.touches[0].clientX;
  }

  const x = clientX - rect.left;

  if (x < rect.width * 0.35) {
    changeStory(-1);
  } else {
    changeStory(1);
  }
}

function changeStory(direction) {
  let next = currentStory + direction;
  if (next >= 0 && next < totalStories) {
    // GATILHO DA MÚSICA: Dá o play no primeiro toque humano na tela
    const somFundo = document.getElementById("musica-fundo");
    if (somFundo && somFundo.paused) {
      somFundo.play().catch((err) => console.log("Aguardando interação"));
    }

    document.getElementById("story" + currentStory).style.display = "none";
    document.getElementById("story" + currentStory).style.opacity = "0";
    document.getElementById("story" + currentStory).style.transform =
      "translateY(20px)";

    currentStory = next;

    let f = document.getElementById("story" + currentStory);
    f.style.display = "flex";
    setTimeout(() => {
      f.style.opacity = "1";
      f.style.transform = "translateY(0)";
    }, 50);

    for (let i = 0; i < totalStories; i++) {
      document.getElementById("bar" + i).style.width =
        i < currentStory ? "100%" : "0%";
    }
    startStoryTimer();
  }
}

function toggleMute(e) {
  if (e) e.stopPropagation();

  const audio = document.getElementById("musica-fundo");
  const iconUnmuted = document.getElementById("icon-unmuted");
  const iconMuted = document.getElementById("icon-muted");

  if (audio) {
    audio.muted = !audio.muted;
    if (audio.muted) {
      iconUnmuted.style.display = "none";
      iconMuted.style.display = "block";
    } else {
      iconUnmuted.style.display = "block";
      iconMuted.style.display = "none";
    }
  }
}

function createHeartManual(e) {
  let clientX = e.clientX;
  let clientY = e.clientY;

  if (e.changedTouches && e.changedTouches[0]) {
    clientX = e.changedTouches[0].clientX;
    clientY = e.changedTouches[0].clientY;
  } else if (e.touches && e.touches[0]) {
    clientX = e.touches[0].clientX;
    clientY = e.touches[0].clientY;
  }

  if (clientX === undefined || clientY === undefined) return;

  const container = document.getElementById("story-container");
  const rect = container.getBoundingClientRect();
  const x = clientX - rect.left;
  const y = clientY - rect.top;

  const h = document.createElement("div");
  h.innerText = "❤";
  h.style.cssText = `position:absolute; left:${x - 10}px; top:${y - 10}px; font-size:24px; color:#ff6b6b; z-index:100; pointer-events:none; animation: float 1s forwards;`;
  container.appendChild(h);
  setTimeout(() => h.remove(), 1000);
}

function revealSecret(e) {
  if (e) e.stopPropagation();

  cancelAnimationFrame(animationFrameId);
  document.getElementById("bar" + currentStory).style.width = "100%";

  const btn = document.getElementById("revealBtn");
  const rect = btn.getBoundingClientRect();
  const midX = rect.left + rect.width / 2;
  const midY = rect.top + rect.height / 2;

  for (let i = 0; i < 10; i++) {
    setTimeout(() => {
      let driftX = midX + (Math.random() * 80 - 40);
      let driftY = midY + (Math.random() * 40 - 20);
      createHeartManual({ clientX: driftX, clientY: driftY });
    }, i * 40);
  }

  secretRevealed = true;
  btn.style.display = "none";

  const c = document.getElementById("conteudoOculto");
  c.style.display = "block";
  setTimeout(() => {
    c.style.opacity = "1";
    c.style.transform = "translateY(0)";
  }, 50);
}

window.onload = startStoryTimer;
