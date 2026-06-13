#!/bin/bash
cd "$(dirname "$0")"

# 清除被佔用的 port
PORT=5001
PID=$(lsof -ti:$PORT 2>/dev/null)
if [ -n "$PID" ]; then
    echo "⚠️  Port $PORT 被佔用，正在清除 (PID: $PID)..."
    kill -9 $PID 2>/dev/null
    sleep 1
    echo "✅ 已清除"
fi

# 建立 repos 資料夾
mkdir -p repos

# 啟動後端
echo "🚀 啟動 CodeQuery v2 後端..."
cd backend
node server.mjs &
SERVER_PID=$!
cd ..

sleep 2

# 開啟前端
echo "🌐 開啟查詢頁面..."
open frontend/index.html

echo ""
echo "✅ CodeQuery 已啟動"
echo "   後端: http://localhost:$PORT"
echo "   按 Ctrl+C 停止"
echo ""

wait $SERVER_PID
