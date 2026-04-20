import re, base64, json

new_stocks = {
    '3363.TWO': '上詮', '3008.TW': '大立光', '6442.TW': '光聖', '4908.TWO': '前鼎', '3665.TW': '貿聯-KY',
    '6820.TWO': '連訊', '6197.TW': '佳必琪', '2303.TW': '聯電', '3105.TWO': '穩懋', '6488.TWO': '環球晶',
    '3711.TW': '日月光投控', '2301.TW': '光寶科', '2360.TW': '致茂', '6706.TW': '惠特', '7748.TWO': '和亞智慧',
    '5443.TWO': '均豪', '3587.TWO': '閎康', '3289.TWO': '宜特'
}

with open('app.py', encoding='utf-8') as f:
    text = f.read()

m = re.search(r'_NAMES_B64 = \((.+?)\)', text, re.DOTALL)
b64_old = ''.join(l.strip().strip('"') for l in m.group(1).strip().split('\n'))
d = json.loads(base64.b64decode(b64_old).decode('utf-8'))

for k, v in new_stocks.items():
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

print('Base64 updated, total items:', len(d))
