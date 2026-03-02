"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Loader2, Download, FileText } from "lucide-react";
import { formatDate, formatCurrency } from "@/lib/utils";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export default function InvoiceDetailPage() {
    const { id } = useParams();
    const [invoice, setInvoice] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [paymentAmount, setPaymentAmount] = useState("");
    const [paying, setPaying] = useState(false);
    const [generatingPdf, setGeneratingPdf] = useState(false);
    const [pdfUrl, setPdfUrl] = useState<string | null>(null);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);

    const fetchInvoice = async () => { const r = await fetch(`/api/billing/${id}`); if (r.ok) { const d = await r.json(); setInvoice(d); } setLoading(false); };
    useEffect(() => { fetchInvoice(); }, [id]);

    // Clean up blob url
    useEffect(() => { return () => { if (pdfUrl) URL.revokeObjectURL(pdfUrl); }; }, [pdfUrl]);

    const handlePayment = async (full: boolean) => { setPaying(true); const amount = full ? Number(invoice.totalAmount) : Number(invoice.paidAmount) + Number(paymentAmount); await fetch(`/api/billing/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ paidAmount: amount }) }); setPaying(false); setPaymentAmount(""); fetchInvoice(); };

    const generatePDF = async () => {
        setGeneratingPdf(true);
        const element = document.getElementById("invoice-print-area");
        if (!element) {
            setGeneratingPdf(false);
            return;
        }

        try {
            const canvas = await html2canvas(element, {
                scale: 2,
                useCORS: true,
                logging: false,
                onclone: (clonedDoc) => {
                    // Prevent OKLCH/LAB crash in html2canvas by replacing those colors in the clone
                    const clonedElement = clonedDoc.getElementById("invoice-print-area");
                    if (clonedElement) {
                        const allElements = [clonedElement, ...Array.from(clonedElement.getElementsByTagName("*"))];

                        // Map 1:1 tailwind utility classes to HEX colors to prevent html2canvas lab() parsing crash
                        const colorClassMap: Record<string, string> = {
                            'text-white': 'color: #ffffff !important;', 'text-gray-900': 'color: #111827 !important;', 'text-gray-500': 'color: #6b7280 !important;', 'text-gray-400': 'color: #9ca3af !important;', 'text-red-600': 'color: #dc2626 !important;', 'text-emerald-600': 'color: #059669 !important;', 'text-green-700': 'color: #15803d !important;', 'text-amber-700': 'color: #b45309 !important;', 'text-blue-700': 'color: #1d4ed8 !important;',
                            'bg-white': 'background-color: #ffffff !important;', 'bg-gray-50': 'background-color: #f9fafb !important;', 'bg-gray-100': 'background-color: #f3f4f6 !important;', 'bg-red-50': 'background-color: #fef2f2 !important;', 'bg-green-100': 'background-color: #dcfce7 !important;', 'bg-amber-100': 'background-color: #fef3c7 !important;', 'bg-blue-100': 'background-color: #dbeafe !important;',
                            'border-gray-100': 'border-color: #f3f4f6 !important;', 'border-gray-200': 'border-color: #e5e7eb !important;'
                        };

                        for (let i = 0; i < allElements.length; i++) {
                            const el = allElements[i] as HTMLElement;

                            const classes = Array.from(el.classList || []);
                            let inlineStyles = '';
                            classes.forEach(cls => {
                                if (colorClassMap[cls]) inlineStyles += colorClassMap[cls];
                            });

                            if (inlineStyles) {
                                el.style.cssText += ';' + inlineStyles;
                            }

                            const style = window.getComputedStyle(el);
                            const props = [
                                'color', 'background-color', 'border-color',
                                'border-bottom-color', 'border-top-color',
                                'border-left-color', 'border-right-color',
                                'text-decoration-color', 'outline-color',
                                'fill', 'stroke'
                            ];

                            props.forEach(prop => {
                                const val = style.getPropertyValue(prop);
                                if (val && (val.includes('oklch') || val.includes('lab') || val.includes('color('))) {
                                    if (prop === 'background-color') el.style.setProperty(prop, '#ffffff', 'important');
                                    else if (prop.includes('border')) el.style.setProperty(prop, '#e5e7eb', 'important');
                                    else el.style.setProperty(prop, '#111827', 'important');
                                }
                            });

                            el.style.setProperty('box-shadow', 'none', 'important');
                            el.style.setProperty('text-shadow', 'none', 'important');
                        }
                    }
                }
            });
            const imgData = canvas.toDataURL("image/png");
            const pdf = new jsPDF("p", "mm", "a4");

            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

            pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);

            const blob = pdf.output("blob");
            const url = URL.createObjectURL(blob);
            setPdfUrl(url);
            setIsPreviewOpen(true);
        } catch (error) {
            console.error("Error generating PDF:", error);
            alert("Error generating PDF. See console for details.");
        } finally {
            setGeneratingPdf(false);
        }
    };

    const downloadPDF = () => {
        if (!pdfUrl) return;
        const link = document.createElement("a");
        link.href = pdfUrl;
        link.download = `Invoice-${invoice?.invoiceNumber || 'Download'}.pdf`;
        link.click();
    };

    if (loading) return <><PageHeader title="Invoice" backHref="/hospital/billing" /><div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-orange-500" /></div></>;
    if (!invoice) return <><PageHeader title="Invoice Not Found" backHref="/hospital/billing" /><div className="p-6 text-center text-gray-500">Not found</div></>;

    const items = Array.isArray(invoice.items) ? invoice.items : JSON.parse(invoice.items || "[]");
    const balance = Number(invoice.totalAmount) - Number(invoice.paidAmount);

    return (
        <>
            <div className="print:hidden">
                <PageHeader title={`Invoice ${invoice.invoiceNumber}`} backHref="/hospital/billing" action={
                    <Button disabled={generatingPdf} className="hidden sm:inline-flex bg-[#1A56DB] hover:bg-[#1E40AF] text-white" onClick={generatePDF}>
                        {generatingPdf ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <FileText className="h-4 w-4 mr-2" />}
                        {generatingPdf ? "Generating..." : "Download PDF"}
                    </Button>
                } />
            </div>

            <div className="p-4 md:p-6 print:p-0">
                <div id="invoice-print-area" className="max-w-3xl mx-auto bg-white shadow-sm rounded-xl border border-gray-200 p-8 print:shadow-none print:border-none print:max-w-full">

                    {/* Header Section */}
                    <div className="flex justify-between items-start mb-10 pb-6 border-b border-gray-100" style={{ borderColor: '#f3f4f6' }}>
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-xl flex items-center justify-center text-white font-bold text-2xl shadow-sm" style={{ backgroundColor: '#1A56DB' }}>
                                {invoice.hospital?.name?.charAt(0) || 'H'}
                            </div>
                            <div>
                                <h1 className="text-xl font-bold leading-tight" style={{ color: '#111827' }}>{invoice.hospital?.name || 'Hospital Name'}</h1>
                                {invoice.hospital?.phone && <p className="text-sm mt-0.5" style={{ color: '#6b7280' }}>{invoice.hospital.phone}</p>}
                                {invoice.hospital?.email && <p className="text-sm" style={{ color: '#6b7280' }}>{invoice.hospital.email}</p>}
                                {invoice.hospital?.address && <p className="text-sm" style={{ color: '#6b7280' }}>{invoice.hospital.address}</p>}
                            </div>
                        </div>
                        <div className="text-right">
                            <h2 className="text-3xl font-black tracking-tight uppercase" style={{ color: '#1A56DB' }}>Invoice</h2>
                            <p className="font-mono mt-1" style={{ color: '#6b7280' }}>{invoice.invoiceNumber}</p>
                            <p className="text-sm font-medium" style={{ color: '#6b7280' }}>{formatDate(invoice.createdAt)}</p>
                        </div>
                    </div>

                    {/* Patient and Status Section */}
                    <div className="flex justify-between items-end mb-8">
                        <div>
                            <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: '#9ca3af' }}>Billed To</p>
                            <p className="text-lg font-bold" style={{ color: '#111827' }}>{invoice.patient?.name || "Unknown Patient"}</p>
                            <p className="text-sm" style={{ color: '#4b5563' }}>{invoice.patient?.phone}</p>
                            {invoice.patient?.email && <p className="text-sm" style={{ color: '#4b5563' }}>{invoice.patient?.email}</p>}
                            {invoice.patient?.address && <p className="text-sm mt-1" style={{ color: '#4b5563' }}>{invoice.patient?.address}</p>}
                        </div>
                        <div className="text-right">
                            <StatusBadge status={invoice.status} />
                        </div>
                    </div>

                    {/* Items Table */}
                    <div className="rounded-xl border overflow-hidden mb-8 print:border-none" style={{ borderColor: '#e5e7eb' }}>
                        <table className="w-full text-sm">
                            <thead className="print:bg-transparent border-b" style={{ backgroundColor: '#f9fafb', borderColor: '#e5e7eb' }}>
                                <tr>
                                    <th className="text-left py-3 px-4 font-bold" style={{ color: '#374151' }}>Description</th>
                                    <th className="text-center py-3 px-4 font-bold w-24" style={{ color: '#374151' }}>Qty</th>
                                    <th className="text-right py-3 px-4 font-bold w-32" style={{ color: '#374151' }}>Unit Price</th>
                                    <th className="text-right py-3 px-4 font-bold w-32" style={{ color: '#374151' }}>Total</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {items.map((item: any, i: number) => (
                                    <tr key={i}>
                                        <td className="py-3 px-4 font-medium" style={{ color: '#111827' }}>{item.name}</td>
                                        <td className="text-center py-3 px-4" style={{ color: '#4b5563' }}>{item.qty}</td>
                                        <td className="text-right py-3 px-4" style={{ color: '#4b5563' }}>{formatCurrency(item.unitPrice)}</td>
                                        <td className="text-right py-3 px-4 font-medium" style={{ color: '#111827' }}>{formatCurrency(item.total)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Summary Section */}
                    <div className="flex justify-end border-t border-gray-200 pt-6">
                        <div className="w-full max-w-sm space-y-3">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Subtotal</span>
                                <span className="font-medium text-gray-900">{formatCurrency(invoice.subtotal)}</span>
                            </div>
                            {Number(invoice.discount) > 0 && (
                                <div className="flex justify-between text-sm text-red-600">
                                    <span>Discount</span>
                                    <span className="font-medium">-{formatCurrency(invoice.discount)}</span>
                                </div>
                            )}
                            <div className="flex justify-between text-lg font-bold border-t border-gray-200 pt-3">
                                <span className="text-gray-900">Total</span>
                                <span className="text-gray-900">{formatCurrency(invoice.totalAmount)}</span>
                            </div>

                            <div className="flex justify-between text-sm pt-2">
                                <span className="text-emerald-600 font-medium">Amount Paid</span>
                                <span className="text-emerald-600 font-bold">{formatCurrency(invoice.paidAmount)}</span>
                            </div>

                            {balance > 0 && (
                                <div className="flex justify-between text-base font-bold text-red-600 bg-red-50 p-3 rounded-lg mt-2">
                                    <span>Balance Due</span>
                                    <span>{formatCurrency(balance)}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Payment Control (Hidden in print) */}
                    {invoice.status !== "paid" && (
                        <div className="mt-10 pt-6 border-t border-gray-200 print:hidden bg-gray-50 -mx-8 -mb-8 p-8 rounded-b-xl">
                            <h3 className="text-sm font-bold text-gray-900 mb-4 font-dm-sans">Record Payment</h3>
                            <div className="flex gap-4 items-end max-w-md mb-4">
                                <div className="flex-1 space-y-1.5">
                                    <Label className="text-xs text-gray-500">Amount to Pay</Label>
                                    <Input type="number" placeholder="Enter amount..." min={1} value={paymentAmount} onChange={e => setPaymentAmount(e.target.value)} className="bg-white border-gray-200 focus-visible:ring-[#1A56DB]" />
                                </div>
                                <Button onClick={() => handlePayment(false)} disabled={paying || !paymentAmount} variant="outline" className="border-gray-200 text-gray-700 hover:bg-gray-100">
                                    Add Payment
                                </Button>
                            </div>
                            <Button onClick={() => handlePayment(true)} disabled={paying} className="w-full max-w-md bg-emerald-600 hover:bg-emerald-700 text-white font-medium h-10 shadow-sm">
                                {paying ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                Mark as Fully Paid
                            </Button>
                        </div>
                    )}
                </div>
            </div>

            <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
                <DialogContent className="max-w-4xl h-[90vh] p-0 flex flex-col rounded-xl overflow-hidden border-0 shadow-2xl">
                    <DialogHeader className="p-4 border-b border-gray-100 flex-shrink-0 bg-white">
                        <DialogTitle>Invoice Preview</DialogTitle>
                    </DialogHeader>
                    <div className="flex-1 bg-gray-100 p-4 overflow-hidden">
                        {pdfUrl ? (
                            <iframe src={pdfUrl} className="w-full h-full rounded shadow-sm border border-gray-200" title="PDF Preview" />
                        ) : (
                            <div className="flex items-center justify-center h-full text-gray-500">Preparing preview...</div>
                        )}
                    </div>
                    <DialogFooter className="p-4 border-t border-gray-100 flex-shrink-0 bg-white">
                        <Button variant="outline" onClick={() => setIsPreviewOpen(false)}>Close</Button>
                        <Button onClick={downloadPDF} className="bg-[#1A56DB] hover:bg-[#1E40AF] text-white">
                            <Download className="w-4 h-4 mr-2" /> Download PDF
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
