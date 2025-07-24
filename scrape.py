import requests
import re

headers = {
    "User-Agent": "Mozilla/5.0"
}

playlist_file = "playlist.m3u"

# Write playlist header
with open(playlist_file, "w", encoding="utf-8") as f:
    f.write("#EXTM3U\n\n")

# Load channel URLs from file
with open("channels.txt", "r", encoding="utf-8") as f:
    urls = [line.strip() for line in f if line.strip()]

for url in urls:
    try:
        print(f"[...] Processing: {url}")
        res = requests.get(url, headers=headers, timeout=15)
        html = res.text

        # Step 1: Extract iframe URL
        iframe_match = re.search(r'<iframe[^>]+src=["\']([^"\']+thetvapp[^"\']+)["\']', html)
        if not iframe_match:
            print(f"[✘] No iframe found on page: {url}")
            continue

        iframe_url = iframe_match.group(1)
        if not iframe_url.startswith("http"):
            iframe_url = "https:" + iframe_url

        # Step 2: Fetch thetvapp iframe page
        iframe_res = requests.get(iframe_url, headers=headers, timeout=15)
        iframe_html = iframe_res.text

        # Step 3: Extract full m3u8 link with token
        m3u8_match = re.search(r'(https?://[^\s"\']+\.m3u8\?[^"\']+)', iframe_html)
        if not m3u8_match:
            print(f"[✘] No m3u8 found in iframe: {iframe_url}")
            continue

        m3u8_url = m3u8_match.group(1)

        # Extract clean channel name
        slug = re.search(r'/([^/]+)/tracks', m3u8_url)
        channel_name = slug.group(1).replace('-', ' ').title() if slug else 'Unknown Channel'

        with open(playlist_file, "a", encoding="utf-8") as f:
            f.write(f'#EXTINF:-1 tvg-id="" tvg-name="{channel_name}" tvg-logo="" group-title="TVPass",{channel_name}\n{m3u8_url}\n\n')

        print(f"[✔] {channel_name} added")

    except Exception as e:
        print(f"[⚠] Error processing {url}: {e}")
