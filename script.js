let player = null;

async function loadChannels() {
  const res = await fetch("channel.json");
  const data = await res.json();

  document.getElementById("providerMsg").innerText = data.provider.user_message;
  const grid = document.getElementById("channelGrid");

  // Initialize Shaka on first load
  await initShaka();

  const firstPlayable = data.channels.find(c => c.url);
  if (firstPlayable) playChannel(firstPlayable);

  data.channels.forEach(channel => {
    if (!channel.url) return;

    const item = document.createElement("div");
    item.className = "channel";
    item.innerHTML = `
      <img src="${channel.icon}" alt="${channel.name}" />
      <p>${channel.name}</p>
    `;
    item.onclick = () => playChannel(channel);
    grid.appendChild(item);
  });
}

async function initShaka() {
  shaka.polyfill.installAll();

  if (!shaka.Player.isBrowserSupported()) {
    alert("Shaka Player is not supported in this browser.");
    return;
  }

  const video = document.getElementById("videoPlayer");
  player = new shaka.Player(video);

  player.addEventListener("error", onErrorEvent);
}

function onErrorEvent(event) {
  console.error("Shaka Error:", event.detail);
}

async function playChannel(channel) {
  const video = document.getElementById("videoPlayer");

  if (!player) await initShaka();

  // Configure DRM if needed
  if (channel.drm_type === "clearkey" && channel.drm_key) {
    const [kidHex, keyHex] = channel.drm_key.split(":");
    const kid = hexToBase64(kidHex);
    const key = hexToBase64(keyHex);

    player.configure({
      drm: {
        clearKeys: {
          [kid]: key
        }
      }
    });
  } else {
    player.configure({ drm: {} }); // Clear previous DRM config
  }

  try {
    await player.load(channel.url);
    console.log(`▶ Now playing: ${channel.name}`);
  } catch (error) {
    console.error("❌ Load failed:", error);
  }

  video.muted = false;
  video.play().catch(() => {});
}

function hexToBase64(hex) {
  return btoa(
    hex.match(/\w{2}/g)
       .map(b => String.fromCharCode(parseInt(b, 16)))
       .join("")
  );
}

// Allow audio on first user interaction
document.body.addEventListener('click', () => {
  const video = document.getElementById("videoPlayer");
  video.muted = false;
  video.play().catch(() => {});
}, { once: true });

loadChannels();
