import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { RefreshCw, Download, Play, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface VideoGenerationStepProps {
  formData: {
    brand: string;      // 根據 index.ts 的 formData 修改了這裡的型別定義以匹配
    topic: string;
    videoType: string;
    targetPlatform: string;
    visualStyle: string;
    videoTechniques: string;
  };
  generatedScript: string | null; // ⭐ 新增：接收腳本
  onPrev: () => void;
}

const VideoGenerationStep = ({ formData, generatedScript, onPrev }: VideoGenerationStepProps) => {
  const { toast } = useToast();
  const [videoUrl, setVideoUrl] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [statusMessage, setStatusMessage] = useState(""); // 用來顯示當前進度文字

  const generateVideo = async () => {
    // 1. 檢查是否有腳本
    if (!generatedScript) {
      toast({
        variant: "destructive",
        title: "錯誤",
        description: "找不到腳本數據，請返回上一步重新生成。",
      });
      return;
    }

    setIsGenerating(true);
    setStatusMessage("正在分析腳本並提取視覺提示詞...");
    
    try {
      // ----------------------------------------------------
      // 步驟 1: 呼叫 prompt-extrval 提取提示詞
      // ----------------------------------------------------
      const promptResponse = await fetch("https://dyscriptgenerator.onrender.com/prompt-extrval", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        // 假設後端接收 { script: string } 格式
        body: JSON.stringify({ script: generatedScript }),
      });

      if (!promptResponse.ok) {
        throw new Error("提示詞提取失敗");
      }

      // 假設回傳格式是直接的 List 或包在物件中，這裡假設回傳的是要直接丟給下一步的資料
      const promptData = await promptResponse.json();
      
      console.log("Prompts extracted:", promptData);

      setStatusMessage("提示詞提取完成，正在生成影片 (這可能需要幾分鐘)...");

      // ----------------------------------------------------
      // 步驟 2: 呼叫 generate-final-video 生成影片
      // ----------------------------------------------------
      const videoResponse = await fetch("https://videogenerator-ayob.onrender.com/generate-final-video", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        // 將上一步得到的 prompt list 放入 payload
        // 注意：這裡假設後端接收的 key 是 "video_prompts" 或直接是 promptData
        // 如果 promptData 本身就是 List，則可能需要包裝成 { prompts: promptData }
        body: JSON.stringify(promptData), 
      });

      if (!videoResponse.ok) {
        throw new Error("影片生成服務回應錯誤");
      }

      const videoResult = await videoResponse.json();
      
      // ----------------------------------------------------
      // 步驟 3: 組合最終影片 URL
      // ----------------------------------------------------
      if (videoResult && videoResult.final_video_url) {
        const finalUrl = `https://videogenerator-ayob.onrender.com/${videoResult.final_video_url}`;
        setVideoUrl(finalUrl);
        
        toast({
          title: "影片生成完成",
          description: "您的 AI 影片已準備就緒！",
        });
      } else {
        throw new Error("無法取得影片連結");
      }

    } catch (error) {
      console.error("Generation error:", error);
      toast({
        variant: "destructive",
        title: "生成失敗",
        description: "生成過程中發生錯誤，請稍後再試。",
      });
    } finally {
      setIsGenerating(false);
      setStatusMessage("");
    }
  };

  const downloadVideo = () => {
    if (videoUrl) {
      const link = document.createElement('a');
      link.href = videoUrl;
      link.target = '_blank'; // 建議開新視窗，因為跨域下載有時會被阻擋
      link.download = 'generated-video.mp4';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "下載影片",
        description: "若下載未自動開始，請在影片上按右鍵另存。",
      });
    }
  };

  return (
    <Card className="max-w-5xl mx-auto bg-accent/10 border-primary/20" style={{ boxShadow: 'var(--card-shadow)' }}>
      <CardContent className="p-8">
        <h2 className="text-2xl font-semibold text-foreground mb-2 text-center">
          AI 影片生成
        </h2>
        
        <p className="text-center text-muted-foreground mb-8">
          將您的腳本和照片合成為專業影片。AI 會自動添加轉場效果、配樂和字幕。
        </p>

        {!videoUrl ? (
          <div className="text-center py-16">
            <div className="mb-8">
              <div className="inline-block p-6 bg-primary/10 rounded-full mb-4">
                <Play className="w-16 h-16 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                準備生成您的影片
              </h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                點擊下方按鈕開始生成。生成過程可能需要 3-5 分鐘，請耐心等待。
              </p>
            </div>
            
            <Button
              onClick={generateVideo}
              disabled={isGenerating}
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-10 py-6 text-lg font-medium"
            >
              <Sparkles className={`w-5 h-5 mr-2 ${isGenerating ? 'animate-spin' : ''}`} />
              {isGenerating ? "AI 正在處理中..." : "開始生成影片"}
            </Button>
            
            {isGenerating && (
              <div className="mt-8">
                <div className="w-full max-w-md mx-auto bg-muted rounded-full h-2 overflow-hidden">
                  <div className="h-full bg-primary animate-pulse" style={{ width: '60%' }}></div>
                </div>
                <p className="text-sm text-muted-foreground mt-2 animate-pulse">
                    {statusMessage || "正在連線至 AI 伺服器..."}
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            <Card className="bg-card border-primary/20">
              <CardContent className="p-6">
                <div className="aspect-video bg-black rounded-lg overflow-hidden mb-4 relative">
                  <video 
                    src={videoUrl}
                    controls
                    className="w-full h-full"
                    controlsList="nodownload"
                    preload="metadata"
                  >
                    您的瀏覽器不支持視頻播放。
                  </video>
                </div>
                
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>狀態：生成成功</span>
                  {/* 可以根據實際 API 回傳增加更多資訊 */}
                  <span>格式：MP4</span>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-center space-x-4">
              <Button 
                variant="outline"
                onClick={onPrev}
                className="border-primary text-primary hover:bg-primary hover:text-primary-foreground px-8 py-3 text-base font-medium"
              >
                ← 上一步
              </Button>
              
              <Button
                variant="outline"
                onClick={() => {
                  setVideoUrl("");
                  generateVideo();
                }}
                className="border-primary text-primary hover:bg-primary hover:text-primary-foreground px-8 py-3 text-base font-medium"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                重新生成影片
              </Button>
              
              <Button
                onClick={downloadVideo}
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 text-base font-medium"
              >
                <Download className="w-4 h-4 mr-2" />
                下載影片
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export { VideoGenerationStep };
