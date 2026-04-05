import asyncio
import sys
if sys.platform == 'win32':
    asyncio.set_event_loop_policy(asyncio.WindowsProactorEventLoopPolicy())
import streamlit as st
import pandas as pd
import plotly.graph_objects as go
import yfinance as yf
from datetime import datetime
import random
import requests
import xml.etree.ElementTree as ET
import concurrent.futures
import numpy as np

# --- Premium UI Customization ---
st.set_page_config(page_title="MHI Analytics Dashboard", layout="wide", initial_sidebar_state="expanded")
st.markdown("""
<style>
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;500;700&display=swap');
html, body, [class*="css"] {
    font-family: 'Outfit', sans-serif !important;
}
h1, h2, h3 {
    background: -webkit-linear-gradient(45deg, #FF6B6B, #4ECDC4);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    font-weight: 700;
}
.stPlotlyChart {
    border-radius: 16px;
    box-shadow: 0 10px 30px rgba(0,0,0,0.2);
    overflow: hidden;
    transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
.stPlotlyChart:hover {
    transform: translateY(-5px) scale(1.01);
}
.stDataFrame {
    border-radius: 12px;
    box-shadow: 0 4px 20px rgba(0,0,0,0.1);
    overflow: hidden;
}
</style>
""", unsafe_allow_html=True)

st.title("✨ MHI 動態市場熱度引擎")

@st.cache_data(ttl=1)
def fetch_sector_tickers(sector_name):
    from sector_mapper import SectorMapper
    mapper = SectorMapper()
    # 我們呼叫模組來動態爬這些標的
    return mapper.get_market_mapping([sector_name])[sector_name]

import urllib3
import io
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

