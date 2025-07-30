let player = null;

async function loadChannels() {
  const res = await fetch("channel.json");
  const data = await res.json();

  document.getElementById("providerMsg").innerText = data.provider.user_message;
  const grid = document.getElementById("channelGrid");

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

function playChannel(channel) {
  const video = document.getElementById("videoPlayer");

  if (player) {
    player.reset();
  }

  player = dashjs.MediaPlayer().create();
  player.initialize(video, channel.url, true);

  if (channel.drm_type === "clearkey" && channel.drm_key) {
    const [kidHex, keyHex] = channel.drm_key.split(":");
    const kid = hexToBase64(kidHex);
    const key = hexToBase64(keyHex);

    player.setProtectionData({
      "org.w3.clearkey": {
        "clearkeys": {
          [kid]: key
        },
        "priority": 0
      }
    });
  }

  console.log(`Now Playing: ${channel.name}`);
  console.log(channel.url);
}

function hexToBase64(hex) {
  return btoa(hex.match(/\w{2}/g).map(b => String.fromCharCode(parseInt(b, 16))).join(""));
}

document.body.addEventListener('click', () => {
  const video = document.getElementById("videoPlayer");
  video.muted = false;
});

loadChannels();
