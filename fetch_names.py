import requests, io, pandas as pd, json, urllib3
urllib3.disable_warnings()

all_tickers = set([
    '2421.TW','3483.TWO','8996.TW','3017.TW','3653.TW','4543.TWO','8032.TWO','5426.TWO','3426.TWO','3013.TW','6230.TW','3324.TWO','2486.TW','3338.TW','5223.TWO','3540.TWO','2354.TW','6124.TWO','6117.TW','6275.TWO','6112.TW','6125.TWO','3071.TWO','6591.TW',
    '3450.TW','3163.TWO','3081.TWO','6414.TW','6274.TWO','4977.TW','6419.TWO','4979.TWO','2345.TW','4989.TW','3380.TW','8011.TW','3149.TW','3363.TWO','6442.TW','4909.TWO','6451.TW','3234.TWO','4908.TWO',
    '8215.TW','2465.TW','2301.TW','3231.TW','2330.TW','2308.TW','6282.TW','2376.TW','3533.TW','2353.TW','3661.TW','3005.TW','6669.TW','3693.TWO','2059.TW','6531.TW','2382.TW','2356.TW','2395.TW',
    '3006.TW','3260.TWO','2337.TW','2408.TW','8088.TWO','2432.TW','8266.TW','5289.TWO','2451.TW','8110.TW','4967.TW','4973.TWO','3228.TWO','8271.TW','2344.TW','8299.TWO','3014.TW',
    '6173.TWO','3090.TW','3026.TW','2472.TW','2456.TW','2428.TW','3624.TWO','8112.TW','2327.TW','6284.TWO','2375.TW','6155.TW','2492.TW','5328.TWO','6127.TWO','3068.TW','6204.TWO','3272.TWO','6449.TW','8043.TWO',
    '4958.TW','8150.TW','3037.TW','2367.TW','3189.TW','8046.TW','3044.TW',
    '4934.TW','3016.TW','3707.TWO','8086.TWO','2338.TW','5483.TWO','6488.TWO','3105.TWO','5425.TWO','2455.TW','6415.TW','2342.TW','8255.TWO',
    '3499.TWO','5388.TW','2412.TW','6271.TW','3596.TW','3311.TW','2312.TW','3491.TWO','6596.TWO','6426.TW','2419.TW','2383.TW','6202.TW','6213.TW','3062.TW','6285.TW','2314.TW',
    '2458.TW','2313.TW','2360.TW','2324.TW','2357.TW','2317.TW','4938.TW',
    '6532.TWO','6139.TW','3413.TW','6187.TWO','2467.TW','2404.TW','3131.TWO','1560.TW','3680.TWO','3583.TW','6196.TW','6667.TWO','8091.TWO','3498.TWO','6640.TWO','3551.TWO','5443.TWO','3587.TWO','3402.TWO',
    '4906.TW','6216.TW','3558.TWO','2332.TW','2485.TW','3704.TW',
    '2208.TW','4572.TW','8349.TWO','8033.TW','2634.TW','3004.TW','4560.TW','1342.TW','5009.TWO','2364.TW','6643.TWO','8050.TWO','8222.TW','6829.TWO','6753.TW',
    '2609.TW','2603.TW','2615.TW',
    '2612.TW','2605.TW','2606.TW','2617.TW','2613.TW','2637.TW','2601.TW','5608.TW','2607.TW','2614.TW',
    '7828.TWO','6515.TW','6683.TWO','3289.TWO','6510.TWO','6223.TWO',
    '4770.TW','1727.TW','1710.TW','1708.TW','6509.TWO','4721.TWO','4768.TWO','4739.TW','4755.TW','1711.TW','1773.TW',
])

mapping = {}
headers = {'User-Agent':'Mozilla/5.0','Accept-Language':'zh-TW','Referer':'https://isin.twse.com.tw/'}
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
                code, name = p
                key = f'{code.strip()}{ext}'
                if key in all_tickers:
                    mapping[key] = name.strip()
    except Exception as e:
        print('Error mode', mode, e)

print(f'Found {len(mapping)} names')
with open('name_map_result.json', 'w', encoding='utf-8') as f:
    json.dump(mapping, f, ensure_ascii=False, indent=2)
print('Saved to name_map_result.json')
