import { useState, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { RefreshCw, Download, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast"; // 假設您的 toast hook 路徑

// 請替換成您的實際 Web Service URL
const API_BASE_URL = "https://image-generator-i03j.onrender.com"; 

// ❗ 假設 /api/extract_then_generate 是您後端的新路由
const API_IMAGE_GENERATE_STORE = `${API_BASE_URL}/extract_then_generate`; 
const API_IMAGE_EDIT_STORE = `${API_BASE_URL}/edit_image_store`;

interface ImageGenerationStepProps {
  formData: {
    companyInfo: string;
    videoType: string;
    targetPlatform: string;
    visualStyle: string;
    videoTechniques: string;
    scriptResult: string;
  };
  onPrev: () => void;
  onNext: () => void;
}

// 圖片狀態的類型定義
interface ImageState {
    url: string; 
    prompt: string;
    publicUrl: string; 
}

//const ImageGenerationStep = ({ formData, onPrev, onNext }: ImageGenerationStepProps) => {
const ImageGenerationStep = ({ scriptResult, onPrev, onNext }: ImageGenerationStepProps) => {
  const { toast } = useToast();
  const [images, setImages] = useState<ImageState[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [editPrompts, setEditPrompts] = useState<string[]>(["", "", "", ""]);

  // 根據表單數據組合 Base Prompt
//  const createBasePrompt = useMemo(() => {
//    return `Style: ${formData.visualStyle}. Techniques: ${formData.videoTechniques}.`;
//  }, [formData]);


  // --- 1. 開始生成 (呼叫 extract_then_generate) ---
  const generateImages = useCallback(async () => {
    setIsGenerating(true);
    
    // 1. 組合 "result" 字串 (來自 "第一步" 的 formData)
   // const description = `公司資訊: ${formData.companyInfo}. 影片類型: ${formData.videoType}.`;
    //const combinedPrompt = `${description}. ${createBasePrompt}`; // 這就是 data.result
    console.log("新的：",scriptResult)

    // 2. 組合新的 API Payload
    const payload = {
        result: scriptResult, // <-- 使用傳入的 prop,
        images_per_prompt: 4, // 告訴後端我們需要 4 張
        start_index: 0,       // 從索引 0 開始 (001.png)
        naming: "scene"
    };

    toast({ title: "開始生成照片", description: "AI 正在批次生成 4 張草稿圖..." });

    try {
        // 3. 呼叫新的 API (單次呼叫)
        const response = await fetch(API_IMAGE_GENERATE_STORE, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || `生成錯誤: ${response.status}`);
        }

        const data = await response.json();
        
        // 4. 處理回傳 (修正 map 語法)
        const newImages: ImageState[] = data.uploaded_urls.map((relativePath: string, index: number) => {
            const absoluteUrl = `${API_BASE_URL}${relativePath}`;
            return {
              url: `${absoluteUrl}?v=${Date.now()}`, 
              prompt: `預設提示詞 ${index + 1} (${data.full_prompt || combinedPrompt})`, 
              publicUrl: absoluteUrl, 
            };
        });
        
        setImages(newImages);
        setEditPrompts(newImages.map(img => img.prompt));
        
        toast({ title: "照片生成完成", description: `已成功生成 ${newImages.length} 張照片` });

    } catch (error) {
        console.error("生成失敗:", error);
        
        // ❗ 修正 toast 語法錯誤 ❗
        toast.error("照片生成失敗", {
            description: error instanceof Error ? error.message : "無法連接伺服器或處理圖片。",
        });
    } finally {
        setIsGenerating(false);
    }
  }, [scriptResult, toast]);


  // --- 2. 重新生成單張照片 (呼叫 /edit_image_store) ---
  const regenerateImage = useCallback(async (index: number) => {
    const currentPrompt = editPrompts[index];
    const targetIndex = index; 
    const currentImage = images[index]; 
    
    toast({
        title: "重新生成照片",
        description: `正在抓取原始圖片並使用新提示詞 [${currentPrompt}] 進行編輯...`,
    });
    
    try {
        // 1. 抓取圖片並轉為 Blob
        const imageResponse = await fetch(currentImage.url);
        if (!imageResponse.ok) {
            throw new Error(`無法抓取原始圖片進行編輯: ${imageResponse.status}`);
        }
        const imageBlob = await imageResponse.blob();

        // 2. 建立 FormData
        const formData = new FormData();
        formData.append('edit_prompt', currentPrompt);
        formData.append('file', imageBlob, `original_image_${index}.png`); 

        // 3. 呼叫 API (edit_image_store 路由)
        const response = await fetch(`${API_IMAGE_EDIT_STORE}?target_index=${targetIndex}`, {
            method: 'POST',
            body: formData, 
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || `API 錯誤: ${response.status}`);
        }

        const data = await response.json();
        
        // 4. 更新狀態
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
        
        // ❗ 修正 toast 語法錯誤 ❗
        toast.error("照片編輯失敗", {
            description: error instanceof Error ? error.message : "無法連接到伺服器或處理圖片。",
        });
    }
  }, [images, editPrompts, toast]); 

  // --- 3. 下載和更新 Prompt (保持不變) ---

  const downloadAllImages = () => {
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

  // --- 4. JSX 渲染 (保持不變) ---
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
