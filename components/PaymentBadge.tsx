import React, { useState } from 'react';
import { Button } from '@/app/components/ui/Button';
import PaymentModal from './PaymentModal';
import type { Payment } from '@/types/payment';

type Props = {
  bookingId: string;
  payment?: Payment | null;
  required?: boolean;
};

export default function PaymentBadge({ bookingId, payment, required = false }: Props) {
  const [open, setOpen] = useState(false);

  const label = payment ? payment.status : required ? 'Payment required' : 'No payment';

  return (
    <div className="flex items-center gap-3">
      <div className="text-sm text-slate-700">{label}</div>
      <Button variant="primary" onClick={() => setOpen(true)} className="text-sm">
        {payment ? 'View / Retry' : 'Pay'}
      </Button>

      {open && (
        <PaymentModal bookingId={bookingId} payment={payment ?? undefined} onClose={() => setOpen(false)} />
      )}
    </div>
  );
}