# 常見標的中文名稱備用表（TWSE 被擋時使用）
FALLBACK_NAME_MAP = {
    "1342.TW": "\u516b\u8cab", "1560.TW": "\u4e2d\u7802", "1708.TW": "\u6771\u9e7c",
    "1710.TW": "\u6771\u806f", "1711.TW": "\u6c38\u5149", "1727.TW": "\u4e2d\u83ef\u5316",
    "1773.TW": "\u52dd\u4e00", "2059.TW": "\u5ddd\u6e56", "2208.TW": "\u53f0\u8239",
    "2301.TW": "\u5149\u5bf6\u79d1", "2308.TW": "\u53f0\u9054\u96fb", "2312.TW": "\u91d1\u5bf6",
    "2313.TW": "\u83ef\u901a", "2314.TW": "\u53f0\u63da", "2317.TW": "\u9d3b\u6d77",
    "2324.TW": "\u4ec1\u5bf6", "2327.TW": "\u570b\u5de8*", "2330.TW": "\u53f0\u7a4d\u96fb",
    "2332.TW": "\u53cb\u8a0a", "2337.TW": "\u65fa\u5b8f", "2338.TW": "\u5149\u7f69",
    "2342.TW": "\u8302\u77fd", "2344.TW": "\u83ef\u90a6\u96fb", "2345.TW": "\u667a\u90a6",
    "2353.TW": "\u5b8f\u7881", "2354.TW": "\u9d3b\u6e96", "2356.TW": "\u82f1\u696d\u9054",
    "2357.TW": "\u83ef\u78a9", "2360.TW": "\u81f4\u8302", "2364.TW": "\u502b\u98db",
    "2367.TW": "\u71ff\u83ef", "2375.TW": "\u51f1\u7f8e", "2376.TW": "\u6280\u5609",
    "2382.TW": "\u5ee3\u9054", "2383.TW": "\u53f0\u5149\u96fb", "2395.TW": "\u7814\u83ef",
    "2404.TW": "\u6f22\u5510", "2408.TW": "\u5357\u4e9e\u79d1", "2412.TW": "\u4e2d\u83ef\u96fb",
    "2419.TW": "\u4ef2\u7426", "2421.TW": "\u5efa\u6e96", "2428.TW": "\u8208\u52e4",
    "2432.TW": "\u501a\u5929", "2451.TW": "\u5275\u898b", "2455.TW": "\u5168\u65b0",
    "2458.TW": "\u7fa9\u9686", "2465.TW": "\u9e97\u81fa", "2467.TW": "\u5fd7\u8056",
    "2472.TW": "\u7acb\u9686\u96fb", "2485.TW": "\u5146\u8d6b", "2486.TW": "\u4e00\u8a6e",
    "2492.TW": "\u83ef\u65b0\u79d1", "2601.TW": "\u76ca\u822a", "2603.TW": "\u9577\u69ae",
    "2605.TW": "\u65b0\u8208", "2606.TW": "\u88d5\u6c11", "2607.TW": "\u69ae\u904b",
    "2609.TW": "\u967d\u660e", "2612.TW": "\u4e2d\u822a", "2613.TW": "\u4e2d\u6ac3",
    "2614.TW": "\u6771\u68ee", "2615.TW": "\u842c\u6d77", "2617.TW": "\u53f0\u822a",
    "2634.TW": "\u6f22\u7fd4", "2637.TW": "\u6167\u6d0b-KY", "3004.TW": "\u8c50\u9054\u79d1",
    "3005.TW": "\u795e\u57fa", "3006.TW": "\u6676\u8c6a\u79d1", "3013.TW": "\u665f\u9298\u96fb",
    "3014.TW": "\u806f\u967d", "3016.TW": "\u5609\u6676", "3017.TW": "\u5947\u92d0",
    "3026.TW": "\u79be\u4f38\u5802", "3037.TW": "\u6b23\u8208", "3044.TW": "\u5065\u9f0e",
    "3062.TW": "\u5efa\u6f22", "3071.TWO": "\u5354\u79a7", "3081.TWO": "\u806f\u4e9e",
    "3090.TW": "\u65e5\u96fb\u8cbf", "3105.TWO": "\u7a69\u61cb", "3131.TWO": "\u5f18\u5851",
    "3149.TW": "\u6b63\u9054", "3163.TWO": "\u6ce2\u82e5\u5a01", "3189.TW": "\u666f\u78a9",
    "3228.TWO": "\u91d1\u9e97\u79d1", "3231.TW": "\u7def\u5275", "3234.TWO": "\u5149\u74b0",
    "3260.TWO": "\u5a01\u525b", "3272.TWO": "\u6771\u78a9", "3289.TWO": "\u5b9c\u7279",
    "3311.TW": "\u958e\u6689", "3324.TWO": "\u96d9\u9d3b", "3338.TW": "\u6cf0\u78a9",
    "3363.TWO": "\u4e0a\u8a6e", "3380.TW": "\u660e\u6cf0", "3402.TWO": "\u6f22\u79d1",
    "3413.TW": "\u4eac\u9f0e", "3426.TWO": "\u53f0\u8208", "3450.TW": "\u806f\u921e",
    "3483.TWO": "\u529b\u81f4", "3491.TWO": "\u6607\u9054\u79d1", "3498.TWO": "\u967d\u7a0b",
    "3499.TWO": "\u74b0\u5929\u79d1", "3533.TW": "\u5609\u6fa4", "3540.TWO": "\u66dc\u8d8a",
    "3551.TWO": "\u4e16\u79be", "3558.TWO": "\u795e\u6e96", "3583.TW": "\u8f9b\u8018",
    "3587.TWO": "\u958e\u5eb7", "3596.TW": "\u667a\u6613", "3624.TWO": "\u5149\u9821",
    "3653.TW": "\u5065\u7b56", "3661.TW": "\u4e16\u82af-KY", "3680.TWO": "\u5bb6\u767b",
    "3693.TWO": "\u71df\u90a6", "3704.TW": "\u5408\u52e4\u63a7", "3707.TWO": "\u6f22\u78ca",
    "4543.TWO": "\u842c\u5728", "4560.TW": "\u5f37\u4fe1-KY", "4572.TW": "\u99d0\u9f8d",
    "4721.TWO": "\u7f8e\u742a\u746a", "4739.TW": "\u5eb7\u666e", "4755.TW": "\u4e09\u798f\u5316",
    "4768.TWO": "\u6676\u5448\u79d1\u6280", "4770.TW": "\u4e0a\u54c1", "4906.TW": "\u6b63\u6587",
    "4908.TWO": "\u524d\u9f0e", "4909.TWO": "\u65b0\u5fa9\u8208", "4934.TW": "\u592a\u6975",
    "4938.TW": "\u548c\u78a9", "4958.TW": "\u81fb\u9f0e-KY", "4967.TW": "\u5341\u9293",
    "4973.TWO": "\u5ee3\u7a4e", "4977.TW": "\u773e\u9054-KY", "4979.TWO": "\u83ef\u661f\u5149",
    "4989.TW": "\u69ae\u79d1", "5009.TWO": "\u69ae\u525b", "5223.TWO": "\u5b89\u529b-KY",
    "5289.TWO": "\u5b9c\u9f0e", "5328.TWO": "\u83ef\u5bb9", "5388.TW": "\u4e2d\u78ca",
    "5425.TWO": "\u53f0\u534a", "5426.TWO": "\u632f\u767c", "5443.TWO": "\u5747\u8c6a",
    "5483.TWO": "\u4e2d\u7f8e\u6676", "5608.TW": "\u56db\u7dad\u822a", "6112.TW": "\u9081\u9054\u7279",
    "6117.TW": "\u8fce\u5ee3", "6124.TWO": "\u696d\u5f37", "6125.TWO": "\u5ee3\u904b",
    "6127.TWO": "\u4e5d\u8c6a", "6139.TW": "\u4e9e\u7fd4", "6155.TW": "\u921e\u5bf6",
    "6173.TWO": "\u4fe1\u660c\u96fb", "6187.TWO": "\u842c\u6f64", "6196.TW": "\u5e06\u5ba3",
    "6202.TW": "\u76db\u7fa4", "6204.TWO": "\u827e\u83ef", "6213.TW": "\u806f\u8302",
    "6216.TW": "\u5c45\u6613", "6223.TWO": "\u65fa\u77fd", "6230.TW": "\u5c3c\u5f97\u79d1\u8d85\u773e",
    "6271.TW": "\u540c\u6b23\u96fb", "6274.TWO": "\u53f0\u71ff", "6275.TWO": "\u5143\u5c71",
    "6282.TW": "\u5eb7\u8212", "6284.TWO": "\u4f73\u90a6", "6285.TW": "\u555f\u7881",
    "6414.TW": "\u6a3a\u6f22", "6415.TW": "\u77fd\u529b*-KY", "6419.TWO": "\u4eac\u6668\u79d1",
    "6426.TW": "\u7d71\u65b0", "6442.TW": "\u5149\u8056", "6449.TW": "\u923a\u90a6",
    "6451.TW": "\u8a0a\u82af-KY", "6488.TWO": "\u74b0\u7403\u6676", "6509.TWO": "\u805a\u548c",
    "6510.TWO": "\u7cbe\u6e2c", "6515.TW": "\u7a4e\u5d34", "6531.TW": "\u611b\u666e*",
    "6532.TWO": "\u745e\u8018", "6591.TW": "\u52d5\u529b-KY", "6596.TWO": "\u5bec\u5b8f\u85dd\u8853",
    "6640.TWO": "\u5747\u83ef", "6643.TWO": "M31", "6667.TWO": "\u4fe1\u7d18\u79d1",
    "6669.TW": "\u7def\u7a4e", "6683.TWO": "\u96cd\u667a\u79d1\u6280", "6753.TW": "\u9f8d\u5fb7\u9020\u8239",
    "6829.TWO": "\u5343\u9644\u7cbe\u5bc6", "8011.TW": "\u53f0\u901a", "8032.TWO": "\u5149\u83f1",
    "8033.TW": "\u96f7\u864e", "8043.TWO": "\u871c\u671b\u5be6", "8046.TW": "\u5357\u96fb",
    "8050.TWO": "\u5ee3\u7a4d", "8086.TWO": "\u5b8f\u6377\u79d1", "8088.TWO": "\u54c1\u5b89",
    "8091.TWO": "\u7fd4\u540d", "8110.TW": "\u83ef\u6771", "8112.TW": "\u81f3\u4e0a",
    "8150.TW": "\u5357\u8302", "8215.TW": "\u660e\u57fa\u6750", "8222.TW": "\u5bf6\u4e00",
    "8255.TWO": "\u670b\u7a0b", "8271.TW": "\u5b87\u77bb", "8299.TWO": "\u7fa4\u806f",
    "8349.TWO": "\u96f7\u864e\u79d1", "8996.TW": "\u9ad8\u529b",
}

