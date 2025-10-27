import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import oneTakeImg from "@/assets/video-one-take.jpg";
import asmrImg from "@/assets/video-asmr.jpg";
import handheldImg from "@/assets/video-handheld.jpg";
import lightingImg from "@/assets/video-lighting.jpg";
import montageImg from "@/assets/video-montage.jpg";
import slowMotionImg from "@/assets/video-slow-motion.jpg";
import splitScreenImg from "@/assets/video-split-screen.jpg";
import timelapseImg from "@/assets/video-timelapse.jpg";


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
  { id: "slow-motion", label: "慢動作攝影", image: slowMotionImg },
  { id: "split-screen", label: "Split Screen 分割畫面", image: splitScreenImg },
  { id: "timelapse", label: "延遲攝影", image: timelapseImg },
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

  // 1. 新增判斷：確保兩個必要欄位都有值
  const isFormValid = videoType.trim() !== "" && targetPlatform.trim() !== "";

  return (
    <Card className="max-w-6xl mx-auto bg-accent/10 border-primary/20" style={{ boxShadow: 'var(--card-shadow)' }}>
      <CardContent className="p-8">
        <h2 className="text-xl font-semibold text-primary mb-6 text-center">
          Q2. 請選擇影片的鏡頭語言、目標平台與發佈類型？
        </h2>
        
        <div className="space-y-8">
          
          {/* 鏡頭語言選擇區 */}
          <div>
            <h3 className="text-lg font-semibold mb-4">鏡頭語言/風格</h3>
            <div className="grid grid-cols-4 gap-4">
              {videoTypes.map((type) => (
                <button
                  key={type.id}
                  onClick={() => onVideoTypeChange(type.id)}
                  // 2. 應用選中樣式：使用傳入的 videoType props 進行比對
                  className={`aspect-[3/2] rounded-lg overflow-hidden relative transition-all ${
                    videoType === type.id
                      ? "ring-4 ring-primary scale-105"
                      : "hover:scale-102 hover:ring-2 hover:ring-primary/50"
                  }`}
                >
                  <img 
                    src={type.image} 
                    alt={type.label}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                    <span className="text-sm font-medium text-white">{type.label}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* 平台與發佈類型輸入區 */}
          <div className="flex space-x-6">
            <div className="flex-1 space-y-2">
              <Label htmlFor="target-platform" className="text-lg font-semibold block">
                目標發佈平台
              </Label>
              <Input
                id="target-platform"
                type="text"
                placeholder="例：YouTube、Instagram (IG) Reels、TikTok"
                // 3. 確保輸入框顯示當前狀態：使用傳入的 targetPlatform props
                value={targetPlatform}
                onChange={(e) => onTargetPlatformChange(e.target.value)}
                className="bg-card/80 border-primary/30"
              />
            </div>
          </div>
          
          {/* 導航按鈕 */}
          <div className="flex justify-between mt-8">
            <Button 
              variant="outline"
              onClick={onPrev}
              className="border-primary text-primary hover:bg-primary hover:text-primary-foreground px-8 py-3 text-base font-medium"
            >
              ← 上一步
            </Button>
            <Button 
              onClick={onNext}
              // 4. 控制按鈕禁用狀態：使用 isFormValid
              disabled={!isFormValid} 
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 text-base font-medium"
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
