# 進度紀錄：iPhone 語音搜尋修復（2026-07-29）

## 狀態：已部署，待 iPhone 實機驗證

## 背景
- 展位詢價用 BETA 網頁（無下單功能），常駐畫面語音搜尋按鈕
- Android 正常；iPhone (iOS 16+ Safari) 從未成功
- 症狀：按住按鈕可錄音，放開後跳紅色錯誤「無法辨識」
- 使用者從 `https://max92034.github.io/Tradeshow/` 開啟（GitHub Pages）

## 診斷結論
- 麥克風權限、錄音、上傳 Deepgram 全部成功，但 Deepgram 聽不到語音
→ 錄出來的 mp4 是靜音檔
- 根因：`useDeepgramVoiceSearch.ts` 的 iOS keep-alive 機制把麥克風 stream
接進 `AudioContext.destination`，iOS 上同一 stream 被 WebAudio 消費時
MediaRecorder 會錄到靜音

## 已修改（commit 51828fb，已 push 並部署成功）
- `src/hooks/useDeepgramVoiceSearch.ts`
  - 刪除 iOS keep-alive 音訊路由 + 不再用到的 `keepAliveNodesRef`
  - iOS 上不再建立/resume AudioContext
  - `getUserMedia` 移到所有 `await` 之前（iOS 使用者手勢判定嚴格，
    跨 await 可能不跳權限視窗）
- `src/components/VoiceSearchButton.tsx`
  - 加 `-webkit-touch-callout: none` + `onContextMenu` preventDefault
    （防長按被 iOS 系統手勢打斷錄音）
- 本機 `tsc --noEmit` 與 `npm run build` 皆通過
- GitHub Actions：GitHub Pages 部署成功，線上 asset 雜湊已核對一致
  （index-Bf921OhQ.js）

## 下次回來要做
1. 問使用者 iPhone 實測結果
2. 若仍失敗：請使用者提供紅色錯誤訊息原文，按訊息定位階段：
   - "Voice not supported" → MediaRecorder/HTTPS 問題
   - 卡 "Preparing..." → getUserMedia/權限問題
   - "Audio too short" → pointercancel/長按被系統手勢搶走
   - "No speech recognized" → 仍是靜音錄音，考慮改 capture 方案
3. 已知無關問題：workflow 的 Vercel job 失敗（`--token` missing value，
   repo secret `VERCEL_TOKEN` 未設定）。GitHub Pages 不受影響，
   前端仍透過已部署的 `tradeshow-sigma.vercel.app/api/speech` 呼叫
   Deepgram，API 不需要重新部署。

## 環境備忘
- 此電腦連 github.com 需要開 VPN（DNS 解析到不通的 IP；140.82.114.4 可用，
  但 hosts 需管理員權限未改）
- 部署方式：push 到 main → GitHub Actions 自動部署
