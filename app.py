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
import os
import json

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

# 備用名稱表（base64 encoded JSON，避免任何 Windows/Linux 編碼差異）
import base64 as _b64
_NAMES_B64 = (
    "eyIxMzQyLlRXIjogIuWFq+iyqyIsICIxNTYwLlRXIjogIuS4reeggiIsICIxNzA4LlRXIjogIuadsem5"
    "vCIsICIxNzEwLlRXIjogIuadseiBryIsICIxNzExLlRXIjogIuawuOWFiSIsICIxNzI3LlRXIjogIuS4"
    "reiPr+WMliIsICIxNzczLlRXIjogIuWLneS4gCIsICIyMDU5LlRXIjogIuW3nea5liIsICIyMjA4LlRX"
    "IjogIuWPsOiIuSIsICIyMzAxLlRXIjogIuWFieWvtuenkSIsICIyMzA4LlRXIjogIuWPsOmBlOmbuyIs"
    "ICIyMzEyLlRXIjogIumHkeWvtiIsICIyMzEzLlRXIjogIuiPr+mAmiIsICIyMzE0LlRXIjogIuWPsOaP"
    "miIsICIyMzE3LlRXIjogIum0u+a1tyIsICIyMzI0LlRXIjogIuS7geWvtiIsICIyMzI3LlRXIjogIuWc"
    "i+W3qCoiLCAiMjMzMC5UVyI6ICLlj7DnqY3pm7siLCAiMjMzMi5UVyI6ICLlj4voqIoiLCAiMjMzNy5U"
    "VyI6ICLml7rlro8iLCAiMjMzOC5UVyI6ICLlhYnnvakiLCAiMjM0Mi5UVyI6ICLojILnn70iLCAiMjM0"
    "NC5UVyI6ICLoj6/pgqbpm7siLCAiMjM0NS5UVyI6ICLmmbrpgqYiLCAiMjM1My5UVyI6ICLlro/nooEi"
    "LCAiMjM1NC5UVyI6ICLptLvmupYiLCAiMjM1Ni5UVyI6ICLoi7Hmpa3pgZQiLCAiMjM1Ny5UVyI6ICLo"
    "j6/noqkiLCAiMjM2MC5UVyI6ICLoh7TojIIiLCAiMjM2NC5UVyI6ICLlgKvpo5siLCAiMjM2Ny5UVyI6"
    "ICLnh7/oj68iLCAiMjM3NS5UVyI6ICLlh7Hnvo4iLCAiMjM3Ni5UVyI6ICLmioDlmIkiLCAiMjM4Mi5U"
    "VyI6ICLlu6PpgZQiLCAiMjM4My5UVyI6ICLlj7DlhYnpm7siLCAiMjM5NS5UVyI6ICLnoJToj68iLCAi"
    "MjQwNC5UVyI6ICLmvKLllJAiLCAiMjQwOC5UVyI6ICLljZfkup7np5EiLCAiMjQxMi5UVyI6ICLkuK3o"
    "j6/pm7siLCAiMjQxOS5UVyI6ICLku7LnkKYiLCAiMjQyMS5UVyI6ICLlu7rmupYiLCAiMjQyOC5UVyI6"
    "ICLoiIjli6QiLCAiMjQ1MS5UVyI6ICLlibXoposiLCAiMjQ1NS5UVyI6ICLlhajmlrAiLCAiMjQ1OC5U"
    "VyI6ICLnvqnpmoYiLCAiMjQ2NS5UVyI6ICLpupfoh7oiLCAiMjQ2Ny5UVyI6ICLlv5fogZYiLCAiMjQ3"
    "Mi5UVyI6ICLnq4vpmobpm7siLCAiMjQ4NS5UVyI6ICLlhYbotasiLCAiMjQ4Ni5UVyI6ICLkuIDoqa4i"
    "LCAiMjQ5Mi5UVyI6ICLoj6/mlrDnp5EiLCAiMjYwMS5UVyI6ICLnm4roiKoiLCAiMjYwMy5UVyI6ICLp"
    "lbfmpq4iLCAiMjYwNS5UVyI6ICLmlrDoiIgiLCAiMjYwNi5UVyI6ICLoo5XmsJEiLCAiMjYwNy5UVyI6"
    "ICLmpq7pgYsiLCAiMjYwOS5UVyI6ICLpmb3mmI4iLCAiMjYxMi5UVyI6ICLkuK3oiKoiLCAiMjYxMy5U"
    "VyI6ICLkuK3mq4MiLCAiMjYxNC5UVyI6ICLmnbHmo64iLCAiMjYxNS5UVyI6ICLokKzmtbciLCAiMjYx"
    "Ny5UVyI6ICLlj7DoiKoiLCAiMjYzNC5UVyI6ICLmvKLnv5QiLCAiMjYzNy5UVyI6ICLmhafmtIstS1ki"
    "LCAiMzAwNC5UVyI6ICLosZDpgZTnp5EiLCAiMzAwNS5UVyI6ICLnpZ7ln7oiLCAiMzAwNi5UVyI6ICLm"
    "mbbosarnp5EiLCAiMzAxMy5UVyI6ICLmmZ/pipjpm7siLCAiMzAxNC5UVyI6ICLoga/pmb0iLCAiMzAx"
    "Ni5UVyI6ICLlmInmmbYiLCAiMzAxNy5UVyI6ICLlpYfpi5AiLCAiMzAyNi5UVyI6ICLnpr7kvLjloIIi"
    "LCAiMzAzNy5UVyI6ICLmrKPoiIgiLCAiMzA0NC5UVyI6ICLlgaXpvI4iLCAiMzA2Mi5UVyI6ICLlu7rm"
    "vKIiLCAiMzA5MC5UVyI6ICLml6Xpm7vosr8iLCAiMzE0OS5UVyI6ICLmraPpgZQiLCAiMzE4OS5UVyI6"
    "ICLmma/noqkiLCAiMzIzMS5UVyI6ICLnt6/libUiLCAiMzMxMS5UVyI6ICLplo7mmokiLCAiMzMzOC5U"
    "VyI6ICLms7DnoqkiLCAiMzM4MC5UVyI6ICLmmI7ms7AiLCAiMzQxMy5UVyI6ICLkuqzpvI4iLCAiMzQ1"
    "MC5UVyI6ICLoga/piJ4iLCAiMzUzMy5UVyI6ICLlmInmvqQiLCAiMzU4My5UVyI6ICLovpvogJgiLCAi"
    "MzU5Ni5UVyI6ICLmmbrmmJMiLCAiMzY1My5UVyI6ICLlgaXnrZYiLCAiMzY2MS5UVyI6ICLkuJboiq8t"
    "S1kiLCAiMzcwNC5UVyI6ICLlkIjli6TmjqciLCAiNDU2MC5UVyI6ICLlvLfkv6EtS1kiLCAiNDU3Mi5U"
    "VyI6ICLpp5Dpvo0iLCAiNDczOS5UVyI6ICLlurfmma4iLCAiNDc1NS5UVyI6ICLkuInnpo/ljJYiLCAi"
    "NDc3MC5UVyI6ICLkuIrlk4EiLCAiNDkwNi5UVyI6ICLmraPmlociLCAiNDkzNC5UVyI6ICLlpKrmpbUi"
    "LCAiNDkzOC5UVyI6ICLlkoznoqkiLCAiNDk1OC5UVyI6ICLoh7vpvI4tS1kiLCAiNDk2Ny5UVyI6ICLl"
    "jYHpipMiLCAiNDk3Ny5UVyI6ICLnnL7pgZQtS1kiLCAiNDk4OS5UVyI6ICLmpq7np5EiLCAiNTM4OC5U"
    "VyI6ICLkuK3no4oiLCAiNTYwOC5UVyI6ICLlm5vntq3oiKoiLCAiNjExMi5UVyI6ICLpgoHpgZTnibki"
    "LCAiNjExNy5UVyI6ICLov47lu6MiLCAiNjEzOS5UVyI6ICLkup7nv5QiLCAiNjE1NS5UVyI6ICLpiJ7l"
    "r7YiLCAiNjE5Ni5UVyI6ICLluIblrqMiLCAiNjIwMi5UVyI6ICLnm5vnvqQiLCAiNjIxMy5UVyI6ICLo"
    "ga/ojIIiLCAiNjIxNi5UVyI6ICLlsYXmmJMiLCAiNjIzMC5UVyI6ICLlsLzlvpfnp5HotoXnnL4iLCAi"
    "NjI3MS5UVyI6ICLlkIzmrKPpm7siLCAiNjI4Mi5UVyI6ICLlurfoiJIiLCAiNjI4NS5UVyI6ICLllZ/n"
    "ooEiLCAiNjQxNC5UVyI6ICLmqLrmvKIiLCAiNjQxNS5UVyI6ICLnn73lipsqLUtZIiwgIjY0MjYuVFci"
    "OiAi57Wx5pawIiwgIjY0NDIuVFciOiAi5YWJ6IGWIiwgIjY0NDkuVFciOiAi6Yi66YKmIiwgIjY0NTEu"
    "VFciOiAi6KiK6IqvLUtZIiwgIjY1MTUuVFciOiAi56mO5bS0IiwgIjY1MzEuVFciOiAi5oSb5pmuKiIs"
    "ICI2NTkxLlRXIjogIuWLleWKmy1LWSIsICI2NjY5LlRXIjogIue3r+epjiIsICI2NzUzLlRXIjogIum+"
    "jeW+t+mAoOiIuSIsICI4MDExLlRXIjogIuWPsOmAmiIsICI4MDMzLlRXIjogIumbt+iZjiIsICI4MDQ2"
    "LlRXIjogIuWNl+mbuyIsICI4MTEwLlRXIjogIuiPr+adsSIsICI4MTEyLlRXIjogIuiHs+S4iiIsICI4"
    "MTUwLlRXIjogIuWNl+iMgiIsICI4MjE1LlRXIjogIuaYjuWfuuadkCIsICI4MjIyLlRXIjogIuWvtuS4"
    "gCIsICI4MjcxLlRXIjogIuWuh+eeuyIsICI4OTk2LlRXIjogIumrmOWKmyIsICIyNDMyLlRXIjogIuWA"
    "muWkqSIsICIzMDcxLlRXTyI6ICLljZTnpqciLCAiMzA4MS5UV08iOiAi6IGv5LqeIiwgIjMxMDUuVFdP"
    "IjogIuepqeaHiyIsICIzMTMxLlRXTyI6ICLlvJjloZEiLCAiMzE2My5UV08iOiAi5rOi6Iul5aiBIiwg"
    "IjMyMjguVFdPIjogIumHkem6l+enkSIsICIzMjM0LlRXTyI6ICLlhYnnkrAiLCAiMzI2MC5UV08iOiAi"
    "5aiB5YmbIiwgIjMyNzIuVFdPIjogIuadseeiqSIsICIzMjg5LlRXTyI6ICLlrpznibkiLCAiMzMyNC5U"
    "V08iOiAi6ZuZ6bS7IiwgIjMzNjMuVFdPIjogIuS4iuipriIsICIzNDAyLlRXTyI6ICLmvKLnp5EiLCAi"
    "MzQyNi5UV08iOiAi5Y+w6IiIIiwgIjM0ODMuVFdPIjogIuWKm+iHtCIsICIzNDkxLlRXTyI6ICLmmIfp"
    "gZTnp5EiLCAiMzQ5OC5UV08iOiAi6Zm956iLIiwgIjM0OTkuVFdPIjogIueSsOWkqeenkSIsICIzNTQw"
    "LlRXTyI6ICLmm5zotooiLCAiMzU1MS5UV08iOiAi5LiW56a+IiwgIjM1NTguVFdPIjogIuelnua6liIs"
    "ICIzNTg3LlRXTyI6ICLplo7lurciLCAiMzYyNC5UV08iOiAi5YWJ6aChIiwgIjM2ODAuVFdPIjogIuWu"
    "tueZuyIsICIzNjkzLlRXTyI6ICLnh5/pgqYiLCAiMzcwNy5UV08iOiAi5ryi56OKIiwgIjQ1NDMuVFdP"
    "IjogIuiQrOWcqCIsICI0NzIxLlRXTyI6ICLnvo7nkKrnkaoiLCAiNDc2OC5UV08iOiAi5pm25ZGI56eR"
    "5oqAIiwgIjQ5MDguVFdPIjogIuWJjem8jiIsICI0OTA5LlRXTyI6ICLmlrDlvqnoiIgiLCAiNDk3My5U"
    "V08iOiAi5buj56mOIiwgIjQ5NzkuVFdPIjogIuiPr+aYn+WFiSIsICI1MDA5LlRXTyI6ICLmpq7liZsi"
    "LCAiNTIyMy5UV08iOiAi5a6J5YqbLUtZIiwgIjUyODkuVFdPIjogIuWunOm8jiIsICI1MzI4LlRXTyI6"
    "ICLoj6/lrrkiLCAiNTQyNS5UV08iOiAi5Y+w5Y2KIiwgIjU0MjYuVFdPIjogIuaMr+eZvCIsICI1NDQz"
    "LlRXTyI6ICLlnYfosaoiLCAiNTQ4My5UV08iOiAi5Lit576O5pm2IiwgIjYxMjQuVFdPIjogIualreW8"
    "tyIsICI2MTI1LlRXTyI6ICLlu6PpgYsiLCAiNjEyNy5UV08iOiAi5Lmd6LGqIiwgIjYxNzMuVFdPIjog"
    "IuS/oeaYjOmbuyIsICI2MTg3LlRXTyI6ICLokKzmvaQiLCAiNjIwNC5UV08iOiAi6Im+6I+vIiwgIjYy"
    "MjMuVFdPIjogIuaXuuefvSIsICI2Mjc0LlRXTyI6ICLlj7Dnh78iLCAiNjI3NS5UV08iOiAi5YWD5bGx"
    "IiwgIjYyODQuVFdPIjogIuS9s+mCpiIsICI2NDE5LlRXTyI6ICLkuqzmmajnp5EiLCAiNjQ4OC5UV08i"
    "OiAi55Kw55CD5pm2IiwgIjY1MDkuVFdPIjogIuiBmuWSjCIsICI2NTEwLlRXTyI6ICLnsr7muKwiLCAi"
    "NjUzMi5UV08iOiAi55Ge6ICYIiwgIjY1OTYuVFdPIjogIuWvrOWuj+iXneihkyIsICI2NjQwLlRXTyI6"
    "ICLlnYfoj68iLCAiNjY0My5UV08iOiAiTTMxIiwgIjY2NjcuVFdPIjogIuS/oee0mOenkSIsICI2Njgz"
    "LlRXTyI6ICLpm43mmbrnp5HmioAiLCAiNjgyOS5UV08iOiAi5Y2D6ZmE57K+5a+GIiwgIjgwMzIuVFdP"
    "IjogIuWFieiPsSIsICI4MDQzLlRXTyI6ICLonJzmnJvlr6YiLCAiODA1MC5UV08iOiAi5buj56mNIiwg"
    "IjgwODYuVFdPIjogIuWuj+aNt+enkSIsICI4MDg4LlRXTyI6ICLlk4HlrokiLCAiODA5MS5UV08iOiAi"
    "57+U5ZCNIiwgIjgyNTUuVFdPIjogIuaci+eoiyIsICI4Mjk5LlRXTyI6ICLnvqToga8iLCAiODM0OS5U"
    "V08iOiAi6Zu36JmO56eRIn0="
)
FALLBACK_NAME_MAP = json.loads(_b64.b64decode(_NAMES_B64).decode('utf-8'))




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
        # 合併 fallback（FALLBACK 優先，避免 TWSE 回傳亂碼覆蓋正確名稱）
        result = {**mapping, **FALLBACK_NAME_MAP}
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
        # Google News RSS 有 100 篇上限。若雙雙觸頂，代表該標的熱度極高（如台積電），但無法算作短期爆量突刺，排除假訊號。
        if c1 >= 100 and c7 >= 100:
            continue
            
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
                
                # 處理 RSS 上限 100 篇的視覺顯示與防呆
                is_capped = (news_1d >= 100 and news_7d >= 100)
                
                if is_capped:
                    is_spike = False
                    news_1d_str = "100+"
                    news_7d_str = "100+"
                else:
                    mu = news_7d / 7.0
                    sigma = mu ** 0.5 if mu > 0 else 0
                    is_spike = news_1d > mu + sigma and news_1d > 0
                    news_1d_str = "100+" if news_1d >= 100 else str(news_1d)
                    news_7d_str = "100+" if news_7d >= 100 else str(news_7d)

                spike_tag = " 🔥" if is_spike else ""
                r_cols[6].write(f"📰 {news_1d_str}/{news_7d_str}篇{spike_tag}")
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