@st.cache_data(ttl=86400)
def get_twse_mapping():
    try:
        mapping = {}
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Accept-Language': 'zh-TW,zh;q=0.9',
            'Referer': 'https://isin.twse.com.tw/',
        }
        for mode in ['2', '4']:  # 2: 上市, 4: 上櫃
            url = f"https://isin.twse.com.tw/isin/C_public.jsp?strMode={mode}"
            res = requests.get(url, headers=headers, verify=False, timeout=10)
            res.encoding = 'big5'  # 強制指定 Big5 編碼
            df = pd.read_html(io.StringIO(res.text))[0]
            df.columns = df.iloc[0]
            df = df.iloc[1:]
            df = df.dropna(subset=['有價證券代號及名稱'])
            for val in df['有價證券代號及名稱']:
                parts = str(val).split('\u3000')
                if len(parts) == 2:
                    code, name = parts
                    ext = ".TW" if mode == '2' else ".TWO"
                    mapping[f"{code.strip()}{ext}"] = name.strip()
        # 合併 fallback（TWSE 有的優先）
        result = {**FALLBACK_NAME_MAP, **mapping}
        return result
    except Exception as e:
        print("Fetching TWSE names failed, using fallback:", e)
        return FALLBACK_NAME_MAP.copy()


NEWS_BASELINE = 0.3          # 無異常時的消息面基準分
NEWS_SPIKE_SCORE = 0.85     # 偵測到異常爆量時的消息面分數

def fetch_news_count(ticker, name):
    """
    同時抓取 1d / 7d 新聞數量。
    回傳 {'count_1d': int, 'count_7d': int}
    """
    try:
        if name == "-": name = ""
        code = ticker.split('.')[0]
        base = f"https://news.google.com/rss/search?q={code}+OR+{name}&hl=zh-TW&gl=TW&ceid=TW:zh-Hant"
        def _fetch_window(window):
            try:
                res = requests.get(base + f"&when:{window}", timeout=5)
                root = ET.fromstring(res.text)
                return len(root.findall('./channel/item'))
            except Exception:
                return 0
        return {
            'count_1d': _fetch_window('1d'),
            'count_7d': _fetch_window('7d'),
        }
    except Exception:
        return {'count_1d': 0, 'count_7d': 0}

@st.cache_data(ttl=1800)
def fetch_all_news(tickers_tuple, name_map):
    """抓取所有標的的新聞詳細列表，回傳 list of dict"""
    articles = []
    def _fetch(ticker):
        name = name_map.get(ticker, ticker.split('.')[0])
        if name == "-": name = ticker.split('.')[0]
        code = ticker.split('.')[0]
        try:
            url = f"https://news.google.com/rss/search?q={code}+OR+{name}+when:7d&hl=zh-TW&gl=TW&ceid=TW:zh-Hant"
            res = requests.get(url, timeout=5)
            root = ET.fromstring(res.text)
            items = root.findall('./channel/item')
            result = []
            for item in items[:5]:  # 每檔最多5則
                title_el = item.find('title')
                link_el  = item.find('link')
                pub_el   = item.find('pubDate')
                src_el   = item.find('source')
                result.append({
                    'ticker': ticker,
                    'name': name,
                    'title': title_el.text if title_el is not None else '(無標題)',
                    'link': link_el.text if link_el is not None else '#',
                    'pub': pub_el.text[:16] if pub_el is not None else '',
                    'source': src_el.text if src_el is not None else '未知來源',
                })
            return result
        except Exception:
            return []

    with concurrent.futures.ThreadPoolExecutor(max_workers=10) as ex:
        futures = {ex.submit(_fetch, t): t for t in tickers_tuple}
        for fut in concurrent.futures.as_completed(futures):
            articles.extend(fut.result())

    # 依發布時間排序（新 → 舊）
    try:
        articles.sort(key=lambda x: x['pub'], reverse=True)
    except Exception:
        pass
    return articles

