import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";

interface CompanyInfoStepProps {
  value: string;
  onChange: (value: string) => void;
  onNext: () => void;
}

const CompanyInfoStep = ({ value, onChange, onNext }: CompanyInfoStepProps) => {
  return (
    <Card className="max-w-4xl mx-auto bg-accent/10 border-primary/20" style={{ boxShadow: 'var(--card-shadow)' }}>
      <CardContent className="p-8">
        <h2 className="text-xl font-semibold text-primary mb-6 text-center">
          Q1. 請說明您的公司或品牌，以及主要產品或服務？
        </h2>
        
        <div className="space-y-4">
          <Textarea
            placeholder="例：我們是專做天然保健食品的品牌"
            value={Brandvalue}
            onChange={(e) => onChange(e.target.value)}
            className="min-h-[300px] text-base resize-none border border-dashed border-primary/30 focus:border-dashed focus:border-primary/30 bg-card/80"
          />
          <Textarea
            placeholder="例：販售益生菌產品。"
            value={Topicvalue}
            onChange={(e) => onChange(e.target.value)}
            className="min-h-[300px] text-base resize-none border border-dashed border-primary/30 focus:border-dashed focus:border-primary/30 bg-card/80"
          />
          <div className="flex justify-end">
            <Button 
              onClick={onNext}
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 text-base font-medium"
              disabled={!value.trim()}
            >
              下一題 →
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export { CompanyInfoStep };
