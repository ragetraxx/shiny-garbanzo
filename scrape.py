import requests
import re

headers = {
    "User-Agent": "Mozilla/5.0"
}

playlist_file = "playlist.m3u"

# Write M3U header
with open(playlist_file, "w", encoding="utf-8") as f:
    f.write("#EXTM3U\n\n")

with open("channels.txt", "r", encoding="utf-8") as file:
    channel_urls = [line.strip() for line in file if line.strip()]

for url in channel_urls:
    try:
        response = requests.get(url, headers=headers, timeout=10)
        html = response.text

        m3u8_match = re.search(r'(https?://[^"\']+\.m3u8[^"\']*)', html)
        if m3u8_match:
            m3u8_url = m3u8_match.group(1)
            channel_name = url.split("/")[-2]

            extinf = f'#EXTINF:-1 tvg-id="" tvg-name="{channel_name}" tvg-logo="" group-title="TVPass",{channel_name}'

            with open(playlist_file, "a", encoding="utf-8") as f:
                f.write(f"{extinf}\n{m3u8_url}\n\n")

            print(f"[✔] {channel_name} added")
        else:
            print(f"[✘] No .m3u8 link found for {url}")
    except Exception as e:
        print(f"[⚠] Error with {url}: {e}")