@st.cache_data(ttl=3600)
def process_market_data(sector_name, tickers, name_map, selected_date, weights):
    w_breadth, w_capital, w_corr, w_news = weights
    if not tickers:
        return None, pd.DataFrame()
        
    # 以所選日期為基準往前抓取約 6 個月資料 (支援最長時間軸)
    end_date_str = (selected_date + pd.Timedelta(days=1)).strftime("%Y-%m-%d")
    start_date_str = (selected_date - pd.Timedelta(days=185)).strftime("%Y-%m-%d")
    
    df_data = yf.download(tickers, start=start_date_str, end=end_date_str, interval="1d", progress=False)
    
    # yfinance >= 0.2結構處理
    if len(tickers) == 1:
        close_df = pd.DataFrame(df_data['Close']).rename(columns={'Close': tickers[0]})
        vol_df = pd.DataFrame(df_data['Volume']).rename(columns={'Volume': tickers[0]})
    else:
        close_df = df_data['Close']
        vol_df = df_data['Volume']
    
    up_count = 0
    total_vol_ratio = 0
    valid_count = 0
    records = []
    
    # 併發抓取各標的今日(1d) + 週(7d) 新聞數量
    news_counts = {}
    with concurrent.futures.ThreadPoolExecutor(max_workers=10) as executor:
        future_to_tgt = {
            executor.submit(fetch_news_count, t, name_map.get(t, "-")): t for t in tickers
        }
        for future in concurrent.futures.as_completed(future_to_tgt):
            t = future_to_tgt[future]
            news_counts[t] = future.result()   # {'count_1d':N, 'count_7d':M}
    
    for ticker in tickers:
        try:
            if ticker not in close_df.columns:
                continue
                
            c_series = close_df[ticker].dropna()
            v_series = vol_df[ticker].dropna()
            
            if len(c_series) < 20: 
                continue
                
            close_today = float(c_series.iloc[-1])
            close_yesterday = float(c_series.iloc[-2])
            close_5d = float(c_series.iloc[-5]) if len(c_series) >= 5 else close_yesterday
            
            vol_today = float(v_series.iloc[-1])
            vol_yesterday = float(v_series.iloc[-2])
            ma20 = float(c_series.rolling(window=20).mean().iloc[-1])
            
            # 漲跌幅
            pct_change = ((close_today - close_yesterday) / close_yesterday) * 100
            
            # 確認站上月線
            above_ma20 = "✅" if close_today > ma20 else "❌"
            
            # 動能廣度改用近5日趨勢，避免單日波動過大導致分數歸零
            if close_today > close_5d:
                up_count += 1
                
            if vol_yesterday > 0:
                total_vol_ratio += (vol_today / vol_yesterday)
                
            valid_count += 1
            ticker_news_1d = news_counts.get(ticker, {}).get('count_1d', 0)
            ticker_news_7d = news_counts.get(ticker, {}).get('count_7d', 0)
            
            records.append({
                "代碼": ticker,
                "名稱": name_map.get(ticker) or ticker.split('.')[0],
                "最新收盤價": round(close_today, 2),
                "單日漲跌幅 (%)": round(pct_change, 2),
                "成交量差異倍數": round(vol_today / vol_yesterday, 2) if vol_yesterday > 0 else 1,
                "近7日新聞熱度 (篇)": ticker_news_7d,
                "今日新聞 (篇)": ticker_news_1d,
                "站上月線": above_ma20
            })
        except Exception as e:
            print(f"Skipping {ticker} due to error: {e}")
            continue
            
    df_records = pd.DataFrame(records)
    
    if valid_count == 0:
        return None, df_records, None
        
    breadth_score = round((up_count / valid_count), 2)  # 0~1
    capital_score = min(1.0, (total_vol_ratio / valid_count) / 2.0)  # Assuming 2.0x volume is 100% heat
    correlation_score = round(0.5 + (breadth_score * 0.4), 2)
    
    # --- 消息面異常偵測（Poisson 1-sigma 閾值）---
    # μ = 7日總量 / 7 → 每日期望值
    # σ ≈ sqrt(μ)  （Poisson 近似）
    # 若當日數量 > μ + σ → 視為異常爆量，給予高分
    spike_count = 0
    for t in tickers:
        nd = news_counts.get(t, {})
        c1 = nd.get('count_1d', 0)
        c7 = nd.get('count_7d', 0)
        mu = c7 / 7.0
        sigma = mu ** 0.5 if mu > 0 else 0
        if c1 > mu + sigma and c1 > 0:
            spike_count += 1

    spike_ratio = spike_count / valid_count if valid_count > 0 else 0
    # 族群中超過 30% 的標的出現異常爆量 → 消息面升溫
    if spike_ratio >= 0.3:
        news_score = round(NEWS_BASELINE + (NEWS_SPIKE_SCORE - NEWS_BASELINE) * spike_ratio, 3)
    else:
        news_score = NEWS_BASELINE
    news_score = round(min(1.0, news_score), 3)
    
    metrics = {
        "動能廣度": breadth_score,
        "資金參與度": capital_score,
        "族群連動": correlation_score,
        "消息面": news_score
    }
    
    mhi_total = (breadth_score * w_breadth + capital_score * w_capital +
                 correlation_score * w_corr + news_score * w_news)
    
    # --- 歷史趨勢計算（全部可用天數，前端再切片）---
    history_records = []
    max_hist = len(close_df) - 6
    if max_hist > 0:
        dates = close_df.index[-max_hist:]
        for date in dates:
            idx = close_df.index.get_loc(date)
            if isinstance(idx, slice): idx = idx.stop - 1
            elif isinstance(idx, (list, np.ndarray)): idx = idx[-1]
            if idx < 20: continue

            u_c = 0; v_c = 0; tot_vol = 0
            for t in tickers:
                if t not in close_df.columns or pd.isna(close_df[t].iloc[idx]): continue
                try:
                    c_t = close_df[t].iloc[idx]
                    c_5 = close_df[t].iloc[idx-5] if idx >= 5 else close_df[t].iloc[idx-1]
                    v_t = vol_df[t].iloc[idx]
                    v_y = vol_df[t].iloc[idx-1]
                    if c_t > c_5: u_c += 1
                    if v_y > 0: tot_vol += (v_t / v_y)
                    v_c += 1
                except: continue

            if v_c == 0: continue
            h_bre = u_c / v_c
            h_cap = min(1.0, (tot_vol / v_c) / 2.0)
            h_cor = 0.5 + (h_bre * 0.4)
            h_mhi = h_bre * w_breadth + h_cap * w_capital + h_cor * w_corr + news_score * w_news
            history_records.append({"Date": date, "MHI": round(h_mhi, 3)})

    df_history = pd.DataFrame(history_records)
    return {"total": mhi_total, "sub": metrics}, df_records, df_history

