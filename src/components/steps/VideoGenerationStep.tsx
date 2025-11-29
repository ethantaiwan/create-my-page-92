import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { RefreshCw, Download, Play, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface VideoGenerationStepProps {
  formData: {
    sceneCount: number; // 我們需要這個數字來決定有幾張圖
    // ... 其他屬性如果沒用到可以不用列，但為了型別完整建議保留
    [key: string]: any; 
  };
  generatedScript: string | null;
  onPrev: () => void;
}

const VideoGenerationStep = ({ formData, generatedScript, onPrev }: VideoGenerationStepProps) => {
  const { toast } = useToast();
  const [videoUrl, setVideoUrl] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

  const generateVideo = async () => {
    // 1. 檢查腳本是否存在
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
      // 步驟 A: 呼叫 prompt-extrval 提取提示詞
      // ----------------------------------------------------                                  
      const promptResponse = await fetch("https://videogenerator-ayob.onrender.com/prompt-retrieval", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
            script: generatedScript 
        }),
      });

      if (!promptResponse.ok) throw new Error("提示詞提取失敗");

      const promptData = await promptResponse.json();
      console.log("Extracted Prompts:", promptData);

      // 處理提示詞轉字串 (假設 promptData 本身就是結果，或是物件內的某個欄位)
      // 根據您的描述，這裡做個簡單的防呆處理
      let finalPromptString = "";
      if (typeof promptData === 'string') {
          finalPromptString = promptData;
      } else if (Array.isArray(promptData)) {
          finalPromptString = promptData.join(" ");
      } else if (promptData.video_prompts) {
          finalPromptString = Array.isArray(promptData.video_prompts) 
            ? promptData.video_prompts.join(" ") 
            : JSON.stringify(promptData.video_prompts);
      } else {
          finalPromptString = JSON.stringify(promptData);
      }

      setStatusMessage("提示詞準備完成，正在生成最終影片...");

      // ----------------------------------------------------
      // 步驟 B: 準備圖片列表 (這裡就是您提到的修改點)
      // ----------------------------------------------------
      // 邏輯：根據 sceneCount 生成對應數量的 URL
      // 例如 sceneCount = 3 -> 001.png, 002.png, 003.png
      
      const count = formData.sceneCount || 4; // 預設 4 張以防萬一
      const generatedImageUrls = Array.from({ length: count }, (_, i) => {
          // 將數字補零至 3 位數，例如 1 -> "001"
          const paddedIndex = String(i + 1).padStart(3, '0');
          return `https://image-generator-i03j.onrender.com/image-uploads/temp/${paddedIndex}.png`;
      });

      console.log("Using Image URLs:", generatedImageUrls);

      // ----------------------------------------------------
      // 步驟 C: 呼叫 generate-final-video
      // ----------------------------------------------------
      const videoPayload = {
        prompt: finalPromptString,
        image_urls: generatedImageUrls,
        // ▼▼▼ 以下參數依照您的要求寫死 ▼▼▼
        style: "realistic",
        width: 1024,
        height: 1024,
        duration: 5,
        fps: 24,
        assemble: "auto",
        transition_duration: 0.0,
        outro_duration: 5,
        model_name: "",
        mode: ""
      };

      const videoResponse = await fetch("https://videogenerator-ayob.onrender.com/generate-final-video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(videoPayload),
      });

      if (!videoResponse.ok) throw new Error("影片生成服務回應錯誤");

      const videoResult = await videoResponse.json();
      
      if (videoResult && videoResult.final_video_url) {
        // 組合 Base URL
        const finalUrl = `https://videogenerator-ayob.onrender.com/${videoResult.final_video_url}`;
        setVideoUrl(finalUrl);
        
        toast({
          title: "影片生成完成",
          description: "您的影片已成功生成！",
        });
      } else {
        throw new Error("無法取得影片連結");
      }

    } catch (error) {
      console.error("Error:", error);
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
      link.target = '_blank';
      link.download = 'generated-video.mp4';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <Card className="max-w-5xl mx-auto bg-accent/10 border-primary/20" style={{ boxShadow: 'var(--card-shadow)' }}>
      <CardContent className="p-8">
        <h2 className="text-2xl font-semibold text-foreground mb-2 text-center">AI 影片生成</h2>
        
        <p className="text-center text-muted-foreground mb-8">
          AI 正在根據腳本與第 {formData.sceneCount || 4} 步生成的圖片合成影片。
        </p>

        {!videoUrl ? (
          <div className="text-center py-16">
            <div className="mb-8">
              <div className="inline-block p-6 bg-primary/10 rounded-full mb-4">
                <Play className="w-16 h-16 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">準備生成您的影片</h3>
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
                 <div className="w-full max-w-md mx-auto bg-muted rounded-full h-2 overflow-hidden mb-2">
                  <div className="h-full bg-primary animate-pulse" style={{ width: '60%' }}></div>
                </div>
                <p className="text-sm text-muted-foreground animate-pulse">
                    {statusMessage || "正在連線..."}
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
                  >
                    您的瀏覽器不支持視頻播放。
                  </video>
                </div>
              </CardContent>
            </Card>
            <div className="flex justify-center space-x-4">
                <Button variant="outline" onClick={onPrev}>← 上一步</Button>
                <Button variant="outline" onClick={() => { setVideoUrl(""); generateVideo(); }}>
                    <RefreshCw className="w-4 h-4 mr-2" /> 重新生成
                </Button>
                <Button onClick={downloadVideo}>
                    <Download className="w-4 h-4 mr-2" /> 下載影片
                </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export { VideoGenerationStep };
