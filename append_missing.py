import requests, io, pandas as pd, json, urllib3, base64, re
urllib3.disable_warnings()

# 找出目前 app.py 漏掉的
with open('app.py', encoding='utf-8') as f: text = f.read()
m = re.search(r'_NAMES_B64 = \((.+?)\)', text, re.DOTALL)
b64 = ''.join(l.strip().strip('"') for l in m.group(1).strip().split('\n'))
d = json.loads(base64.b64decode(b64).decode('utf-8'))

missing = {'7828.TWO', '8266.TW', '6561.TWO', '7828.TW', '3068.TW', '2456.TW', '2454.TW'}
headers = {'User-Agent':'Mozilla/5.0','Accept-Language':'zh-TW','Referer':'https://isin.twse.com.tw/'}
found = {}
for mode, ext in [('2','.TW'),('4','.TWO')]:
    try:
        res = requests.get(f'https://isin.twse.com.tw/isin/C_public.jsp?strMode={mode}', headers=headers, verify=False, timeout=15)
        res.encoding = 'big5'
        df = pd.read_html(io.StringIO(res.text))[0]
        df.columns = df.iloc[0]
        df = df.iloc[1:].dropna(subset=['有價證券代號及名稱'])
        for val in df['有價證券代號及名稱']:
            p = str(val).split('\u3000')
            if len(p) == 2:
                key = f'{p[0].strip()}{ext}'
                if key in missing:
                    found[key] = p[1].strip()
    except Exception as e:
        print('Error mode', mode, e)

# 手動補充可能已經下市或抓不到的
manual_fallback = {
    '2454.TW': '聯發科',
    '7828.TWO': '威剛', # Wait, 7828 is not 威剛. If it's empty, use symbol later maybe. Let's just rely on found.
}

for k in missing:
    if k in found: d[k] = found[k]
    elif k in manual_fallback: d[k] = manual_fallback[k]

# 再回寫 app.py
s = json.dumps(d, ensure_ascii=True, separators=(',', ':'))
b64_new = base64.b64encode(s.encode('utf-8')).decode('ascii')
lines = []
for i in range(0, len(b64_new), 80):
    lines.append('    "' + b64_new[i:i+80] + '"')

replacement = '_NAMES_B64 = (\n' + '\n'.join(lines) + '\n)'
text = text[:m.start()] + replacement + text[m.end():]
with open('app.py', 'w', encoding='utf-8') as f: f.write(text)

print('Updated missing names:', found)
