import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';

interface Props {
  data: any[];
}

function inferType(value: any): 'number' | 'date' | 'text' {
  if (typeof value === 'number') return 'number';
  if (value instanceof Date || !isNaN(Date.parse(value))) return 'date';
  return 'text';
}

export function TablePreview({ data }: Props) {
  if (!data.length) return <div className="text-muted-foreground">No data to preview</div>;

  const headers = Object.keys(data[0]);
  const rows = data;

  return (
    <Card>
      <h3 className="p-4 border-b">Table Preview (First 20 Rows)</h3>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              {headers.map((header) => (
                <TableHead className="px-4 py-2" key={header}>{header}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row, idx) => (
              <TableRow key={idx}>
                {headers.map((header) => {
                  const value = row[header];
                  const type = inferType(value);
                  return (
                    <TableCell key={header} className="align-top">
                      {Array.isArray(value) && value.length > 0 ? (
                        // Fix: Render nested array (lines) as small sub-table
                        <div className="border border-gray-300 rounded-sm p-2 bg-gray-50">
                          <small className="font-semibold text-xs mb-1 block">Lines ({value.length} items):</small>
                          <table className="w-full text-xs border-collapse">
                            <thead className="bg-muted">
                              <tr>
                                {Object.keys(value[0] || {}).map((subKey) => (
                                  <th key={subKey} className="border border-gray-200 px-1 py-0.5 text-left font-medium">
                                    {subKey}
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {value.map((item: any, itemIdx: number) => (
                                <tr key={itemIdx} className={itemIdx % 2 === 0 ? 'bg-background' : 'bg-muted'}>
                                  {Object.values(item).map((cellValue: any, cellIdx: number) => (
                                    <td key={cellIdx} className="border border-gray-200 px-1 py-0.5">
                                      {typeof cellValue === 'object' ? JSON.stringify(cellValue) : cellValue ?? 'Empty'}
                                    </td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : value && typeof value === 'object' ? (
                        // Fix: Other objects (non-array) as JSON string
                        <span className="text-xs">{JSON.stringify(value)}</span>
                      ) : (
                        // Normal: Primitives
                        <span>{value ?? 'Empty'}</span>
                      )}
                      <Badge 
                        variant={type === 'number' ? 'default' : type === 'date' ? 'secondary' : 'secondary'} 
                        className="ml-2 text-xs"
                      >
                        {type.toUpperCase()}
                      </Badge>
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <div className="p-4 text-sm text-muted-foreground">States: Empty cells shown. Loading/Error handled in parent. Nested arrays (e.g., lines) rendered as sub-tables.</div>
    </Card>
  );
}
