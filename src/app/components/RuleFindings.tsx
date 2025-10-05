import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';

interface Finding {
  rule: string;
  ok: boolean;
  exampleLine?: number;
  expected?: number;
  got?: number;
  value?: string;
}

interface Props {
  findings: Finding[];
}

export function RuleFindings({ findings }: Props) {
  return (
    <Accordion type="single" collapsible className="w-full">
      <h3 className="mb-2 font-semibold">Rule Findings</h3>
      {findings.map((finding, idx) => (
        <AccordionItem key={idx} value={`item-${idx}`}>
          <AccordionTrigger>
            <Badge variant={finding.ok ? 'default' : 'destructive'} className="mr-2">
              {finding.ok ? 'Pass' : 'Fail'}
            </Badge>
            {finding.rule}
          </AccordionTrigger>
          {!finding.ok && (
            <AccordionContent>
              {finding.rule === 'LINE_MATH' && `Line ${finding.exampleLine}: Expected ${finding.expected}, Got ${finding.got}`}
              {finding.rule === 'CURRENCY_ALLOWED' && `Bad value: ${finding.value}`}
              {/* Other rules similar */}
            </AccordionContent>
          )}
        </AccordionItem>
      ))}
    </Accordion>
  );
}
