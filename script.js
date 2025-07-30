const channelList = document.getElementById("channelList");
const playerOverlay = document.getElementById("playerOverlay");
const videoPlayer = document.getElementById("videoPlayer");
const closePlayer = document.getElementById("closePlayer");
const searchInput = document.getElementById("searchInput");

let allChannels = [];

// Fetch and parse M3U
async function loadChannels() {
  const res = await fetch("https://raw.githubusercontent.com/ragetraxx/epg-auto/refs/heads/main/rageteevee.m3u");
  const text = await res.text();
  allChannels = parseM3U(text);
  displayChannels(allChannels);
}

// Parse M3U to objects
function parseM3U(data) {
  const lines = data.split("\n");
  const channels = [];
  let current = {};

  lines.forEach(line => {
    line = line.trim();
    if (line.startsWith("#EXTINF:")) {
      const nameMatch = line.match(/,(.*)$/);
      const logoMatch = line.match(/tvg-logo="(.*?)"/);
      const keyMatch = data.match(/#KODIPROP:inputstream\.adaptive\.license_key=(.*?):(.*?)\n/);
      current = {
        name: nameMatch ? nameMatch[1] : "Unknown",
        logo: logoMatch ? logoMatch[1] : "",
        clearkey: keyMatch ? { kid: keyMatch[1], key: keyMatch[2] } : null,
      };
    } else if (line && !line.startsWith("#")) {
      current.url = line;
      channels.push({ ...current });
    }
  });
  return channels;
}

// Display channels
function displayChannels(channels) {
  channelList.innerHTML = "";
  channels.forEach(channel => {
    const card = document.createElement("div");
    card.className = "channel-card";
    card.innerHTML = `
      <img src="${channel.logo || 'https://via.placeholder.com/150x100?text=No+Logo'}" alt="${channel.name}">
      <div class="channel-name">${channel.name}</div>
      ${channel.clearkey ? '<div class="drm-label">ClearKey</div>' : ""}
    `;
    card.addEventListener("click", () => playChannel(channel));
    channelList.appendChild(card);
  });
}

// Play selected channel
async function playChannel(channel) {
  const url = channel.url;

  // Clear any previous playback
  videoPlayer.pause();
  videoPlayer.src = "";
  playerOverlay.style.display = "flex";

  if (url.endsWith(".m3u8")) {
    // Play M3U8 with HLS.js
    if (Hls.isSupported()) {
      const hls = new Hls();
      hls.loadSource(url);
      hls.attachMedia(videoPlayer);
    } else {
      videoPlayer.src = url;
    }
  } 
  else if (url.endsWith(".mpd") && channel.clearkey) {
    // Play MPD with Shaka + ClearKey
    const player = new shaka.Player(videoPlayer);
    player.configure({
      drm: {
        clearKeys: {
          [channel.clearkey.kid]: channel.clearkey.key
        }
      }
    });
    try {
      await player.load(url);
    } catch (err) {
      alert("Error playing MPD: " + err);
    }
  } 
  else {
    alert("Unsupported stream format or missing ClearKey!");
  }
}

// Close player
closePlayer.addEventListener("click", () => {
  videoPlayer.pause();
  videoPlayer.src = "";
  playerOverlay.style.display = "none";
});

// Search filter
searchInput.addEventListener("input", () => {
  const term = searchInput.value.toLowerCase();
  const filtered = allChannels.filter(ch => ch.name.toLowerCase().includes(term));
  displayChannels(filtered);
});

// Initialize
document.addEventListener("DOMContentLoaded", () => {
  shaka.polyfill.installAll(); // Initialize Shaka
  loadChannels();
});
