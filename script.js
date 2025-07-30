let player;

async function initApp() {
  shaka.polyfill.installAll();

  if (!shaka.Player.isBrowserSupported()) {
    showError("Shaka Player is not supported in this browser.");
    return;
  }

  const video = document.getElementById("video");
  player = new shaka.Player(video);

  player.addEventListener("error", onError);

  try {
    const response = await fetch("channel.json");
    const data = await response.json();
    populateChannelSelect(data.channels);
  } catch (err) {
    showError("Failed to load channel list.");
    console.error(err);
  }
}

function populateChannelSelect(channels) {
  const select = document.getElementById("channelSelect");
  select.innerHTML = ""; // clear existing

  channels.forEach((channel, index) => {
    const option = document.createElement("option");
    option.value = index;
    option.textContent = channel.name;
    select.appendChild(option);
  });

  select.onchange = () => {
    const selected = channels[select.value];
    playChannel(selected);
  };

  // Auto-play first channel
  if (channels.length > 0) {
    select.selectedIndex = 0;
    playChannel(channels[0]);
  }
}

function playChannel(channel) {
  if (!channel || !channel.url) return;

  console.log("Loading:", channel.name);

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
    player.configure({ drm: {} }); // No DRM
  }

  player.load(channel.url).then(() => {
    console.log(`Now playing: ${channel.name}`);
  }).catch(err => {
    showError("Failed to load stream.");
    console.error(err);
  });
}

function hexToBase64(hex) {
  return btoa(hex.match(/\w{2}/g).map(b => String.fromCharCode(parseInt(b, 16))).join(""));
}

function onError(event) {
  console.error("Player error:", event.detail);
  showError("Player error: " + event.detail.message);
}

function showError(msg) {
  const errorDiv = document.getElementById("errorMessage");
  errorDiv.textContent = msg;
}

document.addEventListener("DOMContentLoaded", initApp);
