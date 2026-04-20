import base64, json, re, glob, os

with open('app.py', encoding='utf-8') as f:
    text = f.read()

m = re.search(r'_NAMES_B64 = \((.+?)\)', text, re.DOTALL)
b64 = ''.join(l.strip().strip('"') for l in m.group(1).strip().split('\n'))
d = json.loads(base64.b64decode(b64).decode('utf-8'))

all_tickers = set()
for py_file in glob.glob('*.py'):
    with open(py_file, 'r', encoding='utf-8') as f:
        content = f.read()
        tickers = re.findall(r'\'(\d{4}\.TWO?)\'', content)
        tickers2 = re.findall(r'"(\d{4}\.TWO?)"', content)
        all_tickers.update(tickers)
        all_tickers.update(tickers2)

missing = all_tickers - set(d.keys())
print('Missing:', missing)
