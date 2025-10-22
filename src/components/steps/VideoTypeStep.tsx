import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import oneTakeImg from "@/assets/video-one-take.jpg";
import asmrImg from "@/assets/video-asmr.jpg";
import handheldImg from "@/assets/video-handheld.jpg";
import lightingImg from "@/assets/video-lighting.jpg";
import montageImg from "@/assets/video-montage.jpg";

interface VideoTypeStepProps {
  videoType: string;
  targetPlatform: string;
  onVideoTypeChange: (value: string) => void;
  onTargetPlatformChange: (value: string) => void;
  onNext: () => void;
  onPrev: () => void;
}

const videoTypes = [
  { id: "one-take", label: "一鏡到底", image: oneTakeImg },
  { id: "asmr", label: "ASMR風格", image: asmrImg },
  { id: "handheld", label: "手持紀錄感", image: handheldImg },
  { id: "lighting", label: "光影敘事", image: lightingImg },
  { id: "montage", label: "蒙太奇剪接", image: montageImg },
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
            <div className="grid grid-cols-5 gap-4">
              {videoTypes.map((type) => (
                <button
                  key={type.id}
                  onClick={() => onVideoTypeChange(type.id)}
                  className={`relative rounded-lg overflow-hidden transition-all ${
                    videoType === type.id
                      ? "ring-4 ring-primary scale-105"
                      : "hover:scale-102 hover:ring-2 hover:ring-primary/50"
                  }`}
                >
                  <img
                    src={type.image}
                    alt={type.label}
                    className="w-full h-32 object-cover"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                    <p className="text-white text-sm font-medium text-center">{type.label}</p>
                  </div>
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
              disabled={!videoType.trim() || !targetPlatform.trim()}
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