# 每個族群的代表性標的（快速掃描用，不發回全部）
PROXY_TICKERS = {
    "散熱":            ['3017.TW','2421.TW','3338.TW'],
    "矽光子":           ['3450.TW','6442.TW','4977.TW'],
    "AI 伺服器":       ['2330.TW','2382.TW','6669.TW'],
    "半導體設備":        ['3413.TW','3583.TW','6196.TW'],
    "網通設備組件":      ['2345.TW','3704.TW','3596.TW'],
    "記憶體":           ['2344.TW','2408.TW','8299.TWO'],
    "被動元件":          ['2327.TW','2492.TW','3090.TW'],
    "ABF載板":         ['3037.TW','3189.TW','8046.TW'],
    "第三代半導體":      ['3707.TWO','4934.TW','6415.TW'],
    "低軌道衛星通訊":    ['2314.TW','6285.TW','2412.TW'],
    "電子代工OEMODM":   ['2317.TW','2382.TW','2356.TW'],
    "半導體廠務與設備":  ['6196.TW','3413.TW','3583.TW'],
    "軍工":            ['2634.TW','2208.TW','6753.TW'],
    "貨櫃航運":          ['2603.TW','2609.TW','2615.TW'],
    "散裝航運":          ['2606.TW','2637.TW','2612.TW'],
    "探針卡":           ['6515.TW','6223.TWO','7828.TWO'],
    "半導體特化":        ['4755.TW','4770.TW','1710.TW'],
}

@st.cache_data(ttl=3600)
def get_hottest_sector(sectors, date_str):
    """快速掃描各族群代表標的，回傳最高熱度的族群名稱"""
    scores = {}
    end = (pd.Timestamp(date_str) + pd.Timedelta(days=1)).strftime('%Y-%m-%d')
    start = (pd.Timestamp(date_str) - pd.Timedelta(days=30)).strftime('%Y-%m-%d')

    def _score_sector(sector):
        proxy = PROXY_TICKERS.get(sector, [])
        if not proxy: return sector, 0.0
        try:
            df = yf.download(proxy, start=start, end=end, progress=False)
            if df.empty: return sector, 0.0
            close = df['Close'] if len(proxy) > 1 else df[['Close']].rename(columns={'Close': proxy[0]})
            vol   = df['Volume'] if len(proxy) > 1 else df[['Volume']].rename(columns={'Volume': proxy[0]})
            up, v_sum, cnt = 0, 0, 0
            for t in proxy:
                if t not in close.columns: continue
                c = close[t].dropna()
                v = vol[t].dropna()
                if len(c) < 6: continue
                if float(c.iloc[-1]) > float(c.iloc[-5]): up += 1
                v_y = float(v.iloc[-2])
                if v_y > 0: v_sum += float(v.iloc[-1]) / v_y
                cnt += 1
            if cnt == 0: return sector, 0.0
            bre = up / cnt
            cap = min(1.0, (v_sum / cnt) / 2.0)
            return sector, round(bre * 0.5 + cap * 0.5, 4)
        except Exception:
            return sector, 0.0

    with concurrent.futures.ThreadPoolExecutor(max_workers=8) as ex:
        results = list(ex.map(lambda s: _score_sector(s), sectors))

    scores = dict(results)
    return max(scores, key=scores.get), scores

# --- Sidebar ---
st.sidebar.header("過濾條件設定")
available_sectors = [
    "散熱", "矽光子", "AI 伺服器", "半導體設備", "網通設備組件",
    "記憶體", "被動元件", "ABF載板", "第三代半導體", "低軌道衛星通訊", 
    "電子代工OEMODM", "半導體廠務與設備", "軍工", "貨櫃航運", "散裝航運", 
    "探針卡", "半導體特化"
]

# --- Session State 初始化（必須在 selectbox 之前）---
if "removed_tickers" not in st.session_state:
    st.session_state.removed_tickers = set()
if "added_tickers" not in st.session_state:
    st.session_state.added_tickers = set()

# 首次載入：自動掃描今日最熱族群
if "hottest_sector" not in st.session_state:
    with st.spinner("⚡ 正在掃描今日熱度最高族群..."):
        today_str = datetime.now().strftime('%Y-%m-%d')
        best, all_scores = get_hottest_sector(tuple(available_sectors), today_str)
        st.session_state.hottest_sector = best
        st.session_state.sector_scores  = all_scores

default_idx = available_sectors.index(st.session_state.hottest_sector) \
    if st.session_state.hottest_sector in available_sectors else 0

selected_sector = st.sidebar.selectbox("請選擇族群名稱", available_sectors, index=default_idx)
selected_date = st.sidebar.date_input("選擇日期", datetime.now())

