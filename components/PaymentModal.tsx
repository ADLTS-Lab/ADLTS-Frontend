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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--overlay)]">
      <div className="w-full max-w-md rounded-[8px] bg-[var(--surface)] p-6 shadow-[var(--shadow-modal)]">
        <h3 className="mb-4 text-lg font-semibold text-[var(--text-primary)]">Payment for booking</h3>
        <div className="mb-4">
          <label className="mb-1 block text-sm text-[var(--text-secondary)]">Amount (ETB)</label>
          <input
            type="number"
            min={0}
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            className="h-9 w-full rounded-[6px] border border-[var(--border)] bg-[var(--surface)] px-3 text-[var(--text-primary)] outline-none focus:border-[var(--accent)] focus:ring-[3px] focus:ring-[var(--focus-ring)]"
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
