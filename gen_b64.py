import json, base64

with open('name_map_result.json', encoding='utf-8') as f:
    d = json.load(f)

# 修正已知亂碼
d['2353.TW'] = '\u5b8f\u7881'   # 宏碁
d['6285.TW'] = '\u555f\u7881'   # 啟碁
d['2432.TW'] = '\u501a\u5929'   # 倚天
d['8349.TWO'] = '\u96f7\u864e\u79d1'  # 雷虎科

blob = base64.b64encode(
    json.dumps(d, ensure_ascii=False).encode('utf-8')
).decode('ascii')

print(f'len={len(blob)}')
# 寫成可直接貼入的 Python 程式碼
lines = [f'_NAMES_B64 = (']
chunk_size = 80
for i in range(0, len(blob), chunk_size):
    lines.append(f'    "{blob[i:i+chunk_size]}"')
lines.append(')')
code = '\n'.join(lines)
with open('names_b64.txt', 'w', encoding='ascii') as f:
    f.write(code)
print('Done, saved to names_b64.txt')
