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
  "品牌形象",
  "活動紀錄", 
  "動畫影片 (16:9)",
  "短影音 (9:16)"
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
    <Card className="max-w-4xl mx-auto" style={{ boxShadow: 'var(--card-shadow)' }}>
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
                      : "bg-white text-foreground border-gray-300 hover:border-primary"
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
              className="text-base border-2 border-gray-200 focus:border-primary"
            />
          </div>
          
          <div className="flex justify-end">
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