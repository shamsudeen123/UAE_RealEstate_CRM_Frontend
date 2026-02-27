import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../api/axios';
import { formatAED, formatDate } from '../../utils/helpers';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Badge from '../../components/common/Badge';

export default function InvoiceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/invoices/${id}`)
      .then(({ data }) => setInvoice(data.invoice))
      .catch(() => navigate('/invoices'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <LoadingSpinner fullScreen />;
  if (!invoice) return null;

  const balance = invoice.grandTotal - invoice.paidAmount;

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <button onClick={() => navigate('/invoices')} className="text-sm text-brand-gold hover:underline">← Back to Invoices</button>
        <button onClick={() => window.print()} className="btn btn-secondary btn-sm">🖨️ Print</button>
      </div>

      <div className="card p-8 print:shadow-none" id="invoice-print">
        {/* Invoice header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-10 h-10 bg-brand-gold rounded-lg flex items-center justify-center text-white text-xl">🏠</div>
              <div>
                <p className="font-bold text-gray-900 dark:text-slate-100">UAE Real Estate CRM</p>
                <p className="text-xs text-gray-400 dark:text-slate-500">Professional Real Estate Services</p>
              </div>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-brand-gold">{invoice.invoiceNo}</p>
            <p className="text-sm text-gray-500 dark:text-slate-400">{formatDate(invoice.createdAt)}</p>
            <Badge status={invoice.invoiceStatus} className="mt-1" />
          </div>
        </div>

        {/* Billed to */}
        <div className="mb-8">
          <p className="text-xs text-gray-400 dark:text-slate-500 uppercase tracking-wide mb-1">Billed To</p>
          <p className="font-semibold text-gray-800 dark:text-slate-200">{invoice.client?.name}</p>
          {invoice.client?.phone && <p className="text-sm text-gray-500 dark:text-slate-400">{invoice.client.phone}</p>}
          {invoice.client?.email && <p className="text-sm text-gray-500 dark:text-slate-400">{invoice.client.email}</p>}
        </div>

        {/* Items table */}
        <div className="mb-6">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-brand-gold">
                <th className="text-left py-2 text-gray-600 dark:text-slate-400 font-semibold">Description</th>
                <th className="text-center py-2 text-gray-600 dark:text-slate-400 font-semibold">Qty</th>
                <th className="text-right py-2 text-gray-600 dark:text-slate-400 font-semibold">Unit Price</th>
                <th className="text-right py-2 text-gray-600 dark:text-slate-400 font-semibold">Total</th>
              </tr>
            </thead>
            <tbody>
              {invoice.items?.map((item, idx) => (
                <tr key={idx} className="border-b border-gray-100 dark:border-slate-700">
                  <td className="py-3 text-gray-800 dark:text-slate-200">{item.description}</td>
                  <td className="py-3 text-center text-gray-600 dark:text-slate-400">{item.quantity}</td>
                  <td className="py-3 text-right text-gray-700 dark:text-slate-300">{formatAED(item.unitPrice)}</td>
                  <td className="py-3 text-right font-medium text-gray-800 dark:text-slate-200">{formatAED(item.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="flex justify-end">
          <div className="w-64 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500 dark:text-slate-400">Subtotal</span>
              <span className="text-gray-700 dark:text-slate-300">{formatAED(invoice.subtotal)}</span>
            </div>
            {invoice.tax > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-slate-400">VAT / Tax</span>
                <span className="text-gray-700 dark:text-slate-300">{formatAED(invoice.tax)}</span>
              </div>
            )}
            {invoice.discount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-slate-400">Discount</span>
                <span className="text-green-600">−{formatAED(invoice.discount)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold border-t border-gray-200 dark:border-slate-700 pt-2">
              <span className="text-gray-800 dark:text-slate-200">Grand Total</span>
              <span className="text-brand-gold text-lg">{formatAED(invoice.grandTotal)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500 dark:text-slate-400">Amount Paid</span>
              <span className="text-green-600">{formatAED(invoice.paidAmount)}</span>
            </div>
            {balance > 0 && (
              <div className="flex justify-between font-semibold text-red-600">
                <span>Balance Due</span>
                <span>{formatAED(balance)}</span>
              </div>
            )}
          </div>
        </div>

        {invoice.notes && (
          <div className="mt-6 pt-4 border-t border-gray-100 dark:border-slate-700">
            <p className="text-xs text-gray-400 dark:text-slate-500 uppercase tracking-wide mb-1">Notes</p>
            <p className="text-sm text-gray-600 dark:text-slate-400">{invoice.notes}</p>
          </div>
        )}
      </div>
    </div>
  );
}
