import React, { useEffect, useState } from 'react';
import paymentService from '@/services/payment.service';
import type { Payment } from '@/types/payment';

type Props = {
  bookingId: string;
  payments?: Payment[];
  loading?: boolean;
};

export default function PaymentHistory({ bookingId, payments: paymentsProp, loading: loadingProp = false }: Props) {
  const [payments, setPayments] = useState<Payment[]>(paymentsProp ?? []);
  const [loading, setLoading] = useState(Boolean(paymentsProp ? loadingProp : false));

  useEffect(() => {
    if (paymentsProp) {
      setPayments(paymentsProp);
      setLoading(Boolean(loadingProp));
      return;
    }

    let mounted = true;
    setLoading(true);
    paymentService
      .getPaymentsForBooking(bookingId)
      .then((list) => {
        if (mounted) setPayments(list);
      })
      .catch(() => {})
      .finally(() => setLoading(false));

    return () => {
      mounted = false;
    };
  }, [bookingId, loadingProp, paymentsProp]);

  if (loading) return <div className="text-sm text-slate-500">Loading payments…</div>;
  if (!payments.length) return <div className="text-sm text-slate-500">No payments found.</div>;

  return (
    <div className="space-y-2">
      {payments.map((p) => (
        <div key={p.id} className="p-3 border rounded">
          <div className="flex justify-between">
            <div className="text-sm font-medium">{p.provider ?? 'Local'}</div>
            <div className="text-sm text-slate-600">{p.status}</div>
          </div>
          <div className="text-sm text-slate-500">{(p.amountCents / 100).toFixed(2)} {p.currency}</div>
          <div className="text-xs text-slate-400">{new Date(p.createdAt).toLocaleString()}</div>
        </div>
      ))}
    </div>
  );
}
