import { useState, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { RefreshCw, Download, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast"; // 假設您的 toast hook 路徑

// 請替換成您的實際 Web Service URL
const API_BASE_URL = "https://image-generator-i03j.onrender.com"; 
const API_IMAGE_GENERATE_STORE = `${API_BASE_URL}/generate_image_store`;
const API_IMAGE_EDIT_STORE = `${API_BASE_URL}/edit_image_store`;

interface ImageGenerationStepProps {
  formData: {
    companyInfo: string;
    videoType: string;
    targetPlatform: string;
    visualStyle: string;
    videoTechniques: string;
  };
  onPrev: () => void;
  onNext: () => void;
}

// 圖片狀態的類型定義
interface ImageState {
    url: string; 
    prompt: string;
    // 預計從後端接收到的公開路徑，用於後續編輯
    publicUrl: string; 
}

const ImageGenerationStep = ({ formData, onPrev, onNext }: ImageGenerationStepProps) => {
  const { toast } = useToast();
  const [images, setImages] = useState<ImageState[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [editPrompts, setEditPrompts] = useState<string[]>(["", "", "", ""]);

  // 輔助函式：根據索引生成圖片的公開 URL
  const generatePublicUrl = (index: number, baseUrl: string) => {
    // 假設後端儲存路徑是 /lovable-uploads/temp/001.png
    const filename = `00${index + 1}.png`;
    return `${baseUrl}/image-uploads/temp/${filename}`;
  };

  // 根據表單數據組合 Base Prompt
  const createBasePrompt = useMemo(() => {
    // 這裡組合您的 Style 和 Techniques 作為 Base Prompt
    return `Style: ${formData.visualStyle}. Techniques: ${formData.videoTechniques}.`;
  }, [formData]);


  // --- 1. 開始生成 (呼叫 /generate_image_store) ---
  const generateImages = useCallback(async () => {
    setIsGenerating(true);
    
    // 組合請求 Body (對應後端的 KontextAndImageCreate 模型)
    const payload = {
        description: `公司資訊: ${formData.companyInfo}. 影片類型: ${formData.videoType}.`,
        base_prompt: createBasePrompt,
        image_count: 4, // 請求生成 4 張圖
    };

    toast({ title: "開始生成照片", description: "AI 正在根據您的腳本生成 4 張草稿圖..." });

    try {
        const response = await fetch(`${API_BASE_URL}/generate_image_store?target_index=0`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json', // 這裡傳送的是 JSON Body
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || `生成錯誤: ${response.status}`);
        }

        const data = await response.json();
        
        // 假設後端回傳的 data.uploaded_urls 包含了 4 個公開 URL
        const newImages: ImageState[] = data.uploaded_urls.map((relativePath: string, index: number) => {
            // 這裡使用後端回傳的公開 URL (e.g., .../001.png)
            const absoluteUrl = `${API_BASE_URL}${relativePath}`;
            return {
              url: `${absoluteUrl}?v=${Date.now()}`, 
              prompt: `預設提示詞 ${index + 1} (${data.full_prompt})`, // 假設後端回傳 full_prompt
              publicUrl: absoluteUrl, // 儲存乾淨的公開 URL 供編輯使用
            };
        }));
        
        setImages(newImages);
        setEditPrompts(newImages.map(img => img.prompt));
        
        toast({ title: "照片生成完成", description: `已成功生成 ${newImages.length} 張照片` });

    } catch (error) {
        console.error("生成失敗:", error);
        toast({
            toast.error("照片編輯失敗", {
            description: error instanceof Error ? error.message : "無法連接到伺服器或處理圖片。",
        });
    } finally {
        setIsGenerating(false);
    }
  }, [formData, createBasePrompt, toast]);


  // --- 2. 重新生成單張照片 (呼叫 /edit_image_store) ---
  const regenerateImage = useCallback(async (index: number) => {
    const currentPrompt = editPrompts[index];
    const targetIndex = index; 
    const currentImage = images[index]; // 獲取當前圖片的狀態

    // (可選) 可以在此處設置單張圖片的加載狀態
    
    toast({
        title: "重新生成照片",
        description: `正在抓取原始圖片並使用新提示詞 [${currentPrompt}] 進行編輯...`,
    });
    
    try {
        // --- 修正點：必須將 URL 轉為 File ---
        
        // 1. 抓取當前顯示的圖片 (從其 URL)
        const imageResponse = await fetch(currentImage.url);
        if (!imageResponse.ok) {
            throw new Error(`無法抓取原始圖片進行編輯: ${imageResponse.status}`);
        }
        
        // 2. 將圖片轉換為 Blob (二進制數據)
        const imageBlob = await imageResponse.blob();

        // 3. 建立 FormData 並附加數據
        const formData = new FormData();
        formData.append('edit_prompt', currentPrompt);
        
        // 4. 將 Blob 作為檔案附加
        // 格式: append(name, blob, filename)
        formData.append('file', imageBlob, `original_image_${index}.png`); 
        // --- 修正結束 ---

        const response = await fetch(`${API_BASE_URL}/edit_image_store?target_index=${targetIndex}`, {
            method: 'POST',
            body: formData, 
            // (註: FormData 不需要手動設定 Content-Type)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || `API 錯誤: ${response.status}`);
        }

        const data = await response.json();
        
        // 取得新的公開 URL (後端回傳的 uploaded_urls[0])
        const newPublicUrl = data.uploaded_urls[0];
        
        const newImages = [...images];
        newImages[index] = {
            ...currentImage,
            // 更新 URL，並加上版本號確保瀏覽器重新載入
            url: `${newPublicUrl}?v=${Date.now()}`, 
            publicUrl: newPublicUrl,
            // (可選) 如果後端回傳 edit_prompt，也可以更新
            // prompt: data.edit_prompt 
        };
        
        setImages(newImages);

        toast({
            title: "照片已更新",
            description: `第 ${index + 1} 張照片已重新生成並儲存。`,
        });

    } catch (error) {
        console.error("重新生成失敗:", error);
        toast({
            title: "照片編輯失敗",
            description: error instanceof Error ? error.message : "無法連接到伺服器或處理圖片。",
            variant: "destructive",
        });
    }
  }, [images, editPrompts, toast]); // 確保依賴項正確

  const downloadAllImages = () => {
    // 這裡應該實現一個下載邏輯，例如將所有 publicUrl 傳給後端進行打包下載
    toast({
      title: "下載照片",
      description: "正在準備下載所有照片 (此功能需要後端支援文件打包)...",
    });
  };

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
          根據您的影片腳本，AI 將為您生成最多 4 張符合風格的照片。您可以調整提示詞來優化每張照片。
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
                        disabled={isGenerating}
                      />
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => regenerateImage(index)}
                        className="w-full border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                        disabled={isGenerating}
                      >
                        <RefreshCw className="w-4 h-4 mr-2" />
                        重新生成此照片
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="flex justify-center space-x-4 pt-4">
              <Button 
                variant="outline"
                onClick={onPrev}
                className="border-primary text-primary hover:bg-primary hover:text-primary-foreground px-8 py-3 text-base font-medium"
                disabled={isGenerating}
              >
                ← 上一步
              </Button>
              
              <Button
                variant="outline"
                onClick={generateImages}
                className="border-primary text-primary hover:bg-primary hover:text-primary-foreground px-8 py-3 text-base font-medium"
                disabled={isGenerating}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                重新生成全部
              </Button>
              
              <Button
                variant="outline"
                onClick={downloadAllImages}
                className="border-primary text-primary hover:bg-primary hover:text-primary-foreground px-8 py-3 text-base font-medium"
                disabled={isGenerating}
              >
                <Download className="w-4 h-4 mr-2" />
                下載照片
              </Button>
              
              <Button 
                onClick={onNext}
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 text-base font-medium"
                disabled={isGenerating}
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
