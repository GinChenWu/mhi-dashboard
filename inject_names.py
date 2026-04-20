import json, re

with open('name_map_result.json', encoding='utf-8') as f:
    d = json.load(f)

# 讀取 app.py
with open('app.py', encoding='utf-8') as f:
    content = f.read()

# 產生新的 FALLBACK_NAME_MAP 字串
lines = ['FALLBACK_NAME_MAP = {']
items = list(d.items())
for i in range(0, len(items), 4):
    chunk = items[i:i+4]
    row = '    ' + ', '.join(f'"{k}": "{v}"' for k, v in chunk) + ','
    lines.append(row)
lines.append('}')
new_map = '\n'.join(lines)

# 用 regex 替換舊的 FALLBACK_NAME_MAP
pattern = r'FALLBACK_NAME_MAP = \{[^}]*\}'
new_content = re.sub(pattern, new_map, content, flags=re.DOTALL)

with open('app.py', 'w', encoding='utf-8') as f:
    f.write(new_content)

print(f'Done! Replaced FALLBACK_NAME_MAP with {len(d)} entries')
