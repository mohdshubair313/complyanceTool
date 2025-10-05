import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Scores {
  data: number;
  coverage: number;
  rules: number;
  posture: number;
  overall: number;
}

interface Props {
  scores: Scores;
}

const labels = ['Low (0-40)', 'Medium (41-70)', 'High (71-100)'];
const getLabel = (score: number) => {
  if (score <= 40) return labels[0];
  if (score <= 70) return labels[1];
  return labels[2];
};

export function ScoreBars({ scores }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Scores</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {Object.entries(scores).map(([key, value]) => (
          <div key={key} className="space-y-1">
            <div className="flex justify-between text-sm">
              <span>{key.charAt(0).toUpperCase() + key.slice(1)}</span>
              <span>{value}/100 {key === 'overall' && `(${getLabel(value)})`}</span>
            </div>
            <Progress value={value} />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
