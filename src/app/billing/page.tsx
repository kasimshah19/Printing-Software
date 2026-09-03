"use client";

import { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { Plus, Trash2, Printer as PrinterIcon } from "lucide-react";
import { AppHeader } from "@/components/common/app-header";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { t } from "@/lib/i18n";
import { useSettingsStore } from "@/store";
import { loadAllInvoices, saveInvoice, deleteInvoice } from "@/lib/storage";
import type { Invoice, InvoiceItem } from "@/lib/types";

export default function BillingPage() {
  const language = useSettingsStore((s) => s.settings.language);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [showNew, setShowNew] = useState(false);

  // New Invoice State
  const [customerName, setCustomerName] = useState("");
  const [items, setItems] = useState<InvoiceItem[]>([]);
  
  const refresh = async () => {
    setInvoices(await loadAllInvoices());
  };

  useEffect(() => {
    refresh();
  }, []);

  const handleAddItem = () => {
    setItems([...items, { id: uuidv4(), service: "", quantity: 1, rate: 0, amount: 0 }]);
  };

  const handleRemoveItem = (id: string) => {
    setItems(items.filter((i) => i.id !== id));
  };

  const updateItem = (id: string, updates: Partial<InvoiceItem>) => {
    setItems(
      items.map((i) => {
        if (i.id !== id) return i;
        const next = { ...i, ...updates };
        next.amount = next.quantity * next.rate;
        return next;
      })
    );
  };

  const calculateSubtotal = () => items.reduce((acc, item) => acc + item.amount, 0);

  const handleSaveInvoice = async () => {
    if (items.length === 0) return;
    const subtotal = calculateSubtotal();
    const invoiceNumber = `INV-${Date.now().toString().slice(-6)}`;
    
    const newInvoice: Invoice = {
      id: uuidv4(),
      invoiceNumber,
      customerName,
      items,
      subtotal,
      discount: 0,
      tax: 0,
      total: subtotal,
      paid: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await saveInvoice(newInvoice);
    setCustomerName("");
    setItems([]);
    setShowNew(false);
    refresh();
  };

  const markPaid = async (invoice: Invoice) => {
    await saveInvoice({ ...invoice, paid: true, updatedAt: new Date().toISOString() });
    refresh();
  };

  const removeInvoice = async (id: string) => {
    if (confirm("Delete this invoice?")) {
      await deleteInvoice(id);
      refresh();
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <AppHeader />
      <main className="mx-auto max-w-5xl px-4 py-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-2xl font-bold">{t("nav.billing", language)}</h1>
          <Button onClick={() => setShowNew(!showNew)}>
            {showNew ? "Cancel" : t("billing.newInvoice", language)}
          </Button>
        </div>

        {showNew && (
          <Card className="mb-8 border-blue-200 shadow-md">
            <CardHeader className="bg-blue-50/50 pb-4">
              <CardTitle>{t("billing.newInvoice", language)}</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="mb-6 max-w-sm">
                <Label>{t("billing.customer", language)}</Label>
                <Input
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Optional"
                />
              </div>

              <div className="mb-4">
                <div className="mb-2 flex items-center justify-between font-semibold">
                  <span>{t("billing.items", language)}</span>
                </div>
                {items.length === 0 && (
                  <p className="py-4 text-center text-sm text-slate-500">
                    No items added.
                  </p>
                )}
                <div className="space-y-3">
                  {items.map((item) => (
                    <div key={item.id} className="flex flex-wrap items-end gap-3 sm:flex-nowrap">
                      <div className="min-w-[150px] flex-1">
                        <Label className="mb-1 text-xs">{t("billing.service", language)}</Label>
                        <Input
                          value={item.service}
                          onChange={(e) => updateItem(item.id, { service: e.target.value })}
                          placeholder="e.g. Passport Photo 35 copies"
                        />
                      </div>
                      <div className="w-24">
                        <Label className="mb-1 text-xs">{t("billing.quantity", language)}</Label>
                        <Input
                          type="number"
                          min={1}
                          value={item.quantity}
                          onChange={(e) => updateItem(item.id, { quantity: Number(e.target.value) || 0 })}
                        />
                      </div>
                      <div className="w-24">
                        <Label className="mb-1 text-xs">{t("billing.rate", language)}</Label>
                        <Input
                          type="number"
                          min={0}
                          value={item.rate}
                          onChange={(e) => updateItem(item.id, { rate: Number(e.target.value) || 0 })}
                        />
                      </div>
                      <div className="w-24 pb-2 text-right font-medium text-slate-700">
                        ₹{item.amount.toFixed(2)}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-500 hover:bg-red-50 hover:text-red-600"
                        onClick={() => handleRemoveItem(item.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
                  <Button variant="outline" size="sm" onClick={handleAddItem} className="gap-2">
                    <Plus className="h-4 w-4" />
                    {t("billing.addItem", language)}
                  </Button>
                  <div className="text-right">
                    <p className="text-sm text-slate-600">{t("billing.subtotal", language)}</p>
                    <p className="text-2xl font-bold text-slate-900">
                      ₹{calculateSubtotal().toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="justify-end border-t border-slate-100 bg-slate-50/50 py-3">
              <Button disabled={items.length === 0} onClick={handleSaveInvoice}>
                {t("billing.save", language)}
              </Button>
            </CardFooter>
          </Card>
        )}

        {invoices.length === 0 && !showNew ? (
          <Card>
            <CardContent className="py-12 text-center text-slate-500">
              {t("billing.noInvoices", language)}
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {invoices.map((inv) => (
              <Card key={inv.id}>
                <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold">{inv.invoiceNumber}</h3>
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          inv.paid ? "bg-green-50 text-green-700" : "bg-orange-50 text-orange-700"
                        }`}
                      >
                        {inv.paid ? t("billing.paid", language) : t("billing.unpaid", language)}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-slate-600">
                      <span className="font-medium">{t("billing.customer", language)}:</span>{" "}
                      {inv.customerName || "N/A"}
                      <span className="mx-2">·</span>
                      {new Date(inv.createdAt).toLocaleString()}
                    </p>
                    <div className="mt-3 text-sm">
                      <p className="font-medium text-slate-700">{t("billing.items", language)} ({inv.items.length})</p>
                      <ul className="mt-1 space-y-1 text-slate-600">
                        {inv.items.map((it) => (
                          <li key={it.id}>
                            {it.quantity}x {it.service || "Item"} (₹{it.rate}) = ₹{it.amount}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-3">
                    <div className="text-right">
                      <p className="text-sm text-slate-600">{t("billing.total", language)}</p>
                      <p className="text-xl font-bold">₹{inv.total.toFixed(2)}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {!inv.paid && (
                        <Button size="sm" onClick={() => markPaid(inv)}>
                          {t("billing.markPaid", language)}
                        </Button>
                      )}
                      <Button size="sm" variant="outline" className="gap-2" onClick={() => window.print()}>
                        <PrinterIcon className="h-4 w-4" />
                        Print
                      </Button>
                      <Button size="sm" variant="ghost" className="text-red-500" onClick={() => removeInvoice(inv.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
