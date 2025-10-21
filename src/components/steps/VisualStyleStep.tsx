import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface VisualStyleStepProps {
  selectedStyle: string;
  selectedTechniques: string[];
  onStyleChange: (value: string) => void;
  onTechniquesChange: (value: string[]) => void;
  onNext: () => void;
  onPrev: () => void;
}

const videoTechniques = [
  { id: "one-take", name: "", label: "一鏡到底" },
  { id: "asmr", name: "", label: "ASMR風格" },
  { id: "handheld", name: "", label: "手持紀錄感" },
  { id: "slow-motion", name: "", label: "慢動作氛圍" },
  { id: "split-screen", name: "", label: "Split Screen 分割畫面" },
  { id: "timelapse", name: "", label: "延遲攝影" },
  { id: "lighting", name: "", label: "光影敘事" },
  { id: "montage", name: "", label: "蒙太奇剪接" },
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
            <h3 className="text-lg font-semibold mb-4">影像手法</h3>
            <div className="grid grid-cols-4 gap-4">
              {videoTechniques.map((technique) => (
                <button
                  key={technique.id}
                  onClick={() => handleTechniqueToggle(technique.id)}
                  className={`aspect-[3/2] rounded-lg border-2 transition-colors flex flex-col items-center justify-center p-4 ${
                    selectedTechniques.includes(technique.id)
                      ? "border-primary bg-primary/5"
                      : "border-primary/30 bg-card/60 hover:border-primary/50 hover:bg-primary/5"
                  }`}
                >
                  <div className="w-full h-20 bg-muted rounded mb-2 flex items-center justify-center text-muted-foreground">
                    {technique.name && <span className="text-sm">{technique.name}</span>}
                  </div>
                  <span className="text-sm font-medium">{technique.label}</span>
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