let player = null;

async function loadChannels() {
  const res = await fetch("channel.json");
  const data = await res.json();

  document.getElementById("providerMsg").innerText = data.provider.user_message;
  const grid = document.getElementById("channelGrid");

  // Autoplay the first channel
  const firstPlayable = data.channels.find(c => c.url);
  if (firstPlayable) playChannel(firstPlayable);

  // Render all channels
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

function playChannel(channel) {
  const video = document.getElementById("videoPlayer");

  // Reset the player if it exists
  if (player) {
    player.reset();
  }

  player = dashjs.MediaPlayer().create();
  player.initialize(video, null, false); // Delay until config is set

  if (channel.drm_type === "clearkey" && channel.drm_key) {
    const [kidHex, keyHex] = channel.drm_key.split(":");
    const kid = hexToBase64(kidHex);
    const key = hexToBase64(keyHex);

    player.setProtectionData({
      "org.w3.clearkey": {
        clearkeys: {
          [kid]: key
        },
        priority: 0
      }
    });
  }

  player.attachSource(channel.url);

  // Attempt to play (for autoplay policies)
  video.muted = false;
  video.play().catch(err => {
    console.warn("Autoplay blocked. Click anywhere to unmute.");
  });

  console.log("▶ Now Playing:", channel.name);
  console.log("🔗", channel.url);
}

function hexToBase64(hex) {
  return btoa(
    hex.match(/\w{2}/g)
       .map(b => String.fromCharCode(parseInt(b, 16)))
       .join("")
  );
}

// Enable sound on first click (required by browsers)
document.body.addEventListener('click', () => {
  const video = document.getElementById("videoPlayer");
  video.muted = false;
  video.play().catch(() => {});
}, { once: true });

loadChannels();
