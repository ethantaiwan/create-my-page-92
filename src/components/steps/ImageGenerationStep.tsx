import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { RefreshCw, Download, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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

const ImageGenerationStep = ({ formData, onPrev, onNext }: ImageGenerationStepProps) => {
  const { toast } = useToast();
  const [images, setImages] = useState<Array<{ url: string; prompt: string }>>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [editPrompts, setEditPrompts] = useState<string[]>(["", "", "", ""]);

  const generateImages = async () => {
    setIsGenerating(true);
    
    // Simulate AI image generation
    setTimeout(() => {
      const mockImages = [
        { url: "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=800&h=600&fit=crop", prompt: "開場畫面 - 公司標誌展示" },
        { url: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&h=600&fit=crop", prompt: "產品特寫 - 細節展示" },
        { url: "https://images.unsplash.com/photo-1551434678-e076c223a692?w=800&h=600&fit=crop", prompt: "團隊工作場景" },
        { url: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=800&h=600&fit=crop", prompt: "結尾畫面 - 品牌信息" },
      ];
      setImages(mockImages);
      setEditPrompts(mockImages.map(img => img.prompt));
      setIsGenerating(false);
      toast({
        title: "照片生成完成",
        description: "已成功生成 4 張照片",
      });
    }, 3000);
  };

  const regenerateImage = (index: number) => {
    const newImages = [...images];
    toast({
      title: "重新生成照片",
      description: `正在重新生成第 ${index + 1} 張照片...`,
    });
    
    setTimeout(() => {
      newImages[index] = {
        ...newImages[index],
        url: `${newImages[index].url}?v=${Date.now()}`
      };
      setImages(newImages);
      toast({
        title: "照片已更新",
        description: `第 ${index + 1} 張照片已重新生成`,
      });
    }, 2000);
  };

  const downloadAllImages = () => {
    toast({
      title: "下載照片",
      description: "正在準備下載所有照片...",
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
                      <img 
                        src={image.url} 
                        alt={`生成照片 ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    
                    <div className="space-y-3">
                      <Input
                        value={editPrompts[index]}
                        onChange={(e) => updatePrompt(index, e.target.value)}
                        placeholder="輸入提示詞來調整照片..."
                        className="border-primary/30 focus:border-primary"
                      />
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => regenerateImage(index)}
                        className="w-full border-primary text-primary hover:bg-primary hover:text-primary-foreground"
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
              >
                ← 上一步
              </Button>
              
              <Button
                variant="outline"
                onClick={generateImages}
                className="border-primary text-primary hover:bg-primary hover:text-primary-foreground px-8 py-3 text-base font-medium"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                重新生成全部
              </Button>
              
              <Button
                variant="outline"
                onClick={downloadAllImages}
                className="border-primary text-primary hover:bg-primary hover:text-primary-foreground px-8 py-3 text-base font-medium"
              >
                <Download className="w-4 h-4 mr-2" />
                下載照片
              </Button>
              
              <Button 
                onClick={onNext}
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 text-base font-medium"
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
