import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { RefreshCw, Download, Image } from "lucide-react";

interface ScriptGenerationStepProps {
  formData: {
    companyInfo: string;
    videoType: string;
    targetPlatform: string;
    visualStyle: string;
    videoTechniques: string[];
  };
  onPrev: () => void;
  onNext: () => void;
}

const ScriptGenerationStep = ({ formData, onPrev, onNext }: ScriptGenerationStepProps) => {
  const [generatedScript, setGeneratedScript] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationCount, setGenerationCount] = useState(0);

  const generateScript = () => {
    setIsGenerating(true);
    
    // Simulate AI generation delay
    setTimeout(() => {
      const sampleScript = `這部自動生成的腳本
要帶給文字輸入框的孩子。

我們每天下午一書

9:16

形象影片

視覺風格: robot
影像手法: tech9`;

      setGeneratedScript(sampleScript);
      setIsGenerating(false);
      setGenerationCount(prev => prev + 1);
    }, 2000);
  };

  const downloadScript = () => {
    const element = document.createElement('a');
    const file = new Blob([generatedScript], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = 'video-script.txt';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  useEffect(() => {
    // Auto-generate script when component mounts
    generateScript();
  }, []);

  return (
    <Card className="max-w-4xl mx-auto bg-accent/10 border-primary/20" style={{ boxShadow: 'var(--card-shadow)' }}>
      <CardContent className="p-8">
        <h2 className="text-2xl font-semibold text-foreground mb-2 text-center">
          影片腳本生成
        </h2>
        
        <p className="text-center text-muted-foreground mb-8">
          依據您提供的資訊，AI已為您產生影片腳本。您可以在下方編輯、調整或重新生成腳本內容。
        </p>
        
        <div className="space-y-6">
          <Card className="bg-accent/10 border-primary/20">
            <CardContent className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-primary">AI腳本生成結果</h3>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={generateScript}
                    disabled={isGenerating}
                    className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                  >
                    <RefreshCw className={`w-4 h-4 mr-2 ${isGenerating ? 'animate-spin' : ''}`} />
                    AI 重新生成({generationCount}/3)
                  </Button>
                </div>
              </div>
              
              <Textarea
                value={isGenerating ? "正在生成腳本，請稍候..." : generatedScript}
                onChange={(e) => setGeneratedScript(e.target.value)}
                className="min-h-[300px] text-base resize-none border border-dashed border-primary/30 focus:border-dashed focus:border-primary/30 bg-card/80"
                disabled={isGenerating}
              />
            </CardContent>
          </Card>
          
          <div className="flex justify-center">
            <div className="flex space-x-4">
              <Button 
                variant="outline"
                onClick={onPrev}
                className="border-primary text-primary hover:bg-primary hover:text-primary-foreground px-8 py-3 text-base font-medium"
              >
                ← 上一步
              </Button>
              <Button 
                onClick={downloadScript}
                variant="outline"
                className="border-primary text-primary hover:bg-primary hover:text-primary-foreground px-8 py-3 text-base font-medium"
                disabled={isGenerating || !generatedScript}
              >
                <Download className="w-4 h-4 mr-2" />
                下載文字腳本
              </Button>
              <Button 
                onClick={onNext}
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 text-base font-medium"
                disabled={isGenerating || !generatedScript}
              >
                <Image className="w-4 h-4 mr-2" />
                生成照片
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export { ScriptGenerationStep };