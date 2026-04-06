import re
import random
import asyncio
import sys
import os

try:
    from bs4 import BeautifulSoup
    from playwright.sync_api import sync_playwright
    PLAYWRIGHT_AVAILABLE = True
except ImportError:
    PLAYWRIGHT_AVAILABLE = False

# Windows 環境下使用 subprocess_exec 需設定
if sys.platform == 'win32':
    try:
        asyncio.set_event_loop_policy(asyncio.WindowsProactorEventLoopPolicy())
    except Exception:
        pass

class SectorMapper:
    def __init__(self):
        pass

    def get_tw_sector_stocks(self, sector_name):
        """
        針對台股：先從 fallback_map 取出完整清單，再嘗試 Playwright 補充新標的
        """
        fallback_map = {
            '散熱':           ['2421.TW','3483.TWO','8996.TW','3017.TW','3653.TW','4543.TWO','8032.TWO','5426.TWO','3426.TWO','3013.TW','6230.TW','3324.TWO','2486.TW','3338.TW','5223.TWO','3540.TWO','2354.TW','6124.TWO','6117.TW','6275.TWO','6112.TW','6125.TWO','3071.TWO','6591.TW'],
            '矽光子':          ['3450.TW','3163.TWO','3081.TWO','6414.TW','6274.TWO','4977.TW','6419.TWO','4979.TWO','2345.TW','4989.TW','3380.TW','8011.TW','3149.TW','3363.TWO','6442.TW','4909.TWO','6451.TW','3234.TWO','4908.TWO'],
            'AI 伺服器':       ['8215.TW','2465.TW','2301.TW','3231.TW','2330.TW','2308.TW','6282.TW','2376.TW','3533.TW','2353.TW','3661.TW','3005.TW','6669.TW','3693.TWO','2059.TW','6531.TW','2382.TW','2356.TW','2395.TW'],
            '記憶體':          ['3006.TW','3260.TWO','2337.TW','2408.TW','8088.TWO','2432.TW','8266.TW','5289.TWO','2451.TW','8110.TW','4967.TW','4973.TWO','3228.TWO','8271.TW','2344.TW','8299.TWO','3014.TW'],
            '被動元件':         ['6173.TWO','3090.TW','3026.TW','2472.TW','2456.TW','2428.TW','3624.TWO','8112.TW','2327.TW','6284.TWO','2375.TW','6155.TW','2492.TW','5328.TWO','6127.TWO','3068.TW','6204.TWO','3272.TWO','6449.TW','8043.TWO'],
            'ABF載板':         ['4958.TW','8150.TW','3037.TW','2367.TW','3189.TW','8046.TW','3044.TW'],
            '第三代半導體':      ['4934.TW','3016.TW','3707.TWO','8086.TWO','2338.TW','5483.TWO','6488.TWO','3105.TWO','5425.TWO','2455.TW','6415.TW','2342.TW','8255.TWO'],
            '低軌道衛星通訊':    ['3499.TWO','5388.TW','2412.TW','6271.TW','3596.TW','3311.TW','2312.TW','3491.TWO','6596.TWO','6426.TW','2419.TW','2383.TW','6202.TW','6213.TW','3062.TW','6285.TW','2314.TW'],
            '電子代工OEMODM':   ['2458.TW','2313.TW','2360.TW','2324.TW','2357.TW','2382.TW','2356.TW','2353.TW','2317.TW','6669.TW','3231.TW','4938.TW'],
            '半導體設備':        ['6532.TWO','6139.TW','3413.TW','6187.TWO','2467.TW','2404.TW','3131.TWO','1560.TW','3680.TWO','3583.TW','6196.TW','6667.TWO','8091.TWO','3498.TWO','6640.TWO','3551.TWO','5443.TWO','3587.TWO','3402.TWO'],
            '半導體廠務與設備':  ['3131.TWO','6532.TWO','8091.TWO','6139.TW','3413.TW','6640.TWO','6187.TWO','3583.TW','6196.TW','5443.TWO','3680.TWO','6667.TWO','6561.TWO','3402.TWO','2467.TW','2404.TW'],
            '網通設備組件':      ['4906.TW','5388.TW','3596.TW','3311.TW','6216.TW','3491.TWO','2332.TW','3558.TWO','2419.TW','2345.TW','2485.TW','3704.TW','6285.TW','3380.TW'],
            '軍工':            ['2208.TW','4572.TW','8349.TWO','8033.TW','2634.TW','3004.TW','4560.TW','1342.TW','5009.TWO','2364.TW','6643.TWO','8050.TWO','8222.TW','6829.TWO','6753.TW'],
            '貨櫃航運':         ['2609.TW','2603.TW','2615.TW'],
            '散裝航運':         ['2612.TW','2605.TW','2606.TW','2617.TW','2613.TW','2637.TW','2601.TW','5608.TW','2607.TW','2614.TW'],
            '探針卡':           ['7828.TWO','6515.TW','6683.TWO','3289.TWO','6510.TWO','6223.TWO','3680.TWO','3587.TWO'],
            '半導體特化':        ['4770.TW','1727.TW','1710.TW','1708.TW','6509.TWO','4721.TWO','4768.TWO','4739.TW','4755.TW','1711.TW','1773.TW'],
            '光通訊、矽光子與光學元件': ['3363.TWO','3008.TW','6442.TW','4908.TWO','3665.TW','6820.TWO','6197.TW','3450.TW','4977.TW','3163.TWO','3081.TWO','6414.TW','6274.TWO','6419.TWO','4979.TWO','2345.TW','4989.TW','3380.TW','8011.TW','3149.TW','4909.TWO','6451.TW','3234.TWO'],
            '半導體晶圓與代工': ['2303.TW','3105.TWO','6488.TWO','3711.TW','2301.TW'],
        }

        tickers = set()

        # 1. 先載入 fallback 完整清單
        for k, v in fallback_map.items():
            if k in sector_name or sector_name in k:
                tickers.update(v)
                # 拿掉 break，允許複合名稱同時匹配多個關鍵字並聯集標的

        # 2. Playwright 只作補充（雲端環境無 Playwright 時自動略過）
        if PLAYWRIGHT_AVAILABLE:
            try:
                with sync_playwright() as p:
                    browser = p.chromium.launch(headless=True)
                    page = browser.new_page()
                    search_url = f"https://tw.stock.yahoo.com/search?search={sector_name}"
                    page.goto(search_url, wait_until="domcontentloaded")
                    try:
                        page.wait_for_selector("a[href*='/quote/']", timeout=4000)
                    except Exception:
                        pass
                    links = page.query_selector_all("a")
                    for link in links:
                        href = link.get_attribute("href")
                        if href and '/quote/' in href:
                            parts = href.split('/')
                            ticker = parts[-1]
                            ticker_code = ticker.replace('.TW', '').replace('.TWO', '')
                            if ticker_code.isdigit() and len(ticker_code) >= 4:
                                # 根據原始連結判斷市場，避免櫃買標的一律被加上 .TW
                                suffix = ".TWO" if ".TWO" in ticker.upper() or "/quote/" in href and ".TWO" in href.upper() else ".TW"
                                tickers.add(f"{ticker_code}{suffix}")
                    browser.close()
            except Exception as e:
                print(f"[!] Playwright 補充抓取失敗 (不影響主要結果): {e}")

        if not tickers:
            tickers.update(['2330.TW', '2454.TW'])

        print(f"[v] 成功獲取 {len(tickers)} 檔標的: {list(tickers)[:5]}...")
        return list(tickers)


    def get_us_sector_stocks(self, industry_name):
        """
        針對美股：使用 finvizfinance 透過 Sector / Industry 篩選
        """
        print(f"[*] 開始獲取美股 [{industry_name}] 相關概念股...")
        try:
            from finvizfinance.screener.overview import Overview
            foverview = Overview()
            # 若不是 Finviz 預設產業，可以使用模糊匹配或先嘗試篩選
            try:
                foverview.set_filter(filters_dict={'Industry': industry_name})
                df = foverview.screener_view()
                if not df.empty and 'Ticker' in df.columns:
                    return df['Ticker'].tolist()
            except Exception as e:
                # 容錯處理：如果輸入的參數不是 Finviz 認可的 Industry
                print(f"[-] Finviz 無此 Industry，使用自訂對應...")
                mock_map = {
                    "AI 伺服器": ["NVDA", "SMCI", "AMD", "DELL", "HPE"],
                    "散熱": ["VRT", "MOD", "FLS"],
                    "矽光子": ["MRVL", "CSCO", "LITE", "COHR"],
                    "光通訊、矽光子與光學元件": ["MRVL", "CSCO", "LITE", "COHR", "AAOI", "AVGO"],
                    "半導體晶圓與代工": ["TSM", "UMC", "INTC", "AMAT", "ASML"]
                }
                for k, v in mock_map.items():
                    if k in industry_name:
                        return v
                return ["AAPL", "MSFT", "GOOG"]
        except ImportError:
            print("[!] 尚未安裝 finvizfinance")
        except Exception as e:
            print(f"[!] 美股抓取錯誤: {e}")
            
        return []

    def get_market_mapping(self, sector_list):
        """
        整合：依據傳入族群，回傳 Dict mapping
        格式: {"AI 伺服器": ["2330.TW", "3231.TW", ...]}
        """
        result = {}
        for sector in sector_list:
            # 預設此專案目前重點抓台股 (後綴 .TW)
            tw_stocks = self.get_tw_sector_stocks(sector)
            
            # 美股也合併抓取測試
            # us_stocks = self.get_us_sector_stocks(sector)
            
            # 本測試先整合台股
            result[sector] = tw_stocks
        return result
