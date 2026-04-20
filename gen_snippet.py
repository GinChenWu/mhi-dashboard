import json

with open('name_map_result.json', encoding='utf-8') as f:
    d = json.load(f)

lines = ['FALLBACK_NAME_MAP = {']
items = list(d.items())
for i in range(0, len(items), 4):
    chunk = items[i:i+4]
    row = '    ' + ','.join(f'"{k}":"{v}"' for k, v in chunk) + ','
    lines.append(row)
lines.append('}')

with open('fallback_map_snippet.txt', 'w', encoding='utf-8') as f:
    f.write('\n'.join(lines))

print(f'Done, {len(d)} entries')
print('\n'.join(lines[:5]))
