import base64, json, re

with open('app.py', encoding='utf-8') as f:
    text = f.read()

m = re.search(r'_NAMES_B64 = \((.+?)\)', text, re.DOTALL)
b64 = ''.join(l.strip().strip('"') for l in m.group(1).strip().split('\n'))
d = json.loads(base64.b64decode(b64).decode('utf-8'))

updates = {
    '2454.TW': '聯發科',
    '7828.TWO': '創星',
    '6561.TWO': '泓格',
    '2456.TW': '奇力新',
    '3068.TW': '美亞',
    '8266.TW': '智基'
}

for k, v in updates.items():
    d[k] = v

s = json.dumps(d, ensure_ascii=True, separators=(',', ':'))
b64_new = base64.b64encode(s.encode('utf-8')).decode('ascii')
lines = []
for i in range(0, len(b64_new), 80):
    lines.append('    "' + b64_new[i:i+80] + '"')

replacement = '_NAMES_B64 = (\n' + '\n'.join(lines) + '\n)'
text = text[:m.start()] + replacement + text[m.end():]
with open('app.py', 'w', encoding='utf-8') as f:
    f.write(text)

print("Fixed specific ticker names in app.py")
