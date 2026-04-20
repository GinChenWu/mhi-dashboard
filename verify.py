import re, base64, json
c = open('app.py', encoding='utf-8').read()
m = re.search(r'_NAMES_B64 = \((.+?)\)', c, re.DOTALL)
b64 = ''.join(l.strip().strip('"') for l in m.group(1).strip().split('\n'))
d = json.loads(base64.b64decode(b64).decode('utf-8'))
for k in ['2353.TW','2376.TW','3231.TW']:
    v = d.get(k,'')
    print(k, [hex(ord(ch)) for ch in v])
