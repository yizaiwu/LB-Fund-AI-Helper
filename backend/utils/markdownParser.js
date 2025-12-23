export function parseFundsFromMarkdown(content) {
  const funds = [];
  
  // 解析 Markdown 格式的基金資料
  // 格式示例：
  // ## 基金名稱
  // - 代碼: XXXX
  // - 類別: 股票型
  // - 描述: ...
  
  const sections = content.split('##').slice(1);
  
  sections.forEach((section, index) => {
    const lines = section.trim().split('\n');
    const name = lines[0].trim();
    
    const fund = {
      id: `fund_${Date.now()}_${index}`,
      name: name,
      code: extractField(lines, '代碼'),
      category: extractField(lines, '類別'),
      description: extractField(lines, '描述'),
      data: section
    };
    
    if (fund.code) {
      funds.push(fund);
    }
  });
  
  return funds;
}

function extractField(lines, fieldName) {
  const line = lines.find(l => l.includes(fieldName));
  if (line) {
    return line.split(':')[1]?.trim() || '';
  }
  return '';
}
