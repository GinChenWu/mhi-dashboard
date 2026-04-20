@echo off
chcp 65001 >nul
title MHI 市場熱度儀表板

echo.
echo  ╔══════════════════════════════════════════╗
echo  ║     MHI 市場熱度儀表板  正在啟動...      ║
echo  ╚══════════════════════════════════════════╝
echo.

:: 檢查 Python 是否安裝
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo  [錯誤] 找不到 Python！
    echo  請先前往 https://www.python.org/downloads/ 安裝 Python 3.10 以上版本
    echo  安裝時請勾選 "Add Python to PATH"
    pause
    exit /b 1
)

echo  [1/4] 檢查虛擬環境...
if not exist ".venv" (
    echo  [2/4] 首次執行，建立虛擬環境（約 30 秒）...
    python -m venv .venv
) else (
    echo  [2/4] 已有虛擬環境，略過建立。
)

echo  [3/4] 安裝 / 更新套件...
call .venv\Scripts\pip install -q -r requirements.txt

echo  [3.5/4] 安裝 Playwright 瀏覽器核心...
call .venv\Scripts\python -m playwright install chromium >nul 2>&1

echo  [4/4] 啟動儀表板...
echo.
echo  ★ 請稍後，瀏覽器將自動開啟 http://localhost:8501
echo  ★ 關閉此視窗即可停止服務
echo.

:: 延遲 2 秒後自動開瀏覽器
start "" /b cmd /c "timeout /t 3 >nul && start http://localhost:8501"

call .venv\Scripts\streamlit run app.py --server.port 8501 --server.headless true --browser.gatherUsageStats false

pause
