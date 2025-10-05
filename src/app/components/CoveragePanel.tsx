import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Coverage {
  matched: string[];
  close: { target: string; candidate: string; confidence: number | null }[];
  missing: string[];
}

interface Props {
  coverage: Coverage;
}

export function CoveragePanel({ coverage }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle> Coverage vs GETS Schema</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h4 className="font-semibold">Matched ({coverage.matched.length}/25)</h4>
          <div className="flex flex-wrap gap-1">
            {coverage.matched.map((field) => (
              <Badge key={field} variant="default">{field}</Badge>
            ))}
          </div>
        </div>
        <div>
          <h4 className="font-semibold">Close Matches</h4>
          <div className="space-y-1">
            {coverage.close.map((item) => (
              <div key={item.target} className="text-sm">
                {item.target} → {item.candidate} (Confidence: {item.confidence?.toFixed(2) ?? "N/A"})
              </div>
            ))}
          </div>
        </div>
        <div>
          <h4 className="font-semibold text-red-600">Missing</h4>
          <div className="flex flex-wrap gap-1">
            {coverage.missing.map((field) => (
              <Badge key={field} variant="destructive">{field}</Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