st.sidebar.divider()
st.sidebar.subheader("➕ 自訂額外標的")
custom_tickers_input = st.sidebar.text_input(
    "自行新增股票代碼 (可用逗號分隔)", 
    placeholder="例: 2330, 8299.TWO, 3231"
)

st.sidebar.divider()
st.sidebar.subheader("⚖️ MHI 指標權重調整")
w_b = st.sidebar.slider("動能廣度",   0.0, 1.0, 0.30, 0.05, key="w_b")
w_c = st.sidebar.slider("資金參與度", 0.0, 1.0, 0.30, 0.05, key="w_c")
w_r = st.sidebar.slider("族群連動",   0.0, 1.0, 0.20, 0.05, key="w_r")
w_n = st.sidebar.slider("消息面",     0.0, 1.0, 0.20, 0.05, key="w_n")
w_total = w_b + w_c + w_r + w_n
if abs(w_total - 1.0) > 0.01:
    st.sidebar.warning(f"⚠️ 目前總和 = {w_total:.2f}，系統將自動正規化為 1.0")
    if w_total > 0:
        w_b, w_c, w_r, w_n = w_b/w_total, w_c/w_total, w_r/w_total, w_n/w_total
weights = (round(w_b,4), round(w_c,4), round(w_r,4), round(w_n,4))

st.sidebar.info("💡 提示：更改日期後，系統將回溯至當日收盤價為基準，重新計算該日期的 MHI 熱度。")

# 切換族群時自動重置增減標的
if "last_sector" not in st.session_state or st.session_state.last_sector != selected_sector:
    st.session_state.removed_tickers = set()
    st.session_state.added_tickers = set()
    st.session_state.last_sector = selected_sector



# --- Main ---
with st.spinner(f"正在分析 {selected_sector} 相關特徵..."):
    name_map = get_twse_mapping()
    
    # 基礎清單
    base_tickers = set(fetch_sector_tickers(selected_sector))
    
    # 側邊欄手動新增
    if custom_tickers_input.strip():
        user_symbols = [s.strip() for s in custom_tickers_input.replace('，', ',').split(',') if s.strip()]
        for symbol in user_symbols:
            if "." not in symbol:
                if f"{symbol}.TW" in name_map:
                    base_tickers.add(f"{symbol}.TW")
                elif f"{symbol}.TWO" in name_map:
                    base_tickers.add(f"{symbol}.TWO")
                else:
                    base_tickers.add(f"{symbol}.TW")
            else:
                base_tickers.add(symbol.upper())

    # 套用 session_state 的增減操作
    base_tickers |= st.session_state.added_tickers
    base_tickers -= st.session_state.removed_tickers

    tickers = list(base_tickers)
    mhi_data, df_details, df_history = process_market_data(selected_sector, tuple(sorted(tickers)), name_map, selected_date, weights)


if mhi_data is None:
    st.error(f"由於無法取得足夠的行情資料，{selected_sector} 暫停計算。")
