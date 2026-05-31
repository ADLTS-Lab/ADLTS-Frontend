import React, { useState } from 'react';
import { Button } from '@/app/components/ui/Button';
import paymentService from '@/services/payment.service';
import type { Payment } from '@/types/payment';

type Props = {
  bookingId: string;
  payment?: Payment;
  onClose: () => void;
};

export default function PaymentModal({ bookingId, payment, onClose }: Props) {
  const [amount, setAmount] = useState((payment ? payment.amountCents : 50000) / 100);
  const [submitting, setSubmitting] = useState(false);

  async function handleInitiate() {
    setSubmitting(true);
    try {
      const initiated = await paymentService.createPayment(bookingId, { amountCents: Math.round(amount * 100) });
      if (initiated.checkout_url && typeof window !== 'undefined') {
        window.location.href = initiated.checkout_url;
        return;
      }

      alert(`Payment initiated: ${initiated.id} (status: ${initiated.status})`);
      onClose();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to initiate payment');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold mb-4">Payment for booking</h3>
        <div className="mb-4">
          <label className="block text-sm text-slate-600 mb-1">Amount (ETB)</label>
          <input
            type="number"
            min={0}
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            className="w-full border rounded px-3 py-2"
          />
        </div>

        <div className="flex gap-3 justify-end">
          <Button variant="secondary" onClick={onClose} disabled={submitting}>Close</Button>
          <Button variant="primary" onClick={handleInitiate} disabled={submitting}>{submitting ? 'Processing...' : payment ? 'Retry Payment' : 'Pay now'}</Button>
        </div>
      </div>
    </div>
  );
}
