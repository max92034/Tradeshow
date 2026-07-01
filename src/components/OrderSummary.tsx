import { useState } from 'react';
import { Save, FileSpreadsheet, Mail, Send, Check, AlertTriangle } from 'lucide-react';
import { useOrderStore } from '../store/useOrderStore';
import { useToast } from './Toast';
import { formatPrice } from '../utils/formatters';
import { cn } from '../lib/utils';
import * as XLSX from 'xlsx';
import { getCountryByCode } from '../data/countries';

function validateBuyer(buyer: ReturnType<typeof useOrderStore.getState>['currentOrder']['buyer']): string[] {
  const errors: string[] = [];
  if (!buyer?.name?.trim()) errors.push('Buyer Name');
  if (!buyer?.company?.trim()) errors.push('Company');
  if (!buyer?.email?.trim()) errors.push('Email');
  if (!buyer?.nationality) errors.push('Nationality');
  return errors;
}

export function OrderSummary() {
  const order = useOrderStore(state => state.currentOrder);
  const saveOrder = useOrderStore(state => state.saveOrder);
  const [saved, setSaved] = useState(false);
  const { addToast } = useToast();

  const canProceed = () => {
    const errors = validateBuyer(order.buyer);
    
    if (order.items.length === 0) {
      addToast('Please add at least one item to the quotation', 'warning');
      return false;
    }
    
    if (errors.length > 0) {
      addToast(`Please fill in: ${errors.join(', ')}`, 'error');
      return false;
    }
    
    return true;
  };

  const handleSave = () => {
    if (!canProceed()) return;
    saveOrder();
    setSaved(true);
    addToast('Quotation saved successfully!', 'success');
    setTimeout(() => setSaved(false), 2000);
  };

  const handleExportExcel = () => {
    if (!canProceed()) return;
    
    const country = getCountryByCode(order.buyer?.nationality || '');
    
    const buyerInfo = [
      ['Quotation'],
      [],
      ['Buyer Information'],
      ['Name', order.buyer?.name || ''],
      ['Company', order.buyer?.company || ''],
      ['Email', order.buyer?.email || ''],
      ['Phone', order.buyer?.phone || ''],
      ['Nationality', country ? `${country.flag} ${country.name}` : ''],
      [],
    ];

    const headers = ['SKU', 'Collection', 'Description', 'Category', 'Subcategory', 'Unit Price', 'Qty', 'Weight (kg)', 'Carton L', 'Carton W', 'Carton H', 'Inner Qty', 'Carton Qty'];
    const rows = order.items.map(item => [
      item.sku,
      item.collection || '',
      item.description,
      item.category || '',
      item.subcategory || '',
      item.unitPrice,
      item.quantity,
      item.weight || '',
      item.cartonL || '',
      item.cartonW || '',
      item.cartonH || '',
      item.innerQty || '',
      item.cartonQty,
    ]);

    const totals = [
      [],
      ['Subtotal', '', '', '', '', order.subtotal],
      ['Total Items', '', '', '', '', '', order.totalItems],
      ['Total Cartons (est.)', '', '', '', '', '', '', '', '', '', '', '', order.totalCartons],
    ];

    const notesSection = order.buyer?.notes ? [
      [],
      ['Notes'],
      [order.buyer.notes],
    ] : [];

    const data = [...buyerInfo, headers, ...rows, ...totals, ...notesSection];
    const ws = XLSX.utils.aoa_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Quotation');
    XLSX.writeFile(wb, `quotation-${order.id}.xlsx`);
    addToast('Quotation exported!', 'success');
  };

  const handleEmail = () => {
    if (!canProceed()) return;
    
    const buyer = order.buyer;
    const country = getCountryByCode(buyer?.nationality || '');
    const subject = encodeURIComponent(`Quotation - ${buyer?.company || buyer?.name || order.id}`);
    
    let body = `Quotation Summary\n${'='.repeat(40)}\n\n`;
    if (buyer) {
      body += `Buyer: ${buyer.name || ''}\n`;
      if (buyer.company) body += `Company: ${buyer.company}\n`;
      if (country) body += `Nationality: ${country.flag} ${country.name}\n`;
      if (buyer.phone) body += `Phone: ${buyer.phone}\n`;
      body += `\n`;
    }
    
    body += `Items: ${order.totalItems}\n`;
    body += `Cartons (est.): ${order.totalCartons}\n`;
    body += `Subtotal: ${formatPrice(order.subtotal)}\n\n`;
    body += `Items:\n${'-'.repeat(40)}\n`;
    
    order.items.forEach(item => {
      body += `${item.sku} - ${item.description}\n`;
      body += `  ${formatPrice(item.unitPrice)} / unit\n`;
    });
    
    if (buyer?.notes) {
      body += `\nNotes:\n${'-'.repeat(40)}\n${buyer.notes}\n`;
    }
    
    const mailto = `mailto:${buyer?.email || ''}?subject=${subject}&body=${encodeURIComponent(body)}`;
    window.location.href = mailto;
  };

  const missingFields = validateBuyer(order.buyer);

  return (
    <div className="bg-white border-t border-slate-200 p-4 space-y-3">
      {missingFields.length > 0 && (
        <div className="flex items-start gap-2 p-2.5 bg-amber-50 border border-amber-200 rounded-lg">
          <AlertTriangle size={16} className="text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-amber-800">
            <span className="font-semibold">Missing required fields:</span>
            <span className="ml-1">{missingFields.join(', ')}</span>
          </div>
        </div>
      )}
      
      <div className="space-y-1.5 text-sm">
        <div className="flex justify-between text-slate-600">
          <span>Items</span>
          <span className="font-medium">{order.totalItems} pcs</span>
        </div>
        <div className="flex justify-between text-slate-600">
          <span>Cartons (est.)</span>
          <span className="font-medium">{order.totalCartons} ctns</span>
        </div>
        <div className="flex justify-between text-lg font-bold text-slate-900 pt-2 border-t border-slate-200">
          <span>Subtotal</span>
          <span className="text-emerald-600">{formatPrice(order.subtotal)}</span>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={handleSave}
          className={cn(
            "flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-lg font-semibold text-sm transition-all",
            saved
              ? "bg-emerald-500 text-white"
              : "bg-slate-800 hover:bg-slate-900 text-white active:scale-95"
          )}
        >
          {saved ? <Check size={18} /> : <Save size={16} />}
          {saved ? 'Saved!' : 'Save Quote'}
        </button>
        <button
          onClick={handleExportExcel}
          className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-lg font-semibold text-sm bg-cyan-600 hover:bg-cyan-700 text-white transition-all active:scale-95"
        >
          <FileSpreadsheet size={16} />
          Export
        </button>
      </div>
      
      <button
        onClick={handleEmail}
        className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg font-semibold text-sm bg-emerald-600 hover:bg-emerald-700 text-white transition-all active:scale-95"
      >
        <Send size={16} />
        Send via Email
      </button>
    </div>
  );
}
