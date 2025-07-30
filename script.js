let jwPlayerInstance = null;
let activeChannelName = null;

function updateClock() {
  const now = new Date();
  const h = String(now.getHours()).padStart(2, '0');
  const m = String(now.getMinutes()).padStart(2, '0');
  const s = String(now.getSeconds()).padStart(2, '0');
  document.getElementById('clock').textContent = `${h}:${m}:${s}`;
}

function populateCategoryDropdown() {
    const categorySelect = document.getElementById('categoryFilter');
    const categories = Array.from(new Set(channels.map(c => c.category))).sort();
    categories.forEach(cat => {
        const option = document.createElement('option');
        option.value = cat;
        option.textContent = cat;
        categorySelect.appendChild(option);
    });
}

function setupChannelList() {
    const list = document.getElementById('channelList');
    const countDisplay = document.getElementById('channelCount');
    const search = document.getElementById('searchInput').value.toLowerCase();
    const selectedCategory = document.getElementById('categoryFilter').value;
    list.innerHTML = '';

    let visibleCount = 0;

    const sortedChannels = [...channels].sort((a, b) => a.name.localeCompare(b.name));

    sortedChannels.forEach((channel) => {
        const matchCategory = selectedCategory === 'all' || channel.category === selectedCategory;
        const matchSearch = channel.name.toLowerCase().includes(search);
        if (matchCategory && matchSearch) {
            visibleCount++;

            const li = document.createElement('li');
            li.tabIndex = 0;
            li.onclick = () => loadChannelByName(channel.name);

            if (channel.name === activeChannelName) li.classList.add('active');

            li.textContent = channel.name;
            list.appendChild(li);
        }
    });

    countDisplay.textContent = `Total Channel${visibleCount !== 1 ? 's' : ''}: ${visibleCount}`;
}

function initPlayer() {
    jwPlayerInstance = jwplayer("player").setup({
        width: "100%",
        height: "100%",
        autostart: false,
        stretching: "exactfit",
        aspectratio: "16:9",
        primary: "html5",
        hlshtml: true,
        displaytitle: false,
        logo: { hide: true }
    });

    jwPlayerInstance.on('error', showFallbackMessage);
    jwPlayerInstance.on('play', hideFallbackMessage);
}

function loadChannelByName(name) {
    const channel = channels.find(c => c.name === name);
    if (!channel) return;

    activeChannelName = name;
    setupChannelList();

    const config = {
        file: channel.url,
        title: channel.name,
        autostart: true
    };

    if (channel.type === 'mpd' && channel.drm) {
        config.drm = channel.drm;
    }
    
    document.title = `${channel.name} | SnapvisionXO`;

    hideFallbackMessage();
    jwPlayerInstance.setup(config);
}

function showFallbackMessage() {
    document.getElementById('fallbackMessage').style.display = 'block';
}

function hideFallbackMessage() {
    document.getElementById('fallbackMessage').style.display = 'none';
}

window.addEventListener('load', () => {
    initPlayer();
    populateCategoryDropdown();
    setupChannelList();
    updateClock();
    setInterval(updateClock, 1000);
    const loadingScreen = document.getElementById('loadingScreen');
    setTimeout(() => {
        loadingScreen.classList.add('hidden');
        setTimeout(() => {
            document.getElementById('popupOverlay').classList.add('active');
        }, 400);
    }, 4000);
});

function closePopup() {
  document.getElementById('popupOverlay').classList.remove('active');
}

window.addEventListener('beforeunload', () => {
    if (jwPlayerInstance) {
        jwPlayerInstance.remove();
    }
});

document.addEventListener('contextmenu', (e) => e.preventDefault());

function ctrlShiftKey(e, keyCode) {
    return e.ctrlKey && e.shiftKey && e.keyCode === keyCode.charCodeAt(0);
}

document.onkeydown = (e) => {
    if (
        e.keyCode === 123 ||
        ctrlShiftKey(e, 'I') ||
        ctrlShiftKey(e, 'J') ||
        ctrlShiftKey(e, 'C') ||
        (e.ctrlKey && e.keyCode === 'U'.charCodeAt(0))
    )
        return false;
};
