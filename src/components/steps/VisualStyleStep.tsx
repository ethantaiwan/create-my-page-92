import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import realisticPhotoImg from "@/assets/style-realistic-photo.jpg";
import animation3dImg from "@/assets/style-3d-animation.jpg";
import japaneseHanddrawnImg from "@/assets/style-japanese-handdrawn.jpg";
import clayAnimationImg from "@/assets/style-clay-animation.jpg";
import paperCutImg from "@/assets/style-paper-cut.jpg";

interface VisualStyleStepProps {
  selectedStyle: string;
  selectedTechniques: string[];
  onStyleChange: (value: string) => void;
  onTechniquesChange: (value: string[]) => void;
  onNext: () => void;
  onPrev: () => void;
}

const videoTechniques = [
  { id: "realistic-photo", label: "寫實照片風格", image: realisticPhotoImg },
  { id: "3d-animation", label: "3D動畫風格", image: animation3dImg },
  { id: "japanese-handdrawn", label: "日式手繪風格", image: japaneseHanddrawnImg },
  { id: "clay-animation", label: "立體黏土風格", image: clayAnimationImg },
  { id: "paper-cut", label: "剪紙風格", image: paperCutImg },
];

const VisualStyleStep = ({ 
  selectedStyle, 
  selectedTechniques,
  onStyleChange, 
  onTechniquesChange,
  onNext,
  onPrev 
}: VisualStyleStepProps) => {
  
  const handleTechniqueToggle = (techniqueId: string) => {
    if (selectedTechniques.includes(techniqueId)) {
      onTechniquesChange(selectedTechniques.filter(id => id !== techniqueId));
    } else {
      onTechniquesChange([...selectedTechniques, techniqueId]);
    }
  };

  return (
    <Card className="max-w-6xl mx-auto bg-accent/10 border-primary/20" style={{ boxShadow: 'var(--card-shadow)' }}>
      <CardContent className="p-8">
        <h2 className="text-xl font-semibold text-primary mb-6 text-center">
          Q3. 請選擇希望影片呈現的風格與影像手法？
        </h2>
        
        <div className="space-y-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">視覺風格</h3>
            <div className="grid grid-cols-5 gap-4">
              {videoTechniques.map((technique) => (
                <button
                  key={technique.id}
                  onClick={() => handleTechniqueToggle(technique.id)}
                  className={`aspect-[3/2] rounded-lg border-2 transition-colors overflow-hidden relative ${
                    selectedTechniques.includes(technique.id)
                      ? "border-primary bg-primary/5"
                      : "border-primary/30 bg-card/60 hover:border-primary/50 hover:bg-primary/5"
                  }`}
                >
                  <img 
                    src={technique.image} 
                    alt={technique.label}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                    <span className="text-sm font-medium text-white">{technique.label}</span>
                  </div>
                </button>
              ))}
            </div>
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
            >
              生成腳本
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export { VisualStyleStep };