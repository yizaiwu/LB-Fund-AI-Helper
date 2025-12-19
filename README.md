# 基金理財網 AI 小幫手

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Vite](https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD62E)](https://vitejs.dev/)

一個智能化的基金理財分析工具，結合 Google Gemini AI 技術，提供專業基金數據查詢、比較與 AI 分析功能，幫助投資人做出更明智的決策。

## ✨ 功能特色

- 📊 **基金數據查詢與篩選** - 支持多種篩選條件，快速找出符合需求的基金
- 🤖 **AI 智能分析** - 使用 Google Gemini AI 提供專業基金分析與建議
- 💡 **單檔基金健診** - 針對特定基金進行深度分析與風險評估
- 📈 **績效比較** - 支持多種時間段的績效比較與排序
- 🔄 **資料匯入功能** - 支持匯入自定義基金數據
- 💾 **本地數據存儲** - API Key 存儲在本地瀏覽器，確保隱私安全
- 📱 **響應式設計** - 完美適配桌面與行動裝置

## 🚀 快速開始

### 環境需求

- Node.js 16+ 
- npm 或 yarn

### 安裝步驟

1. **克隆專案**
   ```bash
   git clone https://github.com/yizaiwu/lb-fund-ai-assistant.git
   cd lb-fund-ai-assistant
   ```

2. **安裝依賴**
   ```bash
   npm install
   ```

3. **設置 API Key**
   
   **選項 1：使用環境變數（推薦給開發者）**
   
   複製環境變數範本文件：
   ```bash
   cp .env.example .env
   ```
   
   編輯 `.env` 文件，添加你的 Google Gemini API Key：
   ```
   VITE_GEMINI_API_KEY=your_gemini_api_key_here
   ```
   
   **取得 API Key**: [Google AI Studio](https://aistudio.google.com/app/apikey)

4. **啟動開發伺服器**
   ```bash
   npm run dev
   ```
   
   應用將在 http://localhost:3000 開啟

### 建置生產版本

```bash
npm run build
```

建置文件將生成在 `dist` 目錄中。

## 📖 使用說明

### 基金列表

1. **篩選功能**：使用篩選器快速查找特定類型或配息方式的基金
2. **排序功能**：點擊表格標題可依該欄位排序
3. **AI 分析**：點擊基金行的「分析」按鈕，獲取 AI 詳細分析報告

### AI 分析師

1. **自然語言查詢**：輸入自然語言描述你的需求，例如：
   - "查詢標的類型'債券型'，給我'不配息'、'五年%'，績效前 5 名"
   - "推薦一些股票型基金"
   - "比較不同基金的風險評級"

2. **獲取 AI 建議**：AI 將根據你的查詢提供專業分析和建議

### API Key 設置

1. 點擊右上角設定圖標
2. 輸入你的個人 Google Gemini API Key
3. 儲存後即可使用 AI 功能
4. 如有預設 API Key，可隨時重置為預設值

## 🛠️ 技術架構

- **前端框架**：React 18 + TypeScript
- **UI 框架**：Tailwind CSS
- **建構工具**：Vite
- **AI 整合**：Google Gemini API
- **狀態管理**：React Hooks
- **數據處理**：原始 Markdown 表格數據

## 🤝 貢獻指南

歡迎提交 Issue 和 Pull Request 來改進這個專案！

1. Fork 本專案
2. 創建你的功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交你的更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打開一個 Pull Request

## 📝 授權

本專案採用 MIT 授權 - 查看 [LICENSE](LICENSE) 文件了解詳情。

## 🙋‍♂️ 常見問題

**Q: 如何取得 Google Gemini API Key？**
A: 前往 [Google AI Studio](https://aistudio.google.com/app/apikey) 登錄並創建新的 API Key。

**Q: 數據來源是什麼？**
A: 目前使用範例數據，你可以通過「匯入資料」功能匯入自己的基金數據。

**Q: 是否支援其他 AI 模型？**
A: 目前僅支援 Google Gemini，未來可能會擴展支援其他 AI 模型。

**Q: 我的 API Key 會被存儲在哪裡？**
A: API Key 僅存儲在你的本地瀏覽器中，不會上傳到任何伺服器。

## 🌟 致謝

- [Google Gemini AI](https://ai.google.dev/) - 提供 AI 分析能力
- [React](https://reactjs.org/) - 強大的前端框架
- [Tailwind CSS](https://tailwindcss.com/) - 實用優雅的 CSS 框架
- [Vite](https://vitejs.dev/) - 快速的建構工具

---

Made with ❤️ by 乙仔