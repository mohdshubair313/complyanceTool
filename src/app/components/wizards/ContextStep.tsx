'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const schema = z.object({
  country: z.string().min(1, 'Country required'),
  erp: z.string().min(1, 'ERP required'),
});

type FormData = z.infer<typeof schema>;

interface Props {
  onNext: (data: FormData) => void;
}

export function ContextStep({ onNext }: Props) {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  return (
    <form onSubmit={handleSubmit(onNext)} className="space-y-4">
      <div>
        <Label htmlFor="country">Country</Label>
        <Input id="country" {...register('country')} />
        {errors.country && <p className="text-red-500">{errors.country.message}</p>}
      </div>
      <div>
        <Label htmlFor="erp">ERP System</Label>
        <Input id="erp" {...register('erp')} />
        {errors.erp && <p className="text-red-500">{errors.erp.message}</p>}
      </div>
      <Button type="submit">Next</Button>
    </form>
  );
}
