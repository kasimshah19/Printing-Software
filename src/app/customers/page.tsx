"use client";

import { useEffect, useState, useCallback } from "react";
import { AppHeader } from "@/components/common/app-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { t } from "@/lib/i18n";
import { useSettingsStore } from "@/store";
import {
  saveCustomer,
  loadAllCustomers,
  deleteCustomer,
  searchCustomers,
} from "@/lib/storage";
import type { Customer } from "@/lib/types";
import { v4 as uuidv4 } from "uuid";
import { UserPlus, Search, Trash2, Phone, Mail, IndianRupee } from "lucide-react";

export default function CustomersPage() {
  const language = useSettingsStore((s) => s.settings.language);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");

  const reload = useCallback(async () => {
    if (search.trim()) {
      setCustomers(await searchCustomers(search));
    } else {
      setCustomers(await loadAllCustomers());
    }
  }, [search]);

  useEffect(() => {
    reload();
  }, [reload]);

  const handleAdd = async () => {
    if (!name.trim()) return;
    const now = new Date().toISOString();
    const customer: Customer = {
      id: uuidv4(),
      name: name.trim(),
      mobile: mobile.trim(),
      email: email.trim() || undefined,
      jobIds: [],
      totalSpent: 0,
      visitCount: 0,
      createdAt: now,
      lastVisit: now,
    };
    await saveCustomer(customer);
    setName("");
    setMobile("");
    setEmail("");
    setShowForm(false);
    reload();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this customer?")) return;
    await deleteCustomer(id);
    reload();
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <AppHeader />
      <main className="mx-auto max-w-5xl px-4 py-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-3xl font-bold text-slate-900">Customers</h1>
          <Button onClick={() => setShowForm((s) => !s)} className="gap-2">
            <UserPlus className="h-4 w-4" />
            Add Customer
          </Button>
        </div>

        {showForm && (
          <Card className="mb-6">
            <CardHeader><CardTitle>New Customer</CardTitle></CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-3">
                <Input placeholder="Name *" value={name} onChange={(e) => setName(e.target.value)} />
                <Input placeholder="Mobile" value={mobile} onChange={(e) => setMobile(e.target.value)} />
                <Input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div className="mt-4 flex gap-2">
                <Button onClick={handleAdd} disabled={!name.trim()}>Save Customer</Button>
                <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              className="pl-10"
              placeholder="Search by name, mobile, or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {customers.length === 0 ? (
          <Card>
            <CardContent className="py-10 text-center text-slate-500">
              No customers found. Add your first customer to get started.
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-3">
            {customers.map((c) => (
              <Card key={c.id}>
                <CardContent className="flex items-center justify-between p-4">
                  <div className="space-y-1">
                    <p className="font-semibold text-slate-900">{c.name}</p>
                    <div className="flex flex-wrap gap-4 text-sm text-slate-500">
                      {c.mobile && (
                        <span className="flex items-center gap-1">
                          <Phone className="h-3.5 w-3.5" /> {c.mobile}
                        </span>
                      )}
                      {c.email && (
                        <span className="flex items-center gap-1">
                          <Mail className="h-3.5 w-3.5" /> {c.email}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <IndianRupee className="h-3.5 w-3.5" /> ₹{c.totalSpent.toFixed(0)} spent
                      </span>
                      <span>{c.visitCount} visits</span>
                    </div>
                  </div>
                  <Button variant="outline" size="icon" onClick={() => handleDelete(c.id)}>
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
