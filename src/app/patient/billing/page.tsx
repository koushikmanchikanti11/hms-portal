"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Receipt, Loader2, CheckCircle2, Clock, AlertCircle, CreditCard, Download } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface Invoice {
    id: string;
    invoiceNumber: string;
    totalAmount: string | number;
    paidAmount: string | number;
    subtotal: string | number;
    discount: string | number;
    status: "pending" | "partial" | "paid";
    dueDate: string | null;
    notes: string | null;
    createdAt: string;
    items: Array<{ description: string; qty: number; unitPrice: number; total: number }>;
    appointment?: {
        appointmentDate: string;
        doctor?: { name: string; specialization: string };
    } | null;
}

interface Totals {
    total: number;
    paid: number;
    pending: number;
}

const STATUS_CONFIG = {
    paid: { label: "Paid", icon: CheckCircle2, bg: "bg-green-100", text: "text-green-700", border: "border-green-200" },
    partial: { label: "Partial", icon: Clock, bg: "bg-amber-100", text: "text-amber-700", border: "border-amber-200" },
    pending: { label: "Pending", icon: AlertCircle, bg: "bg-red-100", text: "text-red-700", border: "border-red-200" },
};

function StatusBadge({ status }: { status: "paid" | "partial" | "pending" }) {
    const cfg = STATUS_CONFIG[status];
    const Icon = cfg.icon;
    return (
        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${cfg.bg} ${cfg.text}`}>
            <Icon className="h-3 w-3" />
            {cfg.label}
        </span>
    );
}

export default function PatientBillingPage() {
    const [data, setData] = useState<{ invoices: Invoice[]; totals: Totals; patientName?: string } | null>(null);
    const [loading, setLoading] = useState(true);
    const [expanded, setExpanded] = useState<string | null>(null);

    useEffect(() => {
        fetch("/api/patient/billing")
            .then(r => r.json())
            .then(d => { setData(d); setLoading(false); })
            .catch(() => setLoading(false));
    }, []);

    const downloadInvoice = (inv: Invoice, patientName: string = "Patient") => {
        const doc = new jsPDF();

        // Header
        doc.setFontSize(22);
        doc.setTextColor(249, 115, 22); // Orange-500
        doc.text("HMS Hospital", 14, 20);

        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text("123 Healthcare Ave, Medical City", 14, 28);
        doc.text("Phone: +1 234 567 8900", 14, 33);

        // INVOICE text
        doc.setFontSize(20);
        doc.setTextColor(0);
        doc.text("INVOICE", 150, 20);

        // Metadata
        doc.setFontSize(10);
        doc.text(`Invoice Number: #${inv.invoiceNumber}`, 130, 30);
        doc.text(`Date: ${new Date(inv.createdAt).toLocaleDateString()}`, 130, 36);
        if (inv.dueDate) {
            doc.text(`Due Date: ${new Date(inv.dueDate).toLocaleDateString()}`, 130, 42);
        }

        // Bill To
        doc.setFontSize(12);
        doc.setTextColor(0);
        doc.text("Bill To:", 14, 50);
        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text(patientName, 14, 56);
        if (inv.appointment?.doctor) {
            doc.text(`Consulting Doctor: Dr. ${inv.appointment.doctor.name} (${inv.appointment.doctor.specialization})`, 14, 62);
        }

        // Line Items
        const items = Array.isArray(inv.items) ? inv.items : [];
        const tableData = items.map(item => [
            item.description,
            item.qty.toString(),
            formatCurrency(item.unitPrice),
            formatCurrency(item.total)
        ]);

        autoTable(doc, {
            startY: 75,
            head: [['Description', 'Qty', 'Unit Price', 'Total']],
            body: tableData,
            theme: 'striped',
            headStyles: { fillColor: [249, 115, 22], textColor: 255 }, // Orange head
            styles: { fontSize: 10, cellPadding: 5 },
            columnStyles: {
                1: { halign: 'center' },
                2: { halign: 'right' },
                3: { halign: 'right' }
            }
        });

        // Totals
        const finalY = (doc as any).lastAutoTable.finalY + 10;
        doc.setFontSize(10);
        doc.setTextColor(0);

        doc.text("Subtotal:", 130, finalY);
        doc.text(formatCurrency(Number(inv.subtotal)), 170, finalY, { align: "right" });

        if (Number(inv.discount) > 0) {
            doc.setTextColor(22, 163, 74); // Green
            doc.text("Discount:", 130, finalY + 7);
            doc.text(`- ${formatCurrency(Number(inv.discount))}`, 170, finalY + 7, { align: "right" });
            doc.setTextColor(0);
        }

        const totalY = Number(inv.discount) > 0 ? finalY + 14 : finalY + 7;
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text("Total:", 130, totalY);
        doc.text(formatCurrency(Number(inv.totalAmount)), 170, totalY, { align: "right" });

        const paidY = totalY + 7;
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(22, 163, 74);
        doc.text("Amount Paid:", 130, paidY);
        doc.text(formatCurrency(Number(inv.paidAmount)), 170, paidY, { align: "right" });

        const balance = Number(inv.totalAmount) - Number(inv.paidAmount);
        if (balance > 0) {
            const balY = paidY + 7;
            doc.setFont("helvetica", "bold");
            doc.setTextColor(220, 38, 38); // Red
            doc.text("Balance Due:", 130, balY);
            doc.text(formatCurrency(balance), 170, balY, { align: "right" });
        }

        // Footer
        if (inv.notes) {
            doc.setFont("helvetica", "italic");
            doc.setTextColor(100);
            doc.setFontSize(9);
            doc.text(`Notes: ${inv.notes}`, 14, 280);
        }

        // Save PDF
        doc.save(`Invoice_${inv.invoiceNumber}.pdf`);
    };

    if (loading) {
        return (
            <>
                <PageHeader title="My Billing" />
                <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-orange-500" /></div>
            </>
        );
    }

    const invoices = data?.invoices ?? [];
    const totals = data?.totals ?? { total: 0, paid: 0, pending: 0 };
    const patientName = data?.patientName || "Patient";

    return (
        <>
            <PageHeader title="My Billing" />
            <div className="p-4 md:p-6 space-y-6">

                {/* Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
                        <div className="flex items-center justify-between">
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Total Billed</p>
                            <div className="h-10 w-10 rounded-lg bg-blue-50 flex items-center justify-center">
                                <Receipt className="h-5 w-5 text-blue-500" />
                            </div>
                        </div>
                        <p className="text-2xl font-bold text-gray-900 mt-3">{formatCurrency(totals.total)}</p>
                        <p className="text-xs text-gray-500 mt-1">{invoices.length} invoice{invoices.length !== 1 ? "s" : ""} total</p>
                    </div>

                    <div className="bg-white rounded-xl border border-green-100 p-5 shadow-sm">
                        <div className="flex items-center justify-between">
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Amount Paid</p>
                            <div className="h-10 w-10 rounded-lg bg-green-50 flex items-center justify-center">
                                <CheckCircle2 className="h-5 w-5 text-green-500" />
                            </div>
                        </div>
                        <p className="text-2xl font-bold text-gray-900 mt-3">{formatCurrency(totals.paid)}</p>
                        <p className="text-xs text-gray-500 mt-1">{invoices.filter(i => i.status === "paid").length} paid invoice{invoices.filter(i => i.status === "paid").length !== 1 ? "s" : ""}</p>
                    </div>

                    <div className="bg-white rounded-xl border border-red-100 p-5 shadow-sm">
                        <div className="flex items-center justify-between">
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Outstanding</p>
                            <div className="h-10 w-10 rounded-lg bg-red-50 flex items-center justify-center">
                                <AlertCircle className="h-5 w-5 text-red-500" />
                            </div>
                        </div>
                        <p className="text-2xl font-bold text-gray-900 mt-3">{formatCurrency(totals.pending)}</p>
                        <p className="text-xs text-gray-500 mt-1">{invoices.filter(i => i.status !== "paid").length} pending invoice{invoices.filter(i => i.status !== "paid").length !== 1 ? "s" : ""}</p>
                    </div>
                </div>

                {/* Invoice List */}
                <div className="bg-white rounded-xl border overflow-hidden">
                    <div className="px-6 py-4 border-b">
                        <h3 className="text-base font-semibold text-gray-900">Invoice History</h3>
                    </div>

                    {invoices.length === 0 ? (
                        <div className="p-10 text-center">
                            <CreditCard className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                            <p className="text-sm font-medium text-gray-500">No billing records</p>
                            <p className="text-xs text-gray-400 mt-1">Your invoices will appear here once generated by the hospital.</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-100">
                            {invoices.map(inv => {
                                const totalAmt = Number(inv.totalAmount);
                                const paidAmt = Number(inv.paidAmount);
                                const balance = totalAmt - paidAmt;
                                const isExpanded = expanded === inv.id;
                                const items: Invoice["items"] = Array.isArray(inv.items) ? inv.items : [];

                                return (
                                    <div key={inv.id}>
                                        {/* Invoice Row */}
                                        <button
                                            onClick={() => setExpanded(isExpanded ? null : inv.id)}
                                            className="w-full text-left px-6 py-4 hover:bg-gray-50 transition-colors"
                                        >
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <span className="text-sm font-semibold text-gray-900">
                                                            #{inv.invoiceNumber}
                                                        </span>
                                                        <StatusBadge status={inv.status} />
                                                    </div>
                                                    <p className="text-xs text-gray-500 mt-1">
                                                        {inv.appointment?.doctor
                                                            ? `Dr. ${inv.appointment.doctor.name} · ${inv.appointment.doctor.specialization}`
                                                            : "General"}
                                                        {" · "}
                                                        {new Date(inv.createdAt).toLocaleDateString("en-IN", {
                                                            day: "numeric", month: "short", year: "numeric"
                                                        })}
                                                    </p>
                                                    {inv.dueDate && inv.status !== "paid" && (
                                                        <p className="text-xs text-red-500 mt-0.5">
                                                            Due: {new Date(inv.dueDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                                                        </p>
                                                    )}
                                                </div>
                                                <div className="text-right shrink-0">
                                                    <p className="text-sm font-bold text-gray-900">{formatCurrency(totalAmt)}</p>
                                                    {inv.status !== "paid" && (
                                                        <p className="text-xs text-red-500 mt-0.5">Balance: {formatCurrency(balance)}</p>
                                                    )}
                                                    {inv.status === "paid" && (
                                                        <p className="text-xs text-green-600 mt-0.5">Fully paid</p>
                                                    )}
                                                </div>
                                            </div>
                                            {/* Progress bar for partial */}
                                            {inv.status === "partial" && totalAmt > 0 && (
                                                <div className="mt-3">
                                                    <div className="flex justify-between text-xs text-gray-400 mb-1">
                                                        <span>Paid {formatCurrency(paidAmt)}</span>
                                                        <span>Remaining {formatCurrency(balance)}</span>
                                                    </div>
                                                    <div className="w-full bg-gray-100 rounded-full h-1.5">
                                                        <div
                                                            className="h-1.5 rounded-full bg-amber-400"
                                                            style={{ width: `${Math.min((paidAmt / totalAmt) * 100, 100)}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            )}
                                        </button>

                                        {/* Expanded: Line items */}
                                        {isExpanded && (
                                            <div className="px-6 pb-4 bg-gray-50 border-t border-gray-100">
                                                <div className="flex items-center justify-between mt-4 mb-3">
                                                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Invoice Breakdown</h4>
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); downloadInvoice(inv, patientName); }}
                                                        className="flex items-center gap-1.5 text-xs font-medium text-orange-600 bg-orange-50 hover:bg-orange-100 px-3 py-1.5 rounded-lg transition-colors border border-orange-200"
                                                    >
                                                        <Download className="h-3.5 w-3.5" />
                                                        Download PDF
                                                    </button>
                                                </div>

                                                {items.length > 0 ? (
                                                    <div className="bg-white rounded-lg border overflow-hidden">
                                                        <table className="w-full text-xs">
                                                            <thead>
                                                                <tr className="bg-gray-50 text-gray-500">
                                                                    <th className="px-4 py-2 text-left font-medium">Description</th>
                                                                    <th className="px-4 py-2 text-right font-medium">Qty</th>
                                                                    <th className="px-4 py-2 text-right font-medium">Unit Price</th>
                                                                    <th className="px-4 py-2 text-right font-medium">Total</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody className="divide-y divide-gray-100">
                                                                {items.map((item, idx) => (
                                                                    <tr key={idx}>
                                                                        <td className="px-4 py-2 text-gray-700">{item.description}</td>
                                                                        <td className="px-4 py-2 text-right text-gray-600">{item.qty}</td>
                                                                        <td className="px-4 py-2 text-right text-gray-600">{formatCurrency(item.unitPrice)}</td>
                                                                        <td className="px-4 py-2 text-right font-medium text-gray-900">{formatCurrency(item.total)}</td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                ) : (
                                                    <p className="text-xs text-gray-400">No line items on this invoice.</p>
                                                )}

                                                {/* Totals Summary */}
                                                <div className="mt-3 bg-white rounded-lg border p-3 space-y-1.5">
                                                    <div className="flex justify-between text-xs text-gray-600">
                                                        <span>Subtotal</span>
                                                        <span>{formatCurrency(Number(inv.subtotal))}</span>
                                                    </div>
                                                    {Number(inv.discount) > 0 && (
                                                        <div className="flex justify-between text-xs text-green-600">
                                                            <span>Discount</span>
                                                            <span>- {formatCurrency(Number(inv.discount))}</span>
                                                        </div>
                                                    )}
                                                    <div className="flex justify-between text-sm font-semibold text-gray-900 pt-1 border-t">
                                                        <span>Total</span>
                                                        <span>{formatCurrency(totalAmt)}</span>
                                                    </div>
                                                    <div className="flex justify-between text-xs text-green-600">
                                                        <span>Amount Paid</span>
                                                        <span>{formatCurrency(paidAmt)}</span>
                                                    </div>
                                                    {balance > 0 && (
                                                        <div className="flex justify-between text-xs font-semibold text-red-600">
                                                            <span>Balance Due</span>
                                                            <span>{formatCurrency(balance)}</span>
                                                        </div>
                                                    )}
                                                </div>

                                                {inv.notes && (
                                                    <p className="text-xs text-gray-500 mt-2 italic">{inv.notes}</p>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Info note */}
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
                    <Receipt className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
                    <p className="text-xs text-blue-700">
                        For payment or billing queries, please contact the hospital&apos;s billing department. This page is for viewing and downloading purposes only.
                    </p>
                </div>
            </div>
        </>
    );
}
