import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label"; // 假設您有 Label 元件

// 1. 修改 Props 介面：接收和傳遞 brand 與 topic
interface CompanyInfoStepProps {
  brand: string; // 接收品牌值
  topic: string; // 接收主題/產品值
  
  // 修改 onChange 函數，使其傳遞一個包含 brand 和 topic 的物件
  onChange: (data: { brand: string; topic: string }) => void;
  onNext: () => void;
}

const CompanyInfoStep = ({ brand, topic, onChange, onNext }: CompanyInfoStepProps) => {
  
  // 內部狀態用於處理輸入框的即時變化
  const [currentBrand, setCurrentBrand] = useState(brand);
  const [currentTopic, setCurrentTopic] = useState(topic);

  // 確保當外部 props 改變時 (例如用戶點擊上一步回來)，內部狀態同步
  useEffect(() => {
    setCurrentBrand(brand);
    setCurrentTopic(topic);
  }, [brand, topic]);

  // 處理 Brand 輸入框的變化
  const handleBrandChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newBrand = e.target.value;
    setCurrentBrand(newBrand);
    // 立即將兩個值傳遞給父元件
    onChange({ brand: newBrand, topic: currentTopic });
  };
  
  // 處理 Topic 輸入框的變化
  const handleTopicChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newTopic = e.target.value;
    setCurrentTopic(newTopic);
    // 立即將兩個值傳遞給父元件
    onChange({ brand: currentBrand, topic: newTopic });
  };

  // 判斷按鈕是否禁用
  const isButtonDisabled = !currentBrand.trim() || !currentTopic.trim();

  return (
    <Card className="max-w-4xl mx-auto bg-accent/10 border-primary/20" style={{ boxShadow: 'var(--card-shadow)' }}>
      <CardContent className="p-8">
        <h2 className="text-xl font-semibold text-primary mb-6 text-center">
          Q1. 請輸入您的品牌資訊與影片主題？
        </h2>
        
        <div className="space-y-6">
          
          {/* Brand 輸入框 */}
          <div>
            <Label htmlFor="brand-input" className="text-lg font-medium mb-2 block">
              品牌 / 公司名稱
            </Label>
            <Textarea
              id="brand-input"
              placeholder="例：最愛安妮"
              value={currentBrand}
              onChange={handleBrandChange}
              className="min-h-[100px] text-base resize-none border border-dashed border-primary/30 focus:border-dashed focus:border-primary/30 bg-card/80"
            />
          </div>
          
          {/* Topic 輸入框 */}
          <div>
            <Label htmlFor="topic-input" className="text-lg font-medium mb-2 block">
              影片主題 / 產品服務說明
            </Label>
            <Textarea
              id="topic-input"
              placeholder="例：專做天然保健食品的品牌，主題是益生菌的五大功效"
              value={currentTopic}
              onChange={handleTopicChange}
              className="min-h-[200px] text-base resize-none border border-dashed border-primary/30 focus:border-dashed focus:border-primary/30 bg-card/80"
            />
          </div>

          <div className="flex justify-end pt-4">
            <Button 
              onClick={onNext}
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 text-base font-medium"
              disabled={isButtonDisabled} // 兩個欄位都必須有內容
            >
              下一題 →
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export { CompanyInfoStep };