else:
    total_score = mhi_data['total']
    
    # 決定顏色
    if total_score > 0.8: color = "#FF4B4B"
    elif total_score < 0.2: color = "#1E90FF"
    elif total_score >= 0.5: color = "#00FA9A"
    else: color = "#FFA500"

    st.markdown(f"<h1 style='color:{color}; font-size:56px; border-bottom: 3px solid rgba(255,255,255,0.1); padding-bottom:10px;'>{total_score:.2f}</h1>", unsafe_allow_html=True)

    # --- 公式卡片 ---
    sub = mhi_data['sub']
    pct_b = f"{weights[0]*100:.0f}%"
    pct_c = f"{weights[1]*100:.0f}%"
    pct_r = f"{weights[2]*100:.0f}%"
    pct_n = f"{weights[3]*100:.0f}%"
    st.markdown(f"""
<div style='margin:10px 0 18px 0; padding:14px 20px;
     background:rgba(255,255,255,0.04); border-radius:12px;
     border:1px solid rgba(255,255,255,0.08); font-family:monospace;
     font-size:14px; line-height:2;'>
  <span style='color:rgba(255,255,255,0.5); font-size:12px;'>📐 MHI 計算公式（可在左側 Sidebar 調整權重）</span><br/>
  <b style='color:{color}'>MHI</b> =
  <span style='color:#4ECDC4'><b>{sub['動能廣度']:.2f}</b> × {pct_b}</span>
  &nbsp;+&nbsp;
  <span style='color:#FFD93D'><b>{sub['資金參與度']:.2f}</b> × {pct_c}</span>
  &nbsp;+&nbsp;
  <span style='color:#C77DFF'><b>{sub['族群連動']:.2f}</b> × {pct_r}</span>
  &nbsp;+&nbsp;
  <span style='color:#FF9A76'><b>{sub['消息面']:.2f}</b> × {pct_n}</span>
  &nbsp;=&nbsp;
  <b style='color:{color}; font-size:16px;'>{total_score:.3f}</b>
</div>
""", unsafe_allow_html=True)

    st.write("")
    
    col1, col2 = st.columns(2)
    
    def hex_to_rgba(hex_color, alpha):
        h = hex_color.lstrip('#')
        return f"rgba({int(h[0:2], 16)}, {int(h[2:4], 16)}, {int(h[4:6], 16)}, {alpha})"
    
    with col1:
        # 雷達圖 (Radar Chart)
        categories = list(mhi_data['sub'].keys())
        values = list(mhi_data['sub'].values())
        categories.append(categories[0])
        values.append(values[0])
        
        # 轉換透明色
        fill_color = hex_to_rgba(color, 0.4)
        
        fig_radar = go.Figure()
        fig_radar.add_trace(go.Scatterpolar(
            r=values, theta=categories, fill='toself', name='各項子指標',
            line_color=color, fillcolor=fill_color
        ))
        fig_radar.update_layout(
            polar=dict(radialaxis=dict(visible=True, range=[0, 1], gridcolor='rgba(255,255,255,0.1)'), bgcolor='rgba(0,0,0,0)'),
            showlegend=False, height=350, margin=dict(l=20, r=20, t=40, b=20),
            title=dict(text="子指標特徵雷達", font=dict(family="Outfit", size=20)),
            paper_bgcolor='rgba(0,0,0,0)', plot_bgcolor='rgba(0,0,0,0)'
        )
        st.plotly_chart(fig_radar, config={'displayModeBar': False})

    with col2:
        # 歷史趨勢折線圖
        fig_trend = go.Figure()
        # 時間軸選擇器（以日曆天數往前推，自動過濾非交易日）
        time_offsets = {
            "1週": 7, "2週": 14, "1個月": 31, "2個月": 62,
            "3個月": 93, "6個月": 186
        }
        selected_range = st.radio(
            "時間軸", list(time_offsets.keys()),
            index=2, horizontal=True, key="trend_range"
        )
        offset_days = time_offsets[selected_range]

        # 用實際交易日日期過濾，不依賴固定天數 tail()
        if df_history is not None and not df_history.empty:
            cutoff = df_history['Date'].max() - pd.Timedelta(days=offset_days)
            df_trend = df_history[df_history['Date'] >= cutoff].copy()
            actual_days = len(df_trend)
        else:
            df_trend = pd.DataFrame()
            actual_days = 0


        fig_trend = go.Figure()
        if not df_trend.empty:
            df_trend = df_trend.reset_index(drop=True)
            x_idx   = df_trend.index.tolist()
            x_dates = df_trend['Date'].dt.strftime('%m/%d').tolist()
            full_dates = df_trend['Date'].dt.strftime('%Y-%m-%d').tolist()

            trend_fill = hex_to_rgba(color, 0.15)
            fig_trend.add_trace(go.Scatter(
                x=x_idx, y=df_trend['MHI'],
                mode='lines+markers',
                line=dict(color=color, width=3, shape='spline'),
                marker=dict(size=7, color=color, line=dict(width=2, color='white')),
                fill='tozeroy',
                fillcolor=trend_fill,
                customdata=full_dates,
                hovertemplate='%{customdata}<br>MHI: <b>%{y:.3f}</b><extra></extra>'
            ))
            fig_trend.add_hline(y=0.5, line_dash="dash", line_color="rgba(255,255,255,0.2)", annotation_text="中線 0.5")
            fig_trend.add_hline(y=0.8, line_dash="dot",  line_color="rgba(255,80,80,0.4)",   annotation_text="過熱 0.8")

            # 自動控制 tick 密度，避免標籤重疊
            n = len(x_idx)
            tick_step = max(1, n // 8)
            tick_vals = x_idx[::tick_step]
            tick_text = x_dates[::tick_step]
        else:
            tick_vals, tick_text = [], []

        fig_trend.update_layout(
            height=350, margin=dict(l=20, r=20, t=40, b=20),
            title=dict(text=f"熱度演變趨勢 ({selected_range}・{actual_days} 個交易日)", font=dict(family="Outfit", size=20)),
            yaxis=dict(range=[0, 1], gridcolor='rgba(255,255,255,0.1)'),
            xaxis=dict(
                tickmode='array', tickvals=tick_vals, ticktext=tick_text,
                gridcolor='rgba(255,255,255,0.08)', showgrid=True,
                showline=False
            ),
            paper_bgcolor='rgba(0,0,0,0)', plot_bgcolor='rgba(0,0,0,0)',
            hovermode="x unified"
        )
        st.plotly_chart(fig_trend, config={'displayModeBar': False})
        
    st.subheader(f"📊 {selected_sector} 標的清單原始明細 ({len(df_details)} 檔)")

    # --- 批量操作工具列 ---
    if not df_details.empty:
        visible_tickers = [row["代碼"] for _, row in df_details.iterrows()
                           if row["代碼"] not in st.session_state.removed_tickers]

        # 使用 st.form：勾 checkbox 不會觸發重算，按提交才會
        with st.form(key="ticker_form", border=False):
            # 表頭工具列
            bulk_col1, bulk_col2, bulk_col3, _ = st.columns([1.3, 1.5, 1.5, 5.7])
            bulk_col1.form_submit_button("☑️ 全選", on_click=lambda: None, disabled=True)  # 純視覺佔位，全選用下方邏輯
            submit_delete = bulk_col3.form_submit_button("🗑️ 刪除勾選", type="primary", use_container_width=True)

            st.divider()

            # 欄位標頭
            header_cols = st.columns([0.5, 1.2, 1.8, 1.2, 1.0, 1.0, 1.4, 0.8, 0.8])
            for col, h in zip(header_cols, ["", "代碼", "名稱", "收盤價", "漲跌幅(%)", "量差倍數", "今日/7日新聞", "月線", "單刪"]):
                col.markdown(f"**{h}**")
            st.divider()

            check_state = {}
            for _, row in df_details.iterrows():
                ticker = row["代碼"]
                if ticker in st.session_state.removed_tickers:
                    continue
                r_cols = st.columns([0.5, 1.2, 1.8, 1.2, 1.0, 1.0, 1.4, 0.8, 0.8])
                check_state[ticker] = r_cols[0].checkbox(
                    "", key=f"chk_{ticker}", label_visibility="collapsed"
                )
                r_cols[1].write(ticker)
                r_cols[2].markdown(row["名稱"])
                r_cols[3].write(f"{row['最新收盤價']}")
                pct = row["單日漲跌幅 (%)"]
                r_cols[4].write(f"{'🟢' if pct >= 0 else '🔴'} {pct:.2f}%")
                r_cols[5].write(f"{row['成交量差異倍數']:.2f}x")
                news_7d = int(row.get('近7日新聞熱度 (篇)', 0))
                news_1d = int(row.get('今日新聞 (篇)', 0))
                mu = news_7d / 7.0
                sigma = mu ** 0.5 if mu > 0 else 0
                is_spike = news_1d > mu + sigma and news_1d > 0
                spike_tag = " 🔥" if is_spike else ""
                r_cols[6].write(f"📰 {news_1d}/{news_7d}篇{spike_tag}")
                r_cols[7].write(row["站上月線"])

            # 表單底部也放一個刪除按鈕，方便不用滾回頂部
            st.divider()
            bottom_delete = st.form_submit_button("🗑️ 刪除所有勾選的標的", type="primary", use_container_width=True)

        # form 提交後才觸發刪除 + 重算
        if submit_delete or bottom_delete:
            to_remove = {t for t, checked in check_state.items() if checked}
            if to_remove:
                st.session_state.removed_tickers |= to_remove
                st.rerun()

        # 表格外的逐列「立即單刪」❌（不在 form 裡，點擊立即生效）
        st.caption("💡 勾選後按「刪除勾選」一次移除；或直接點各列 ❌ 立即移除單筆")

        # 快速全選 / 取消全選（在 form 外，不影響重算）
        sel1, sel2, _ = st.columns([1.3, 1.5, 7.2])
        if sel1.button("☑️ 全選", key="select_all"):
            # 透過預填 session_state 的方式在下次渲染時讓 checkbox 預設為勾選
            # Streamlit form checkbox 不支援動態預設，改用提示
            st.toast("請在表格內手動全勾後按刪除", icon="ℹ️")
        if sel2.button("🔲 取消全選", key="deselect_all"):
            st.toast("重新整理頁面即可清空勾選", icon="ℹ️")



    st.divider()

    # --- 新增標的區塊 ---
    st.markdown("#### ➕ 在此族群手動新增標的")
    add_col1, add_col2 = st.columns([3, 1])
    new_ticker_input = add_col1.text_input("輸入股票代碼（如 2330 或 NVDA）", key="add_ticker_input", label_visibility="collapsed", placeholder="輸入代碼後按「新增」...")
    if add_col2.button("＋ 新增", use_container_width=True):
        symbol = new_ticker_input.strip()
        if symbol:
            if "." not in symbol:
                if f"{symbol}.TW" in name_map:
                    st.session_state.added_tickers.add(f"{symbol}.TW")
                elif f"{symbol}.TWO" in name_map:
                    st.session_state.added_tickers.add(f"{symbol}.TWO")
                else:
                    st.session_state.added_tickers.add(f"{symbol}.TW")
            else:
                st.session_state.added_tickers.add(symbol.upper())
            st.rerun()

    # 顯示已移除 / 已新增的快速摘要
    if st.session_state.removed_tickers:
        st.caption(f"⚠️ 已從本次計算移除：{', '.join(st.session_state.removed_tickers)}")
    if st.session_state.added_tickers:
        st.caption(f"✅ 已手動新增：{', '.join(st.session_state.added_tickers)}")
    if st.session_state.removed_tickers or st.session_state.added_tickers:
        if st.button("🔄 重置為原始清單"):
            st.session_state.removed_tickers = set()
            st.session_state.added_tickers = set()
            st.rerun()

    # ── 新聞牆 ──────────────────────────────────────────────
    st.divider()
    st.subheader("📰 近7日相關新聞")
    news_tickers = tuple(sorted(tickers))
    with st.spinner("正在抓取各標的最新新聞..."):
        all_news = fetch_all_news(news_tickers, name_map)

    if not all_news:
        st.info("目前查無相關新聞。")
    else:
        # 篩選器
        filter_col1, filter_col2 = st.columns([2, 4])
        filter_names = ["全部標的"] + sorted(list({a['name'] for a in all_news}))
        filter_sel = filter_col1.selectbox("篩選標的", filter_names, key="news_filter")
        keyword = filter_col2.text_input("關鍵字搜尋", placeholder="輸入關鍵字過濾新聞標題...", key="news_kw", label_visibility="collapsed")

        filtered = all_news
        if filter_sel != "全部標的":
            filtered = [a for a in filtered if a['name'] == filter_sel]
        if keyword.strip():
            filtered = [a for a in filtered if keyword.strip().lower() in a['title'].lower()]

        st.caption(f"共 {len(filtered)} 則新聞")
        st.write("")

        for art in filtered:
            tag_color = "#4ECDC4"
            st.markdown(
                f"""
<div style='padding:12px 16px; margin-bottom:10px;
     border-left:4px solid {tag_color};
     background:rgba(255,255,255,0.04);
     border-radius:0 8px 8px 0;'>
  <span style='font-size:11px; color:{tag_color}; font-weight:600;
               letter-spacing:1px;'>{art['name']} ({art['ticker']})</span>
  &nbsp;·&nbsp;
  <span style='font-size:11px; color:rgba(255,255,255,0.45);'>{art['source']}</span>
  &nbsp;·&nbsp;
  <span style='font-size:11px; color:rgba(255,255,255,0.4);'>{art['pub']}</span><br/>
  <a href='{art['link']}' target='_blank'
     style='font-size:14px; color:white; text-decoration:none; font-weight:500;
            line-height:1.5;'>
    {art['title']}
  </a>
</div>""",
                unsafe_allow_html=True
            )
