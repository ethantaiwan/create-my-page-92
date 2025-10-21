import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";

interface VideoTypeStepProps {
  videoType: string;
  targetPlatform: string;
  onVideoTypeChange: (value: string) => void;
  onTargetPlatformChange: (value: string) => void;
  onNext: () => void;
  onPrev: () => void;
}

const videoTypes = [
  "一鏡到底",
  "ASMR風格",
  "手持紀錄感",
  "慢動作氛圍",
  "Split Screen 分割畫面",
  "延遲攝影",
  "光影敘事",
  "蒙太奇剪接"
];

const VideoTypeStep = ({ 
  videoType, 
  targetPlatform, 
  onVideoTypeChange, 
  onTargetPlatformChange, 
  onNext,
  onPrev 
}: VideoTypeStepProps) => {
  return (
    <Card className="max-w-4xl mx-auto bg-accent/10 border-primary/20" style={{ boxShadow: 'var(--card-shadow)' }}>
      <CardContent className="p-8">
        <h2 className="text-xl font-semibold text-primary mb-6 text-center">
          Q2. 預計製作哪種類型的影片？主要曝光在哪些平台？
        </h2>
        
        <div className="space-y-6">
          <div>
            <Label className="text-base font-semibold mb-3 block">影片類型</Label>
            <div className="flex flex-wrap gap-3">
              {videoTypes.map((type) => (
                <button
                  key={type}
                  onClick={() => onVideoTypeChange(type)}
                  className={`px-4 py-2 rounded-md border-2 transition-colors ${
                    videoType === type
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-card/80 text-foreground border-primary/30 hover:border-primary hover:bg-primary/5"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label className="text-base font-semibold mb-3 block">目標平台</Label>
            <Input
              placeholder="例：我想做一支品牌形象影片，放在YouTube與社群廣告用"
              value={targetPlatform}
              onChange={(e) => onTargetPlatformChange(e.target.value)}
              className="text-base border-2 border-primary/30 focus:border-primary bg-card/80"
            />
          </div>
          
          <div className="flex justify-between">
            <Button 
              variant="outline"
              onClick={onPrev}
              className="border-primary text-primary hover:bg-primary hover:text-primary-foreground px-8 py-3 text-base font-medium"
            >
              ← 上一步
            </Button>
            <Button 
              onClick={onNext}
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 text-base font-medium"
              disabled={!videoType || !targetPlatform.trim()}
            >
              下一題 →
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export { VideoTypeStep };