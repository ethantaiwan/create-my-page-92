import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { RefreshCw, Download, Play, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface VideoGenerationStepProps {
  formData: {
    companyInfo: string;
    videoType: string;
    targetPlatform: string;
    visualStyle: string;
    videoTechniques: string[];
  };
  onPrev: () => void;
}

const VideoGenerationStep = ({ formData, onPrev }: VideoGenerationStepProps) => {
  const { toast } = useToast();
  const [videoUrl, setVideoUrl] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const generateVideo = async () => {
    setIsGenerating(true);
    toast({
      title: "開始生成影片",
      description: "AI 正在根據您的腳本和照片生成影片，這可能需要幾分鐘...",
    });
    
    // Simulate AI video generation
    setTimeout(() => {
      // Using a sample video URL - in production this would be the generated video
      setVideoUrl("https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4");
      setIsGenerating(false);
      toast({
        title: "影片生成完成",
        description: "您的影片已成功生成！",
      });
    }, 5000);
  };

  const downloadVideo = () => {
    if (videoUrl) {
      const link = document.createElement('a');
      link.href = videoUrl;
      link.download = 'generated-video.mp4';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "下載影片",
        description: "影片下載已開始",
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
              {isGenerating ? "正在生成影片..." : "開始生成影片"}
            </Button>
            
            {isGenerating && (
              <div className="mt-8">
                <div className="w-full max-w-md mx-auto bg-muted rounded-full h-2 overflow-hidden">
                  <div className="h-full bg-primary animate-pulse" style={{ width: '60%' }}></div>
                </div>
                <p className="text-sm text-muted-foreground mt-2">生成進度：正在處理...</p>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            <Card className="bg-card border-primary/20">
              <CardContent className="p-6">
                <div className="aspect-video bg-black rounded-lg overflow-hidden mb-4">
                  <video 
                    src={videoUrl}
                    controls
                    className="w-full h-full"
                    controlsList="nodownload"
                  >
                    您的瀏覽器不支持視頻播放。
                  </video>
                </div>
                
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>影片時長：約 30 秒</span>
                  <span>解析度：1920x1080</span>
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
