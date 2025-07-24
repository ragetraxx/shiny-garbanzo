import re

input_file = "channels.txt"     # from your uploaded file
output_file = "channel.txt"     # the result file

with open(input_file, "r", encoding="utf-8") as f:
    content = f.read()

# Find pairs: channel name and .m3u8 link
matches = re.findall(r'#EXTINF.*?,(.*?)\s*\n(https?://[^\s]+\.m3u8[^\s]*)', content)

with open(output_file, "w", encoding="utf-8") as out:
    for name, url in matches:
        out.write(f"{name.strip()} | {url.strip()}\n")

print(f"[✔] Saved {len(matches)} entries to {output_file}")
