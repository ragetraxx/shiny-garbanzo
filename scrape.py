import requests
import re

# Input M3U URL
m3u_url = "https://tvpass.org/playlist/m3u"
output_file = "channel.txt"

try:
    res = requests.get(m3u_url, timeout=15)
    content = res.text

    # Find all channel name + m3u8 link pairs
    matches = re.findall(r'#EXTINF.*?,(.*?)\s*\n(https?://[^\s]+\.m3u8[^\s]*)', content)

    with open(output_file, "w", encoding="utf-8") as f:
        for name, url in matches:
            f.write(f"{name.strip()} | {url.strip()}\n")

    print(f"[✔] Extracted {len(matches)} entries to {output_file}")

except Exception as e:
    print(f"[✘] Failed to fetch or process playlist: {e}")
