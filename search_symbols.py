import urllib.request, json, urllib.parse

def search(query):
    try:
        url = 'https://query1.finance.yahoo.com/v1/finance/search?q=' + urllib.parse.quote(query) + '&lang=en-US&region=US&quotesCount=3'
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        res = urllib.request.urlopen(req)
        data = json.loads(res.read())
        for q in data.get('quotes', []):
            if q.get('symbol', '').endswith(('.TW', '.TWO')):
                return q['symbol'], q.get('shortname', '')
    except Exception as e:
        pass
    return None, None

companies = ['上詮', '大根', '光聖', '前鼎', '貿聯', '誼虹科技', '連訊', '佳必琪', '聯電', '穩懋', '環球晶', '先發電光', '日月光', '光寶', '致茂', '惠特', '和亞', '顥天', '達裕科技', '均豪', '澤群科技', '創技工業', '閎康', '宜特', '思衛科技', '長洛國際']
res = {}
for c in companies:
    sym, name = search(c)
    if sym:
        res[c] = sym
        print(f'{c}: {sym} ({name})')
    else:
        print(f'{c}: Not found')

import openapi_client # just a placeholder to fail if needed
