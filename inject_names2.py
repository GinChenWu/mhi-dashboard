import json, re

with open('name_map_result.json', encoding='utf-8') as f:
    d = json.load(f)

# 手動修正確定亂碼的標的名稱
manual_fixes = {
    "2353.TW": "宏碁",
    "6285.TW": "啟碁",
    "2432.TW": "倚天",
    "8349.TWO": "雷虎科",
}
d.update(manual_fixes)

# 用 \uXXXX escape 方式，確保不受任何系統編碼影響
lines = ['FALLBACK_NAME_MAP = {']
items = sorted(d.items())
for i in range(0, len(items), 3):
    chunk = items[i:i+3]
    pairs = []
    for k, v in chunk:
        # 用 ascii + unicode escape 確保安全
        k_safe = k.encode('ascii').decode('ascii')
        v_safe = v.encode('unicode_escape').decode('ascii').replace("\\'", "'")
        pairs.append(f'"{k_safe}": "{v_safe}"')
    lines.append('    ' + ', '.join(pairs) + ',')
lines.append('}')
new_map_code = '\n'.join(lines)

# 讀取 app.py 並替換
with open('app.py', encoding='utf-8') as f:
    content = f.read()

pattern = r'FALLBACK_NAME_MAP = \{.+?\}'
m = re.search(pattern, content, re.DOTALL)
if m:
    new_content = content[:m.start()] + new_map_code + content[m.end():]
    with open('app.py', 'w', encoding='utf-8') as f:
        f.write(new_content)
    print(f'Success! Injected {len(d)} entries using unicode escape')
else:
    print('ERROR: FALLBACK_NAME_MAP not found in app.py')
