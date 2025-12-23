import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { initDb } from './db.js';
import { parseFundsFromMarkdown } from './utils/markdownParser.js';
import { saveFunds, getFunds, deleteFund } from './routes/funds.js';

const app = express();
const PORT = process.env.PORT || 3001;

// 中間件
app.use(cors());
app.use(express.json());

// 文件上傳配置
const upload = multer({ 
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/markdown' || file.originalname.endsWith('.md')) {
      cb(null, true);
    } else {
      cb(new Error('只接受 Markdown 文件'));
    }
  }
});

// 初始化數據庫
await initDb();

// 上傳 Markdown 文件接口
app.post('/api/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: '未上傳文件' });
    }

    const content = req.file.buffer.toString('utf-8');
    const funds = parseFundsFromMarkdown(content);

    if (funds.length === 0) {
      return res.status(400).json({ error: '無法解析基金資料' });
    }

    await saveFunds(funds);

    res.json({
      success: true,
      message: `成功導入 ${funds.length} 筆基金資料`,
      funds: funds
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 獲取所有基金接口
app.get('/api/funds', async (req, res) => {
  try {
    const funds = await getFunds();
    res.json(funds);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 刪除基金接口
app.delete('/api/funds/:id', async (req, res) => {
  try {
    await deleteFund(req.params.id);
    res.json({ success: true, message: '基金已刪除' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 健康檢查
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`後端服務運行於 http://localhost:${PORT}`);
});
