import requests
import re

headers = {
    "User-Agent": "Mozilla/5.0"
}

playlist_file = "playlist.m3u"

# Write playlist header
with open(playlist_file, "w", encoding="utf-8") as f:
    f.write("#EXTM3U\n\n")

# Load channel page URLs
with open("channels.txt", "r", encoding="utf-8") as f:
    urls = [line.strip() for line in f if line.strip()]

for url in urls:
    try:
        res = requests.get(url, headers=headers, timeout=15)
        html = res.text

        # Match full tokenized m3u8 URL
        match = re.search(r'(https?://[^\s"\']+\.m3u8\?[^"\']+)', html)
        if match:
            m3u8_url = match.group(1)

            # Extract clean channel name from URL path (e.g., 'fanduel-sports-network-socal')
            slug = re.search(r'/([^/]+)/tracks', m3u8_url)
            channel_name = slug.group(1).replace('-', ' ').title() if slug else 'Unknown Channel'

            with open(playlist_file, "a", encoding="utf-8") as f:
                f.write(f'#EXTINF:-1 tvg-id="" tvg-name="{channel_name}" tvg-logo="" group-title="TVPass",{channel_name}\n{m3u8_url}\n\n')

            print(f"[✔] {channel_name} added")
        else:
            print(f"[✘] No m3u8 found for: {url}")
    except Exception as e:
        print(f"[⚠] Error fetching {url}: {e}")
