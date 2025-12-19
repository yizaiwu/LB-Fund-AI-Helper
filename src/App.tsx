import React, { useState, useEffect, useRef, useMemo } from 'react';

// --- UI 元件 (移至 App 外部以解決輸入框焦點流失問題) ---
const Card = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
    <div className={`bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden ${className}`}>
        {children}
    </div>
);

// Gemini API 呼叫函式
const callGemini = async (prompt: string, apiKey: string): Promise<string> => {
    if (!apiKey) {
        throw new Error("請先點擊右上角「設定」輸入您的 Google Gemini API Key 才能使用 AI 功能。");
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;
    const payload = {
        contents: [{ parts: [{ text: prompt }] }]
    };

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        
        if (!response.ok) {
            if (response.status === 429) {
                 throw new Error("⚠️ AI 目前繁忙中 (429)，請稍後再試。");
            }
            const errorData = await response.json().catch(() => ({}));
            throw new Error(`API Error: ${response.status} ${errorData.error?.message || ''}`);
        }

        const data = await response.json();
        return data.candidates?.[0]?.content?.parts?.[0]?.text || "無法取得回應";
    } catch (error) {
        throw error;
    }
};

// 設定視窗組件
const SettingsModal = ({ isOpen, onClose, apiKey, onSave, onReset }: { 
  isOpen: boolean; 
  onClose: () => void; 
  apiKey: string; 
  onSave: (key: string) => void; 
  onReset: () => void;
}) => {
    const [inputKey, setInputKey] = useState(apiKey);

    useEffect(() => {
        setInputKey(apiKey);
    }, [apiKey, isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center modal-overlay p-4 animate-fade-in">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md flex flex-col border border-slate-200">
                <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50 rounded-t-xl">
                    <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0 .73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.09a2 2 0 0 1-1-1.74v-.47a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
                        設定 API Key
                    </h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                    </button>
                </div>
                <div className="p-6 flex flex-col gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Google Gemini API Key</label>
                        <input
                            type="password"
                            className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-sm"
                            value={inputKey}
                            onChange={(e) => setInputKey(e.target.value)}
                            placeholder="請輸入您的 API Key"
                        />
                        <p className="text-xs text-slate-500 mt-2">
                            您的 Key 僅會儲存在本地瀏覽器中，不會傳送至其他伺服器。
                            <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-emerald-600 hover:underline ml-1">
                                取得 API Key
                            </a>
                        </p>
                        {import.meta.env.VITE_GEMINI_API_KEY && (
                            <p className="text-xs text-slate-400 mt-1">
                                此應用已配置預設 API Key，您可以保留使用或替換為您自己的 API Key。
                            </p>
                        )}
                    </div>
                </div>
                <div className="p-4 border-t border-slate-100 flex justify-between gap-3 bg-slate-50 rounded-b-xl">
                    <div className="flex gap-3">
                        {import.meta.env.VITE_GEMINI_API_KEY && (
                            <button 
                                onClick={onReset}
                                className="px-4 py-2 text-slate-500 font-medium hover:bg-slate-200 rounded-lg transition-colors text-sm"
                            >
                                重置為預設
                            </button>
                        )}
                    </div>
                    <div className="flex gap-3">
                        <button 
                            onClick={onClose}
                            className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-200 rounded-lg transition-colors"
                        >
                            取消
                        </button>
                        <button 
                            onClick={() => onSave(inputKey)}
                            className="px-6 py-2 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 shadow-sm transition-colors"
                        >
                            儲存設定
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// 分析視窗組件
const AnalyzeModal = ({ fund, onClose, onAnalyze, analysisResult, isAnalyzing, error }: { 
  fund: any; 
  onClose: () => void; 
  onAnalyze: (fund: any) => void; 
  analysisResult: string; 
  isAnalyzing: boolean; 
  error: string | null; 
}) => {
    useEffect(() => {
        if (fund && !analysisResult && !isAnalyzing && !error) {
            onAnalyze(fund);
        }
    }, [fund]);

    if (!fund) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center modal-overlay p-4 animate-fade-in">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[85vh] border border-emerald-100">
                <div className="p-5 border-b border-slate-100 bg-gradient-to-r from-emerald-50 to-white rounded-t-xl flex justify-between items-start">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-xl">✨</span>
                            <h3 className="text-lg font-bold text-slate-800">AI 基金健診</h3>
                        </div>
                        <p className="text-emerald-700 font-medium text-sm">{fund['標的名稱']}</p>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 hover:bg-slate-100 rounded-full transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                    </button>
                </div>
                <div className="p-6 overflow-y-auto custom-scroll">
                    {/* 基金基本數據卡片 */}
                    <div className="grid grid-cols-3 gap-3 mb-6">
                        <div className="bg-slate-50 p-3 rounded-lg text-center">
                            <p className="text-xs text-slate-500 mb-1">一年績效</p>
                            <p className={`font-bold ${parseFloat(fund['一年%']) > 0 ? 'text-red-500' : 'text-green-500'}`}>{fund['一年%']}%</p>
                        </div>
                        <div className="bg-slate-50 p-3 rounded-lg text-center">
                            <p className="text-xs text-slate-500 mb-1">夏普值</p>
                            <p className="font-bold text-slate-700">{fund['夏普值']}</p>
                        </div>
                        <div className="bg-slate-50 p-3 rounded-lg text-center">
                            <p className="text-xs text-slate-500 mb-1">標準差</p>
                            <p className="font-bold text-slate-700">{fund['標準差％']}%</p>
                        </div>
                    </div>

                    {isAnalyzing ? (
                        <div className="flex flex-col items-center justify-center py-8 space-y-4">
                            <div className="w-10 h-10 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></div>
                            <p className="text-slate-500 animate-pulse">AI 正在深入分析此基金的數據與風險指標...</p>
                        </div>
                    ) : error ? (
                        <div className="p-4 bg-red-50 border border-red-100 rounded-lg text-red-600 text-sm flex items-start gap-2">
                             <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 shrink-0"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                             <div>
                                 <p className="font-bold">分析失敗</p>
                                 <p>{error}</p>
                                 <p className="mt-2 text-xs opacity-75">請檢查您的 API Key 是否正確設定。</p>
                             </div>
                        </div>
                    ) : (
                        <div className="prose prose-sm max-w-none text-slate-700 leading-relaxed whitespace-pre-line">
                            {analysisResult}
                        </div>
                    )}
                </div>
                <div className="p-4 border-t border-slate-100 bg-slate-50 rounded-b-xl flex justify-end">
                    <button onClick={onClose} className="px-5 py-2 bg-white border border-slate-200 text-slate-600 font-medium rounded-lg hover:bg-slate-50 hover:text-slate-800 transition-colors shadow-sm">
                        關閉
                    </button>
                </div>
            </div>
        </div>
    );
};

export default function App() {
    const [activeTab, setActiveTab] = useState('list');
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    
    // API Key 狀態管理
    const [userApiKey, setUserApiKey] = useState(() => {
        // 優先使用使用者自行設定的 API Key
        const userKey = localStorage.getItem('gemini_api_key');
        if (userKey) return userKey;
        
        // 如果沒有使用者設定，使用預設的 API Key
        return import.meta.env.VITE_GEMINI_API_KEY || '';
    });
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    // AI Modal 狀態
    const [analyzingFund, setAnalyzingFund] = useState<Record<string, any> | null>(null);
    const [aiAnalysisResult, setAiAnalysisResult] = useState('');
    const [isAiAnalyzing, setIsAiAnalyzing] = useState(false);
    const [aiError, setAiError] = useState<string | null>(null);

    // --- 1. 資料處理區 ---

const RAW_MARKDOWN_DATA = `
|代碼|標的名稱|幣別|標的類型|配息方式|一個月%|三個月%|六個月%|今年以來%|一年%|二年%|三年%|五年%|標準差％|夏普值|β係數|報酬％|＋ ∕ －指數|基金規模|成立日期|
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
|0110|景順美元極短期債券基金A股美元(已撤銷核備)|美元|債券型|N/A|0.36|1|2.34|4.5|4.66|10.56|16.48|16.89|0.23|4.21|0.05|0.01|0.01|98百萬|1991/01/02|
|0114|景順日本小型企業基金A股日圓|日圓|中小型股|無|-1.36|-2.89|7.56|16.54|16.9|33.25|39.45|28.9|17.89|0.26|0.68|-0.18|-4|12660百萬|1991/01/02|
|0115|景順全歐洲小型企業基金A股歐元|歐元|中小型股|無|1.54|-1.34|-0.16|12.68|13.12|28.57|38.49|40.77|17.11|0.21|1.18|-0.4|-0.15|88百萬|1991/01/02|
|0116|景順泛歐洲基金A股歐元|歐元|股票型|無|2.82|7.79|8.85|20.1|18.86|17.82|38.5|65.21|17.22|0.29|1.36|-0.03|-0.01|1100百萬|1991/01/02|
|0127|景順環球消費趨勢基金A股美元|美元|非必需消費股|無|3.27|-8.87|13.13|22.37|16.37|56.07|86.7|-1.21|38.33|0.16|1.64|1.92|1.77|2590百萬|1994/10/03|
|0132|景順歐元債券基金A股歐元(已撤銷核備)|歐元|債券型|無|-0.42|-0.25|0.16|1.14|0.52|4.71|10.48|-10.37|2.96|-0.07|0.22|0.02|0|595百萬|1996/04/01|
|0146|景順實現能源轉型基金A股美元|美元|能源|無|0|-0.77|11.87|19.56|17.37|17.78|22.12|10.31|13.38|0.34|0.21|-0.1|-0.01|41百萬|2001/02/01|
|0147|景順歐元極短期債券基金A股歐元(已撤銷核備)|歐元|債券型|無|0.14|0.47|1.04|2.28|2.37|6.29|9.77|7.52|0.19|1.67|0|0.01|0.02|331百萬|1999/10/14|
|0149|景順新興市場債券基金A(歐元對沖)股歐元(本基金有相當比重投資於非投資等級之高風險債券)|歐元|固定收益|無|0.58|1.14|6.47|8.69|7.34|15.28|21.1|-10.36|5.13|0.34|0.99|0.06|0.02|88百萬|2004/07/30|
`;

    // 使用 State 來管理目前的 Markdown 資料，以便更新
    const [currentMarkdown, setCurrentMarkdown] = useState(RAW_MARKDOWN_DATA);
    
    // 解析 Markdown 表格為 JSON (當 currentMarkdown 改變時重新計算)
    const fundsData = useMemo(() => {
        const lines = currentMarkdown.trim().split('\n');
        // 簡單的防呆，如果資料為空或格式不對，回傳空陣列
        if (lines.length < 3) return [];

        const headers = lines[0].split('|').filter(h => h.trim() !== '').map(h => h.trim());
        const data = [];

        for (let i = 2; i < lines.length; i++) {
            const row = lines[i].split('|').filter((_, idx) => idx !== 0 && idx !== lines[i].split('|').length - 1);
            if (row.length < headers.length) continue;

            const obj: Record<string, any> = {};
            headers.forEach((header, index) => {
                let value = row[index] ? row[index].trim() : "N/A";
                // 嘗試轉換數字欄位
                if (header.includes('%') || header.includes('值') || header.includes('係數')) {
                        if (value !== 'N/A' && value !== '-') {
                            const num = parseFloat(value);
                            obj[header] = isNaN(num) ? value : num;
                        } else {
                            obj[header] = 'N/A';
                        }
                } else {
                    obj[header] = value;
                }
            });
            data.push(obj);
        }
        return data;
    }, [currentMarkdown]);

    // 表格狀態 (當 fundsData 更新時，同步更新 tableData)
    const [tableData, setTableData] = useState<Record<string, any>[]>([]);
    useEffect(() => {
        setTableData(fundsData);
    }, [fundsData]);

    const [sortConfig, setSortConfig] = useState<{ key: string | null; direction: string }>({ key: null, direction: 'desc' });
    const [filters, setFilters] = useState({ type: 'All', dividend: 'All', search: '' });

    // AI 狀態
    const [messages, setMessages] = useState<Array<{
        role: string;
        content: string;
        type: string;
        data?: Record<string, any>[];
        columns?: string[];
    }>>([
        { 
            role: 'ai', 
            content: '您好！我是您的基金理財 AI 小幫手。資料庫已從「2025年12月土銀基金理財網」更新完畢。您可以試著問我：「查詢標的類型"債券型"，給我"不配息"、"五年%"，績效前 5 名」。',
            type: 'text'
        }
    ]);
    const [inputMsg, setInputMsg] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // 滾動到最新訊息
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };
    useEffect(scrollToBottom, [messages]);

    // --- 匯入功能邏輯 ---
    const [importText, setImportText] = useState(currentMarkdown); // 新增狀態
    const handleOpenImportModal = () => {
        setImportText(currentMarkdown); // 開啟時帶入目前的資料
        setIsImportModalOpen(true);
    };

    const handleCloseImportModal = () => {
        setIsImportModalOpen(false);
    };

    const handleConfirmImport = () => {
        if (!importText.trim()) {
            alert("請輸入有效的 Markdown 資料");
            return;
        }
        setCurrentMarkdown(importText);
        setIsImportModalOpen(false);
        
        // 通知使用者資料已更新
        setMessages(prev => [...prev, {
            role: 'ai',
            content: '✅ 資料匯入成功！資料庫已更新，您可以根據新的數據進行查詢。',
            type: 'text'
        }]);
    };
    
    // --- 新增：處理單檔基金分析 ---
    const handleOpenAnalyzeModal = (fund: Record<string, any>) => {
        setAnalyzingFund(fund);
        setAiAnalysisResult(''); // 清空上次結果
        setAiError(null);
        setIsAiAnalyzing(false); // 重置狀態，由 Modal 的 useEffect 觸發
    };

    const handleCloseAnalyzeModal = () => {
        setAnalyzingFund(null);
    };

    // 儲存 API Key
    const handleSaveApiKey = (key: string) => {
        setUserApiKey(key);
        localStorage.setItem('gemini_api_key', key);
        setIsSettingsOpen(false);
        alert("API Key 已儲存！現在您可以開始使用 AI 功能了。");
    };

    // 重置 API Key (回到預設值)
    const handleResetApiKey = () => {
        setUserApiKey(import.meta.env.VITE_GEMINI_API_KEY || '');
        localStorage.removeItem('gemini_api_key');
        setIsSettingsOpen(false);
        alert("API Key 已重置為預設值。");
    };

    const performFundAnalysis = async (fund: Record<string, any>) => {
        setIsAiAnalyzing(true);
        setAiError(null);
        // 建構 Prompt
        const prompt = `
            請扮演一位專業的資深基金分析師。請針對以下這檔基金的數據進行深入簡短的分析（約 200 字）：
            
            基金名稱：${fund['標的名稱']}
            類型：${fund['標的類型']}
            一年報酬率：${fund['一年%']}%
            三年報酬率：${fund['三年%']}%
            五年報酬率：${fund['五年%']}%
            標準差：${fund['標準差％']}%
            夏普值：${fund['夏普值']}
            Beta係數：${fund['β係數']}

            請分析：
            1. 績效表現：短期與長期表現如何？
            2. 風險評估：根據標準差與Beta係數，風險程度如何？
            3. 投資建議：適合什麼樣的投資人？（保守/穩健/積極）
            
            請用繁體中文回答，語氣專業且親切，使用 Markdown 格式條列重點。
        `;

        try {
            const result = await callGemini(prompt, userApiKey);
            setAiAnalysisResult(result);
        } catch (error) {
            setAiError((error as Error).message);
        } finally {
            setIsAiAnalyzing(false);
        }
    };

    // --- AI 分析邏輯 ---
    const analyzeQuery = (query: string, data: Record<string, any>[]) => {
        const result = {
            text: "",
            data: [] as Record<string, any>[],
            columns: ["代碼", "標的名稱", "標的類型", "一年%", "三年%", "五年%"] 
        };

        let targetTypes = [];
        const typeKeywords = [
            "債券型", "非投資等級債券", "固定收益", "公司債券", "REIT", "不動產證券化型", 
            "可轉換債券", "市政債券", "全球組合型債券型", "多重資產型", "房地產", "短型債券", 
            "債券型非投資等級債券型", "債券型海外債券投資等級", "債券型海外債券投資等級全球新興市場", 
            "債券型國內債券型", "中小型股", "股票型"
        ];

        if (query.includes("標的類型：") || query.includes("標的類型:")) {
            const listPart = query.split(/標的類型[：:]/)[1];
            targetTypes = typeKeywords.filter(k => listPart.includes(k));
        } else {
            targetTypes = typeKeywords.filter(k => query.includes(k));
        }

        let dividendFilter = null; 
        if (query.includes("不配息") || query.includes("無配息") || query.includes("累積")) {
            dividendFilter = 'no';
        } else if (query.includes("配息")) {
            dividendFilter = 'yes';
        }

        let sortKey = "五年%"; 
        const sortOptions = ["一個月%", "三個月%", "六個月%", "今年以來%", "一年%", "二年%", "三年%", "五年%"];
        const foundSort = sortOptions.find(opt => query.includes(opt));
        if (foundSort) sortKey = foundSort;

        let limit = 1000;
        const limitMatch = query.match(/前(\d+)名/);
        if (limitMatch) {
            limit = parseInt(limitMatch[1]);
        }

        let filtered = data.filter((item: Record<string, any>) => {
            const typeMatch = targetTypes.length === 0 || targetTypes.some(t => item["標的類型"].includes(t));
            let divMatch = true;
            if (dividendFilter === 'no') {
                divMatch = item["配息方式"] === "無" || item["配息方式"] === "N/A" || item["配息方式"] === "不配息" || item["配息方式"].includes("累積");
            } else if (dividendFilter === 'yes') {
                divMatch = item["配息方式"] !== "無" && item["配息方式"] !== "N/A" && item["配息方式"] !== "不配息";
            }
            return typeMatch && divMatch;
        });

        filtered.sort((a: Record<string, any>, b: Record<string, any>) => {
            const valA = typeof a[sortKey] === 'number' ? a[sortKey] : -9999;
            const valB = typeof b[sortKey] === 'number' ? b[sortKey] : -9999;
            return valB - valA; 
        });

        result.data = filtered.slice(0, limit);

        if (result.data.length === 0) {
            result.text = `很抱歉，根據您的條件（${targetTypes.join('、') || '所有類型'}，${dividendFilter === 'no' ? '不配息' : (dividendFilter === 'yes' ? '配息' : '不限配息')}），找不到符合的基金資料。`;
        } else {
            result.text = `已為您找到 ${result.data.length} 筆符合條件的基金，依照「${sortKey}」排序：`;
        }

        return result;
    };

    // --- UI 邏輯 ---
    const handleSort = (key: string) => {
        let direction = 'desc';
        if (sortConfig.key === key && sortConfig.direction === 'desc') {
            direction = 'asc';
        }
        setSortConfig({ key, direction });

        const sorted = [...tableData].sort((a: Record<string, any>, b: Record<string, any>) => {
            let valA = a[key];
            let valB = b[key];
            if (valA === 'N/A') valA = -Infinity;
            if (valB === 'N/A') valB = -Infinity;
            if (valA < valB) return direction === 'asc' ? -1 : 1;
            if (valA > valB) return direction === 'asc' ? 1 : -1;
            return 0;
        });
        setTableData(sorted);
    };

    const handleFilter = (key: string, value: any) => {
        const newFilters = { ...filters, [key]: value };
        setFilters(newFilters);
        applyFilters(newFilters);
    };

    const applyFilters = (currentFilters: any) => {
        let filtered = fundsData.filter(item => {
            const matchType = currentFilters.type === 'All' || item['標的類型'] === currentFilters.type;
            const matchDiv = currentFilters.dividend === 'All' || item['配息方式'] === currentFilters.dividend;
            const matchSearch = currentFilters.search === '' || 
                                item['標的名稱'].includes(currentFilters.search) || 
                                item['代碼'].includes(currentFilters.search);
            return matchType && matchDiv && matchSearch;
        });
        setTableData(filtered);
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputMsg.trim()) return;

        const userText = inputMsg;
        setMessages(prev => [...prev, { role: 'user', content: userText, type: 'text' }]);
        setInputMsg('');
        setIsTyping(true);

        // 先執行本地規則搜尋
        const analysis = analyzeQuery(userText, fundsData);
        
        // 準備 AI 回應
        const aiMessage = {
            role: 'ai',
            type: analysis.data.length > 0 ? 'analysis' : 'text',
            data: analysis.data,
            columns: analysis.columns,
            content: "" // 稍後填充
        };

        // 如果本地搜尋有結果，請 Gemini 進行總結
        if (analysis.data.length > 0) {
            // 取前 3 名基金做為 Context
            const topFunds = analysis.data.slice(0, 3).map(f => `${f['標的名稱']} (一年:${f['一年%']}%, 五年:${f['五年%']}%)`).join(', ');
            const prompt = `
                使用者查詢：「${userText}」。
                我已經根據規則篩選出結果，前幾名是：${topFunds}。
                
                請以「AI 基金分析師」的角度，針對這些篩選結果給予一段簡短的總結與投資建議（約 100 字）。
                強調這些基金的特色，並提醒投資風險。請用繁體中文。
            `;
            
            try {
                const llmResponse = await callGemini(prompt, userApiKey);
                aiMessage.content = `${analysis.text}\n\n✨ **AI 分析師點評**：\n${llmResponse}`;
            } catch (err) {
                aiMessage.content = `${analysis.text}\n\n(⚠️ AI 分析無法使用: ${(err as Error).message})`; 
            }

        } else {
            // 如果本地搜尋無結果，直接問 Gemini 一般性金融問題
            const prompt = `
                使用者問：「${userText}」。
                但在我的資料庫中找不到完全符合篩選條件的基金。
                
                請以「AI 基金分析師」的角度，回答使用者的問題，或是解釋為什麼這樣的條件可能找不到基金（例如條件太嚴苛），並給予一些替代的投資建議。請用繁體中文。
            `;
             try {
                const llmResponse = await callGemini(prompt, userApiKey);
                aiMessage.content = `${analysis.text}\n\n🤖 **AI 建議**：\n${llmResponse}`;
            } catch (err) {
                aiMessage.content = `${analysis.text}\n\n(⚠️ AI 建議無法使用: ${(err as Error).message})`;
            }
        }

        setMessages(prev => [...prev, aiMessage]);
        setIsTyping(false);
    };

    const uniqueTypes = ['All', ...new Set(fundsData.map(d => d['標的類型']))];
    const uniqueDivs = ['All', ...new Set(fundsData.map(d => d['配息方式']))];

    // Card 已移至 App 外部

    return (
        <div className="min-h-screen flex flex-col font-sans text-slate-800 bg-slate-50">
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@300;400;500;700&display=swap');
                body { font-family: 'Noto Sans TC', sans-serif; }
                .custom-scroll::-webkit-scrollbar { height: 8px; width: 8px; }
                .custom-scroll::-webkit-scrollbar-track { background: #f1f5f9; }
                .custom-scroll::-webkit-scrollbar-thumb { background-color: #cbd5e1; border-radius: 4px; }
                .custom-scroll::-webkit-scrollbar-thumb:hover { background-color: #94a3b8; }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in { animation: fadeIn 0.3s ease-out forwards; }
                .modal-overlay {
                    background-color: rgba(0, 0, 0, 0.5);
                    backdrop-filter: blur(2px);
                }
            `}</style>

            {/* Import Modal */}
            {isImportModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center modal-overlay p-4 animate-fade-in">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl flex flex-col max-h-[90vh]">
                        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50 rounded-t-xl">
                            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                                匯入基金 Markdown 資料
                            </h3>
                            <button onClick={handleCloseImportModal} className="text-slate-400 hover:text-slate-600 transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                            </button>
                        </div>
                        <div className="p-4 flex-1 flex flex-col gap-2 overflow-hidden">
                            <p className="text-sm text-slate-500">
                                請將完整的 Markdown 表格資料（包含標頭）貼在下方欄位中。
                            </p>
                            <textarea
                                className="flex-1 w-full p-4 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-xs font-mono bg-slate-50 custom-scroll resize-none"
                                value={importText}
                                onChange={(e) => setImportText(e.target.value)}
                                placeholder="|代碼|標的名稱|... (請貼上 Markdown 格式資料)"
                            ></textarea>
                        </div>
                        <div className="p-4 border-t border-slate-100 flex justify-end gap-3 bg-slate-50 rounded-b-xl">
                            <button 
                                onClick={handleCloseImportModal}
                                className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-200 rounded-lg transition-colors"
                            >
                                取消
                            </button>
                            <button 
                                onClick={handleConfirmImport}
                                className="px-6 py-2 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 shadow-sm transition-colors flex items-center gap-2"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
                                確認匯入
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Settings Modal (New) */}
            <SettingsModal 
                isOpen={isSettingsOpen}
                onClose={() => setIsSettingsOpen(false)}
                apiKey={userApiKey}
                onSave={handleSaveApiKey}
                onReset={handleResetApiKey}
            />
            
            {/* Analyze Modal (New) */}
            <AnalyzeModal 
                fund={analyzingFund} 
                onClose={handleCloseAnalyzeModal} 
                onAnalyze={performFundAnalysis}
                analysisResult={aiAnalysisResult}
                isAnalyzing={isAiAnalyzing}
                error={aiError}
            />

            {/* Header */}
            <header className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white p-4 shadow-lg sticky top-0 z-50">
                <div className="container mx-auto flex flex-col md:flex-row justify-between items-center">
                    <div className="flex items-center gap-3 mb-2 md:mb-0">
                        <div className="p-2 bg-white/20 rounded-full backdrop-blur-sm">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                        </div>
                        <div>
                            <h1 className="text-xl md:text-2xl font-bold tracking-wide">基金理財網 AI 小幫手</h1>
                            <p className="text-xs text-emerald-100 font-medium">Made with ❤️ by 乙仔</p>
                        </div>
                    </div>
                    
                    {/* Navigation Tabs */}
                    <div className="flex bg-emerald-800/30 p-1 rounded-lg backdrop-blur-sm gap-1 items-center">
                        <button 
                            onClick={() => setActiveTab('list')}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${activeTab === 'list' ? 'bg-white text-emerald-700 shadow-sm' : 'text-emerald-100 hover:bg-white/10'}`}
                        >
                            <div className="flex items-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M3 12h18"/><path d="M3 18h18"/></svg>
                                基金列表
                            </div>
                        </button>
                        <button 
                            onClick={() => setActiveTab('ai')}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${activeTab === 'ai' ? 'bg-white text-emerald-700 shadow-sm' : 'text-emerald-100 hover:bg-white/10'}`}
                        >
                            <div className="flex items-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                                AI 分析師
                            </div>
                        </button>
                        <div className="w-px h-6 bg-emerald-500/50 mx-1"></div>
                        <button 
                            onClick={handleOpenImportModal}
                            className="p-2 rounded-md text-emerald-100 hover:bg-white/10 transition-all duration-200"
                            title="匯入資料"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                        </button>
                        <button 
                            onClick={() => setIsSettingsOpen(true)}
                            className="p-2 rounded-md text-emerald-100 hover:bg-white/10 transition-all duration-200 relative"
                            title="設定 API Key"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0 .73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.09a2 2 0 0 1-1-1.74v-.47a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
                            {/* 如果沒有 API Key（包括預設值），顯示紅點提示 */}
                            {(!userApiKey && !import.meta.env.VITE_GEMINI_API_KEY) && <span className="absolute top-1 right-1 w-2 h-2 bg-red-400 rounded-full animate-pulse"></span>}
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 container mx-auto p-4 md:p-6 max-w-7xl">
                
                {/* VIEW: Fund List */}
                {activeTab === 'list' && (
                    <div className="space-y-6 animate-fade-in">
                        {/* Filters */}
                        <Card className="p-4 bg-white">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                                    </div>
                                    <input 
                                        type="text" 
                                        placeholder="搜尋代碼或名稱..." 
                                        className="pl-10 w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-sm transition-all"
                                        value={filters.search}
                                        onChange={(e) => handleFilter('search', e.target.value)}
                                    />
                                </div>
                                <select 
                                    className="p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-sm cursor-pointer"
                                    value={filters.type}
                                    onChange={(e) => handleFilter('type', e.target.value)}
                                >
                                    <option value="All">所有標的類型</option>
                                    {uniqueTypes.filter(t => t !== 'All').map(t => <option key={t} value={t}>{t}</option>)}
                                </select>
                                <select 
                                    className="p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-sm cursor-pointer"
                                    value={filters.dividend}
                                    onChange={(e) => handleFilter('dividend', e.target.value)}
                                >
                                    <option value="All">所有配息方式</option>
                                    {uniqueDivs.filter(t => t !== 'All').map(t => <option key={t} value={t}>{t}</option>)}
                                </select>
                                <div className="flex items-center justify-end text-sm text-slate-500 font-medium">
                                    共 {tableData.length} 筆資料
                                </div>
                            </div>
                        </Card>

                        {/* Data Table */}
                        <Card className="overflow-hidden shadow-md">
                            <div className="overflow-x-auto custom-scroll">
                                <table className="w-full text-sm text-left text-slate-600 whitespace-nowrap">
                                    <thead className="text-xs text-slate-700 uppercase bg-slate-100 border-b border-slate-200">
                                        <tr>
                                            {/* 新增一個操作欄位 */}
                                            <th className="px-4 py-3">AI 分析</th>
                                            {["代碼", "標的名稱", "標的類型", "配息方式", "幣別", "一年%", "三年%", "五年%", "基金規模"].map(head => (
                                                <th 
                                                    key={head} 
                                                    className="px-4 py-3 cursor-pointer hover:bg-slate-200 transition-colors group select-none"
                                                    onClick={() => handleSort(head)}
                                                >
                                                    <div className="flex items-center gap-1">
                                                        {head}
                                                        <svg className={`w-3 h-3 text-slate-400 transition-colors ${sortConfig.key === head ? 'text-emerald-600' : ''}`} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m7 15 5 5 5-5"/><path d="m7 9 5-5 5 5"/></svg>
                                                    </div>
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {tableData.map((row, idx) => (
                                            <tr key={idx} className="hover:bg-slate-50 transition-colors">
                                                <td className="px-4 py-3">
                                                    <button 
                                                        onClick={() => handleOpenAnalyzeModal(row)}
                                                        className="flex items-center gap-1 px-2 py-1 bg-emerald-100 text-emerald-700 rounded-md hover:bg-emerald-200 transition-colors text-xs font-bold"
                                                        title="使用 AI 分析此基金"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/><path d="M5 3v4"/><path d="M9 5H3"/></svg>
                                                        分析
                                                    </button>
                                                </td>
                                                <td className="px-4 py-3 font-medium text-slate-900">{row['代碼']}</td>
                                                <td className="px-4 py-3 text-emerald-700 font-medium truncate max-w-[200px]" title={row['標的名稱']}>{row['標的名稱']}</td>
                                                <td className="px-4 py-3">{row['標的類型']}</td>
                                                <td className="px-4 py-3">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${row['配息方式'] === '無' || row['配息方式'] === '不配息' ? 'bg-slate-200 text-slate-600' : 'bg-orange-100 text-orange-700'}`}>
                                                        {row['配息方式']}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3">{row['幣別']}</td>
                                                <td className={`px-4 py-3 font-medium ${parseFloat(row['一年%']) > 0 ? 'text-red-600' : 'text-green-600'}`}>{row['一年%']}</td>
                                                <td className={`px-4 py-3 font-medium ${parseFloat(row['三年%']) > 0 ? 'text-red-600' : 'text-green-600'}`}>{row['三年%']}</td>
                                                <td className={`px-4 py-3 font-medium ${parseFloat(row['五年%']) > 0 ? 'text-red-600' : 'text-green-600'}`}>{row['五年%']}</td>
                                                <td className="px-4 py-3 text-slate-500">{row['基金規模']}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            {tableData.length === 0 && (
                                <div className="p-8 text-center text-slate-400 flex flex-col items-center gap-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="opacity-50"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                                    <p>沒有符合條件的基金</p>
                                </div>
                            )}
                        </Card>
                    </div>
                )}

                {/* VIEW: AI Analyst */}
                {activeTab === 'ai' && (
                    <div className="flex flex-col h-[calc(100vh-140px)] animate-fade-in">
                        {/* Chat Area */}
                        <Card className="flex-1 mb-4 flex flex-col bg-slate-50/50">
                            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scroll">
                                {messages.map((msg, idx) => (
                                    <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[95%] md:max-w-[85%] rounded-2xl p-4 shadow-sm ${msg.role === 'user' ? 'bg-emerald-600 text-white rounded-tr-none' : 'bg-white border border-slate-200 rounded-tl-none'}`}>
                                            <div className="flex items-center gap-2 mb-2">
                                                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${msg.role === 'user' ? 'bg-emerald-700' : 'bg-emerald-100 text-emerald-700'}`}>
                                                    {msg.role === 'user' ? 
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> : 
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2v2a2 2 0 0 1-2 2V8a2 2 0 0 1 2-2V4a2 2 0 0 1 2-2z"/><path d="M2 14h20"/><path d="M12 12v10"/></svg>
                                                    }
                                                </div>
                                                <span className={`text-xs font-bold ${msg.role === 'user' ? 'text-emerald-100' : 'text-slate-500'}`}>
                                                    {msg.role === 'user' ? '您' : 'AI 基金分析師'}
                                                </span>
                                            </div>
                                            
                                            {/* Message Content */}
                                            <div className="text-sm leading-relaxed whitespace-pre-wrap">
                                                {msg.content}
                                            </div>

                                            {/* Data Table in Chat */}
                                            {msg.type === 'analysis' && msg.data && (
                                                <div className="mt-4 overflow-x-auto rounded-lg border border-slate-200 bg-white">
                                                    <table className="w-full text-xs text-left text-slate-600">
                                                        <thead className="bg-slate-100 font-medium text-slate-700">
                                                            <tr>
                                                                {msg.columns?.map((c: any) => <th key={c} className="px-3 py-2">{c}</th>)}
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-slate-100">
                                                        {msg.data?.map((item: any, i: any) => (
                                                                <tr key={i} className="hover:bg-slate-50">
                                                                    {msg.columns?.map((col: any) => (
                                                                        <td key={col} className={`px-3 py-2 ${['一年%', '三年%', '五年%'].includes(col) ? (parseFloat(item[col]) > 0 ? 'text-red-600 font-medium' : 'text-green-600 font-medium') : ''}`}>
                                                                            {item[col]}
                                                                        </td>
                                                                    ))}
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                                {isTyping && (
                                    <div className="flex justify-start">
                                        <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-none p-4 shadow-sm flex items-center gap-2">
                                                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce"></div>
                                                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                                                <div className="w-2 h-2 bg-emerald-600 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                                        </div>
                                    </div>
                                )}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Input Area */}
                            <div className="p-4 bg-white border-t border-slate-100">
                                <form onSubmit={handleSendMessage} className="relative flex gap-2">
                                    <input
                                        type="text"
                                        className="flex-1 p-3 pl-4 pr-12 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-sm shadow-inner bg-slate-50 transition-all"
                                        placeholder="輸入您的查詢條件（例如：債券型、五年績效前10名...）"
                                        value={inputMsg}
                                        onChange={(e) => setInputMsg(e.target.value)}
                                    />
                                    <button 
                                        type="submit"
                                        disabled={!inputMsg.trim() || isTyping}
                                        className="absolute right-2 top-1.5 p-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                                    </button>
                                </form>
                                <div className="mt-2 flex flex-wrap gap-2 text-xs">
                                    <span className="text-slate-400 flex items-center gap-1">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/></svg>
                                        試試看：
                                    </span>
                                    <button onClick={() => setInputMsg('查詢標的類型"債券型"，給我"不配息"、"五年%"，績效前10名')} className="px-2 py-1 bg-slate-100 hover:bg-emerald-50 text-slate-600 hover:text-emerald-700 rounded-md border border-slate-200 transition-colors">
                                        債券型不配息TOP10
                                    </button>
                                    <button onClick={() => setInputMsg('查詢以下標的類型，給我"不配息"、"五年%"，績效前5名，標的類型：非投資等級債券、新興市場、公司債券')} className="px-2 py-1 bg-slate-100 hover:bg-emerald-50 text-slate-600 hover:text-emerald-700 rounded-md border border-slate-200 transition-colors">
                                        多重債券類型比較
                                    </button>
                                    <button onClick={() => setInputMsg('查詢標的類型"股票型"，績效前3名')} className="px-2 py-1 bg-slate-100 hover:bg-emerald-50 text-slate-600 hover:text-emerald-700 rounded-md border border-slate-200 transition-colors">
                                        股票型TOP3
                                    </button>
                                </div>
                            </div>
                        </Card>
                    </div>
                )}
            </main>
        </div>
    );
}