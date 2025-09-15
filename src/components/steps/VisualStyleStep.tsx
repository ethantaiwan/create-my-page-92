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

const visualStyles = [
  { id: "simple", name: "簡約典雅", selected: true },
  { id: "dynamic", name: "活力動感" },
  { id: "warm", name: "溫暖人文" },
  { id: "tech", name: "科技未來" },
  { id: "robot", name: "機器人風" },
];

const videoTechniques = [
  { id: "slow-motion", name: "Slow Motion", label: "slow-motion" },
  { id: "closeup", name: "Close Up", label: "近距離特寫" },
  { id: "technique3", name: "", label: "○○○○○○○○○○" },
  { id: "technique4", name: "", label: "○○○○○○○○" },
  { id: "technique5", name: "", label: "○○○○○○○○○○" },
  { id: "technique6", name: "", label: "○○○○○○○○○○" },
  { id: "technique7", name: "", label: "○○○○○○○○○○" },
  { id: "technique8", name: "", label: "○○○○○○○○○○○○" },
  { id: "technique9", name: "", label: "○○○○○○○○○○" },
  { id: "technique10", name: "", label: "○○○○○○○○○○" },
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
              {visualStyles.map((style) => (
                <button
                  key={style.id}
                  onClick={() => onStyleChange(style.id)}
                  className={`aspect-[3/4] rounded-lg border-2 transition-colors flex flex-col items-center justify-center p-4 ${
                    selectedStyle === style.id || (selectedStyle === "" && style.selected)
                      ? "border-primary bg-primary/5"
                      : "border-primary/30 bg-card/60 hover:border-primary/50 hover:bg-primary/5"
                  }`}
                >
                  <div className="w-full h-32 bg-muted rounded mb-2 flex items-center justify-center">
                    {style.id === "robot" && (
                      <div className="w-16 h-16 bg-primary rounded"></div>
                    )}
                  </div>
                  <span className="text-sm font-medium">{style.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">影像手法</h3>
            <div className="grid grid-cols-5 gap-4">
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