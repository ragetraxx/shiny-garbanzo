document.addEventListener("DOMContentLoaded", () => {
  const featured = [
    {
      name: "Rage Music TV",
      logo: "https://i.imgur.com/a3iXI35.png",
      stream: "https://stream.gia.tv/giatv/giatv-ragemusictv/ragemusictv/playlist.m3u8"
    },
    {
      name: "RageTV",
      logo: "https://i.imgur.com/Ym32WqZ.png",
      stream: "https://stream.gia.tv/giatv/giatv-ragetv/ragetv/playlist.m3u8"
    },
    {
      name: "SineManila",
      logo: "https://i.imgur.com/2N1kh1D.png",
      stream: "https://stream.gia.tv/giatv/giatv-sinemanila/sinemanila/playlist.m3u8"
    },
    {
      name: "BIHM TV",
      logo: "https://i.imgur.com/lemgLSj.png",
      stream: "https://stream.gia.tv/giatv/giatv-bihmtv/bihmtv/playlist.m3u8"
    }
  ];

  const featuredContainer = document.getElementById("featured");
  const searchInput = document.getElementById("searchInput");
  const searchResults = document.getElementById("searchResults");

  function createChannelCard(channel) {
    const div = document.createElement("div");
    div.className = "channel";
    div.innerHTML = `
      <img src="${channel.logo}" alt="${channel.name}" />
      <div class="channel-name">${channel.name}</div>
    `;
    div.addEventListener("click", () => {
      window.open(channel.stream, "_blank");
    });
    return div;
  }

  // Load featured channels
  featured.forEach(channel => {
    featuredContainer.appendChild(createChannelCard(channel));
  });

  // Fetch and search channels from JSON
  fetch("https://raw.githubusercontent.com/TVGarden/tv-garden-channel-list/refs/heads/main/channels/raw/categories/all-channels.json")
    .then(response => response.json())
    .then(data => {
      let allChannels = [];
      data.forEach(category => {
        allChannels = allChannels.concat(category.channels);
      });

      searchInput.addEventListener("input", () => {
        const query = searchInput.value.toLowerCase();
        searchResults.innerHTML = "";
        if (query) {
          const results = allChannels.filter(channel =>
            channel.name.toLowerCase().includes(query)
          );
          results.forEach(channel => {
            const div = createChannelCard({
              name: channel.name,
              logo: channel.logo,
              stream: channel.url
            });
            searchResults.appendChild(div);
          });
        }
      });
    });
});
