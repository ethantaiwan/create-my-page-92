import { useState, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { RefreshCw, Download, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// ====== API 常數 ======
const API_BASE_URL = "https://image-generator-i03j.onrender.com";
const API_EXTRACT_THEN_GENERATE = `${API_BASE_URL}/extract_then_generate`; // 一鍵流程
const API_IMAGE_EDIT_STORE = `${API_BASE_URL}/edit_image_store`;            // 單張重生

// ====== Props ======
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
  /**
   * 上一步產出的「完整腳本文字」（必須包含 image_prompt 段落；多行用 \n）
   * 若未提供將無法啟動「一鍵生成」流程
   */
  scriptText?: string;
}

// ====== 型別 ======
interface ImageState {
  url: string;
  prompt: string;
  publicUrl: string;
}

type ExtractThenGenerateOut = {
  forward_body: {
    prompts: string[];
    images_per_prompt: number;
    start_index: number;
    naming: "scene" | "sequence";
  };
  generate_result: {
    message: string;
    results: Array<{
      prompt_index: number;
      uploaded_urls: string[];
      errors: string[];
    }>;
  };
  uploaded_urls_flat: string[];
  n_prompts: number;
  images_per_prompt: number;
};

const ImageGenerationStep = ({ formData, onPrev, onNext, scriptText }: ImageGenerationStepProps) => {
  const { toast } = useToast();
  const [images, setImages] = useState<ImageState[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [editPrompts, setEditPrompts] = useState<string[]>(["", "", "", ""]);

  // 顯示用途的 base prompt（非必要，但保留給你 UI）
  const createBasePrompt = useMemo(() => {
    return `Style: ${formData.visualStyle}. Techniques: ${formData.videoTechniques}.`;
  }, [formData.visualStyle, formData.videoTechniques]);

  // ====== 一鍵生成：解析腳本 → 驗證 → 自動生圖 → 回傳 URL ======
  const generateImages = useCallback(async () => {
  setIsGenerating(true);
  setImages([]);
  setEditPrompts(["", "", "", ""]);

  try {
    // 1) 從上一步的 JSON 取出完整腳本文字（需含 image_prompt 段）
    let resultText = (props.data?.result ?? "").toString();
    resultText = resultText.replace(/\r\n/g, "\n").trim(); // 正規化換行與空白

    if (!resultText) {
      toast({
        title: "缺少腳本文字",
        description: "找不到上一步的 data.result（含 image_prompt），請先完成腳本步驟。",
        variant: "destructive",
      });
      return;
    }

    // 2) 組 payload：與後端 /extract_then_generate 要求一致
    const payload = {
      result: resultText,
      images_per_prompt: 1,
      start_index: 0,
      naming: "scene" as const,
    };

    toast({
      title: "開始生成照片",
      description: "AI 正在解析腳本並生成圖片…",
    });

    const resp = await fetch(API_EXTRACT_THEN_GENERATE, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!resp.ok) {
      let msg = `生成 API 失敗：${resp.status}`;
      try {
        const err = await resp.json();
        msg = typeof err?.detail === "string" ? err.detail : JSON.stringify(err);
      } catch {}
      throw new Error(msg);
    }

    const data: ExtractThenGenerateOut = await resp.json();

    // 3) 轉成絕對網址 + cache-buster
    const absUrls = (data.uploaded_urls_flat || []).map(
      (u) => `${API_BASE_URL}${u}?v=${Date.now()}`
    );
    const promptsFromServer = data.forward_body?.prompts ?? [];

    const imgStates: ImageState[] = absUrls.map((url, i) => ({
      url,
      prompt: promptsFromServer[i] ?? "",
      publicUrl: url.replace(/\?v=\d+$/, ""),
    }));

    setImages(imgStates);
    setEditPrompts(promptsFromServer);

    toast({
      title: "照片生成完成",
      description: `成功生成 ${absUrls.length} 張。`,
    });
  } catch (e) {
    console.error("生成失敗:", e);
    toast({
      title: "照片生成失敗",
      description: e instanceof Error ? e.message : "無法連接伺服器或處理圖片。",
      variant: "destructive",
    });
  } finally {
    setIsGenerating(false);
  }
}, [toast, props.data]);


  // ====== 單張重生：/edit_image_store ======
  const regenerateImage = useCallback(
    async (index: number) => {
      const currentPrompt = editPrompts[index];
      const currentImage = images[index];
      const targetIndex = index;

      if (!currentImage) return;

      toast({
        title: "重新生成照片",
        description: `使用新提示詞重生第 ${index + 1} 張…`,
      });

      try {
        // 1) 抓取現有圖片 → Blob
        const imageResponse = await fetch(currentImage.url, { cache: "no-store" });
        if (!imageResponse.ok) {
          throw new Error(`無法抓取原始圖片：${imageResponse.status}`);
        }
        const imageBlob = await imageResponse.blob();

        // 2) FormData 準備
        const fd = new FormData();
        fd.append("edit_prompt", currentPrompt);
        fd.append("file", imageBlob, `original_image_${index}.png`);

        // 3) 呼叫後端
        const resp = await fetch(`${API_IMAGE_EDIT_STORE}?target_index=${targetIndex}`, {
          method: "POST",
          body: fd,
        });

        if (!resp.ok) {
          let msg = `API 錯誤：${resp.status}`;
          try {
            const err = await resp.json();
            msg = typeof err?.detail === "string" ? err.detail : JSON.stringify(err);
          } catch {
            // ignore
          }
          throw new Error(msg);
        }

        const data = await resp.json();
        const rel = data.uploaded_urls?.[0];
        if (!rel) throw new Error("後端未回傳 uploaded_urls。");

        const abs = `${API_BASE_URL}${rel}`;

        const next = [...images];
        next[index] = {
          ...currentImage,
          url: `${abs}?v=${Date.now()}`,
          publicUrl: abs,
        };
        setImages(next);

        toast({
          title: "照片已更新",
          description: `第 ${index + 1} 張已重新生成。`,
        });
      } catch (e) {
        console.error("重新生成失敗:", e);
        toast({
          title: "照片編輯失敗",
          description: e instanceof Error ? e.message : "無法連接到伺服器或處理圖片。",
          variant: "destructive",
        });
      }
    },
    [images, editPrompts, toast]
  );

  // ====== 下載全部（占位：保留 UI） ======
  const downloadAllImages = () => {
    toast({
      title: "下載照片",
      description: "正在準備打包（需要後端提供打包 zip 端點）…",
    });
  };

  const updatePrompt = (index: number, value: string) => {
    const next = [...editPrompts];
    next[index] = value;
    setEditPrompts(next);
  };

  return (
    <Card className="max-w-6xl mx-auto bg-accent/10 border-primary/20" style={{ boxShadow: 'var(--card-shadow)' }}>
      <CardContent className="p-8">
        <h2 className="text-2xl font-semibold text-foreground mb-2 text-center">AI 照片生成</h2>

        <p className="text-center text-muted-foreground mb-8">
          依據上一頁的劇本（含 image_prompt），一次自動生成照片。需要調整可在下方修改提示詞後單張重生。
        </p>

        {images.length === 0 ? (
          <div className="text-center py-12">
            <Button
              onClick={generateImages}
              disabled={isGenerating}
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-6 text-lg font-medium"
            >
              <Sparkles className={`w-5 h-5 mr-2 ${isGenerating ? "animate-spin" : ""}`} />
              {isGenerating ? "正在生成照片..." : "開始生成照片"}
            </Button>

            {/* 可選：顯示基礎風格供使用者確認 */}
            {createBasePrompt && (
              <p className="mt-4 text-sm text-muted-foreground">
                {createBasePrompt}
              </p>
            )}
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
                          loading="lazy"
                        />
                      )}
                    </div>

                    <div className="space-y-3">
                      <Input
                        value={editPrompts[index] ?? ""}
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
