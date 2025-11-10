import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { RefreshCw, Download, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast"; // 假設您的 toast hook 路徑

// 請替換成您的實際 Web Service URL
const API_BASE_URL = "https://image-generator-i03j.onrender.com"; 

const API_IMAGE_GENERATE_STORE = `${API_BASE_URL}/extract_then_generate`; 
const API_IMAGE_EDIT_STORE = `${API_BASE_URL}/edit_image_store`;

// Props 介面
interface ImageGenerationStepProps {
  scriptResult: string;
  onPrev: () => void;
  onNext: () => void;
}

// 圖片狀態的類型定義
interface ImageState {
    url: string; 
    prompt: string;
    publicUrl: string; 
}

const ImageGenerationStep = ({ scriptResult, onPrev, onNext }: ImageGenerationStepProps) => {
  const { toast } = useToast();
  const [images, setImages] = useState<ImageState[]>([]);
  const [isGenerating, setIsGenerating] = useState(false); // (全域生成)
  const [isRegenerating, setIsRegenerating] = useState<number | null>(null); // (單張生成)
  const [editPrompts, setEditPrompts] = useState<string[]>([]);

  // --- 1. 開始生成 (呼叫 extract_then_generate) ---
  // (此函數保持不變)
  const generateImages = useCallback(async () => {
    setIsGenerating(true);
    
    const payload = {
        result: scriptResult,
        images_per_prompt: 1, // (已修正為 1)
        start_index: 0, 
        naming: "scene"
    };

    toast({ title: "開始生成照片", description: "AI 正在批次生成草稿圖..." });

    try {
        const response = await fetch(API_IMAGE_GENERATE_STORE, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || `生成錯誤: ${response.status}`);
        }

        const data = await response.json();
        console.log("API 回傳的完整 data:", data);

        if (!data.generate_result || !Array.isArray(data.generate_result.results)) {
            throw new Error("API 回應格式不符，缺少 'generate_result.results' 陣列");
        }

        const newImages: ImageState[] = data.generate_result.results.flatMap((result: any) => {
            if (!result.uploaded_urls || result.uploaded_urls.length === 0) {
                if (result.errors && result.errors.length > 0) {
                    console.warn(`一個 prompt 生成失敗: ${result.errors.join(', ')}`);
                }
                return []; 
            }

            return result.uploaded_urls.map((relativePath: string) => {
                const absoluteUrl = `${API_BASE_URL}${relativePath}`;
                return {
                    url: `${absoluteUrl}?v=${Date.now()}`,
                    prompt: result.prompt, 
                    publicUrl: absoluteUrl, // 我們將下載這個 URL
                };
            });
        });

        if (newImages.length === 0) {
            console.warn("所有圖片均生成失敗，請檢查後端日誌。");
            throw new Error(data.generate_result.message || "AI 未能成功生成任何圖片。");
        }
        
        setImages(newImages);
        setEditPrompts(newImages.map(img => img.prompt));
        
        toast({ title: "照片生成完成", description: `已成功生成 ${newImages.length} 張照片` });

    } catch (error) {
        console.error("生成失敗:", error);
        toast({
            variant: 'destructive',
            title: "照片生成失敗",
            description: error instanceof Error ? error.message : "無法連接伺服器或處理圖片。",
        });
    } finally {
        setIsGenerating(false);
    }
  }, [scriptResult, toast]);


  // --- 2. 重新生成單張照片 (呼叫 /edit_image_store) ---
  // (此函數保持不變)
  const regenerateImage = useCallback(async (index: number) => {
    setIsRegenerating(index); // 鎖定此按鈕
    const currentPrompt = editPrompts[index];
    const targetIndex = index; 
    const currentImage = images[index]; 
    
    toast({
        title: "重新生成照片",
        description: `正在抓取原始圖片並使用新提示詞 [${currentPrompt}] 進行編輯...`,
    });
    
    try {
        // ... (省略 fetch 邏輯，與上一版相同) ...
        const imageResponse = await fetch(currentImage.url);
        if (!imageResponse.ok) throw new Error(`無法抓取原始圖片: ${imageResponse.status}`);
        const imageBlob = await imageResponse.blob();

        const formData = new FormData();
        formData.append('edit_prompt', currentPrompt);
        formData.append('file', imageBlob, `original_image_${index}.png`); 

        const response = await fetch(`${API_IMAGE_EDIT_STORE}?target_index=${targetIndex}`, {
            method: 'POST',
            body: formData, 
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.detail || `API 錯誤: ${response.status}`);
        }

        const data = await response.json();
        const newPublicRelativeUrl = data.uploaded_urls[0]; 
        const absoluteUrl = `${API_BASE_URL}${newPublicRelativeUrl}`;
        
        const newImages = [...images];
        newImages[index] = {
            ...currentImage,
            url: `${absoluteUrl}?v=${Date.now()}`, 
            publicUrl: absoluteUrl,
        };
        setImages(newImages);

        toast({
            title: "照片已更新",
            description: `第 ${index + 1} 張照片已重新生成並儲存。`,
        });

    } catch (error) {
        console.error("重新生成失敗:", error);
        toast({
            variant: 'destructive',
            title: "照片編輯失敗",
            description: error instanceof Error ? error.message : "無法連接到伺服器或處理圖片。",
        });
    } finally {
        setIsRegenerating(null); // 解鎖此按鈕
    }
  }, [images, editPrompts, toast]); 

  // --- 3. 下載和更新 Prompt ---

  // --- 【修復：實作下載功能】 ---
  const downloadAllImages = useCallback(async () => {
    // 檢查是否有圖片可下載
    if (images.length === 0) {
         toast({ title: "沒有可下載的圖片", variant: "destructive" });
         return;
    }
    
    // 檢查是否有任務正在執行
    if (isGenerating || isRegenerating !== null) {
        toast({ title: "錯誤", description: "請等待目前生成作業完成", variant: "destructive" });
        return;
    }

    toast({
      title: "開始下載全部照片",
      description: `準備下載 ${images.length} 張照片...`,
    });

    // 我們將循序 (一張接一張) 下載，避免瀏覽器阻擋
    let downloadedCount = 0;
    let failedCount = 0;

    // 使用 for...of 迴圈才能正確使用 await
    for (const [index, image] of images.entries()) {
        const filename = `scene_${index + 1}.png`; // e.g., scene_1.png
        
        try {
            // 1. 抓取圖片資料 (使用 publicUrl)
            // 必須抓取 Blob 才能繞過CORS限制並自訂檔名
            const response = await fetch(image.publicUrl); 
            if (!response.ok) {
                throw new Error(`無法抓取圖片: ${response.statusText}`);
            }
            const blob = await response.blob();

            // 2. 建立本地 Blob URL
            const objectUrl = URL.createObjectURL(blob);

            // 3. 建立 <a> 標籤來觸發下載
            const link = document.createElement('a');
            link.href = objectUrl;
            link.download = filename; // 指定下載的檔名

            // 4. 觸發下載
            document.body.appendChild(link);
            link.click();

            // 5. 清理
            document.body.removeChild(link);
            URL.revokeObjectURL(objectUrl); // 釋放記憶體
            
            downloadedCount++;

        } catch (error) {
            console.error(`下載第 ${index + 1} 張照片失敗:`, error);
            failedCount++;
        }
    }

    // 6. 最終通知
    if (failedCount > 0) {
        toast({
            variant: "destructive",
            title: "下載部分完成",
            description: `成功 ${downloadedCount} 張, 失敗 ${failedCount} 張。`,
        });
    } else {
        toast({
            title: "下載完成",
            description: `已成功下載 ${images.length} 張照片。`,
        });
    }
  }, [images, toast, isGenerating, isRegenerating]); // 加上依賴項

  const updatePrompt = (index: number, value: string) => {
    const newPrompts = [...editPrompts];
    newPrompts[index] = value;
    setEditPrompts(newPrompts);
  };

  return (
    <Card className="max-w-6xl mx-auto bg-accent/10 border-primary/20" style={{ boxShadow: 'var(--card-shadow)' }}>
      <CardContent className="p-8">
        <h2 className="text-2xl font-semibold text-foreground mb-2 text-center">
          AI 照片生成
        </h2>
        
        <p className="text-center text-muted-foreground mb-8">
          根據您的影片腳本，AI 將為您生成符合風格的照片。您可以調整提示詞來優化每張照片。
        </p>

        {images.length === 0 ? (
          <div className="text-center py-12">
            <Button
              onClick={generateImages}
              disabled={isGenerating}
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-6 text-lg font-medium"
            >
              <Sparkles className={`w-5 h-5 mr-2 ${isGenerating ? 'animate-spin' : ''}`} />
              {isGenerating ? "正在生成照片..." : "開始生成照片"}
            </Button>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {images.map((image, index) => (
                <Card key={index} className="bg-card border-primary/20">
                  <CardContent className="p-4">
                    <div className="aspect-video bg-muted rounded-lg overflow-hidden mb-4">
                      {/* 這裡的 "isGenerating" 判斷是全域的，
                        如果您希望單張圖片重新生成時也顯示 "正在載入...",
                        可以改成 {isGenerating || isRegenerating === index ? (...) : (<img.../>)}
                        但目前保持原樣，讓舊圖片顯示直到新圖片載入完成，體驗更好。
                      */}
                      {isGenerating ? (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground animate-pulse">
                          正在載入...
                        </div>
                      ) : (
                        <img 
                          src={image.url} 
                          alt={`生成照片 ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                    
                    <div className="space-y-3">
                      <Input
                        value={editPrompts[index]}
                        onChange={(e) => updatePrompt(index, e.target.value)}
                        placeholder="輸入提示詞來調整照片..."
                        className="border-primary/30 focus:border-primary"
                        // 當全域生成或此張圖片正在生成時，禁用 Input
                        disabled={isGenerating || isRegenerating === index} 
                      />
                      
                      {/* --- 【修復 3：更新按鈕狀態】 --- */}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => regenerateImage(index)}
                        className="w-full border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                        //  disabled 邏輯更新
                        disabled={isGenerating || isRegenerating !== null} // 任何一張在生成時，都禁用
                      >
                        {/* 旋轉動畫 和 文字 變更 */}
                        <RefreshCw className={`w-4 h-4 mr-2 ${isRegenerating === index ? 'animate-spin' : ''}`} />
                        {isRegenerating === index ? "正在生成..." : "重新生成此照片"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* 底部按鈕區域 */}
            <div className="flex justify-center space-x-4 pt-4">
              <Button 
                variant="outline"
                onClick={onPrev}
                className="border-primary text-primary hover:bg-primary hover:text-primary-foreground px-8 py-3 text-base font-medium"
                // 當任何生成在進行時，禁用「上一步」
                disabled={isGenerating || isRegenerating !== null}
              >
                ← 上一步
              </Button>
              
              <Button
                variant="outline"
                onClick={generateImages}
                className="border-primary text-primary hover:bg-primary hover:text-primary-foreground px-8 py-3 text-base font-medium"
                // 當任何生成在進行時，禁用「重新生成全部」
                disabled={isGenerating || isRegenerating !== null}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                重新生成全部
              </Button>
              
              <Button
                variant="outline"
                onClick={downloadAllImages}
                className="border-primary text-primary hover:bg-primary hover:text-primary-foreground px-8 py-3 text-base font-medium"
                // 當任何生成在進行時，禁用「下載照片」
                disabled={isGenerating || isRegenerating !== null}
              >
                <Download className="w-4 h-4 mr-2" />
                下載照片
              </Button>
              
              <Button 
                onClick={onNext}
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 text-base font-medium"
                // 當任何生成在進行時，禁用「生成影片」
                disabled={isGenerating || isRegenerating !== null}
              >
                生成影片 →
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export { ImageGenerationStep };
