const genreSections = document.getElementById("genreSections");
const playerOverlay = document.getElementById("playerOverlay");
const videoPlayer = document.getElementById("videoPlayer");
const closePlayer = document.getElementById("closePlayer");
const searchInput = document.getElementById("searchInput");
const categoryFilter = document.getElementById("categoryFilter");

let allChannels = [];
let allCategories = [];

// Load channels & categories
async function loadData() {
  const [channelsRes, categoriesRes] = await Promise.all([
    fetch("https://iptv-org.github.io/api/channels.json"),
    fetch("https://iptv-org.github.io/api/categories.json")
  ]);

  allChannels = await channelsRes.json();
  allCategories = await categoriesRes.json();

  // Populate country dropdown
  const countries = [...new Set(allChannels.map(c => c.country || "Unknown"))].sort();
  countries.forEach(ct => {
    const option = document.createElement("option");
    option.value = ct;
    option.textContent = ct;
    categoryFilter.appendChild(option);
  });

  displayGenres();
}

// Display genre rows
function displayGenres() {
  genreSections.innerHTML = "";

  allCategories.forEach(cat => {
    const section = document.createElement("div");
    section.className = "genre-section";

    const title = document.createElement("h2");
    title.className = "genre-title";
    title.textContent = cat.name;

    const row = document.createElement("div");
    row.className = "channel-row";

    const genreChannels = allChannels.filter(ch => ch.category === cat.id);
    genreChannels.forEach(ch => {
      if (!filterMatch(ch)) return;

      const card = document.createElement("div");
      card.className = "channel-card";
      card.innerHTML = `
        <img src="${ch.logo || 'https://via.placeholder.com/150x100?text=No+Logo'}" alt="${ch.name}">
        <div class="channel-name">${ch.name}</div>
      `;
      card.addEventListener("click", () => playChannel(ch.url));
      row.appendChild(card);
    });

    if (row.childElementCount > 0) {
      section.appendChild(title);
      section.appendChild(row);
      genreSections.appendChild(section);
    }
  });
}

// Play selected channel
function playChannel(url) {
  if (!url) return alert("Stream URL not available.");
  if (Hls.isSupported()) {
    const hls = new Hls();
    hls.loadSource(url);
    hls.attachMedia(videoPlayer);
  } else if (videoPlayer.canPlayType("application/vnd.apple.mpegurl")) {
    videoPlayer.src = url;
  }
  playerOverlay.style.display = "flex";
}

// Close player
closePlayer.addEventListener("click", () => {
  videoPlayer.pause();
  videoPlayer.src = "";
  playerOverlay.style.display = "none";
});

// Search and filter
searchInput.addEventListener("input", displayGenres);
categoryFilter.addEventListener("change", displayGenres);

function filterMatch(channel) {
  const searchTerm = searchInput.value.toLowerCase();
  const selectedCountry = categoryFilter.value;

  const matchesSearch = channel.name.toLowerCase().includes(searchTerm);
  const matchesCountry = selectedCountry === "all" || channel.country === selectedCountry;

  return matchesSearch && matchesCountry;
}

// Initialize
loadData();
