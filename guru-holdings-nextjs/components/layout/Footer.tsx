export function Footer() {
  return (
    <footer className="border-t border-stone-200 bg-background">
      <div className="container py-8">
        <div className="max-w-3xl text-sm leading-6 text-muted-foreground">
          <p>数据来源：SEC EDGAR 13F filings。13F 存在披露延迟，不代表实时持仓。</p>
          <p className="mt-1">本网站只用于信息整理和研究辅助，不构成投资建议。</p>
        </div>
      </div>
    </footer>
  );
}
