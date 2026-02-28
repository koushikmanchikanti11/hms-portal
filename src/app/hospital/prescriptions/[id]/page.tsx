"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Loader2, Printer } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default function PrescriptionDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const [prescription, setPrescription] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`/api/prescriptions/${id}`).then(r => r.json()).then(d => { setPrescription(d); setLoading(false); }).catch(() => setLoading(false));
    }, [id]);

    if (loading) return <><PageHeader title="Prescription" backHref="/hospital/prescriptions" /><div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-orange-500" /></div></>;
    if (!prescription) return <><PageHeader title="Prescription" backHref="/hospital/prescriptions" /><div className="p-6 text-center text-gray-500">Prescription not found.</div></>;

    const items = (prescription.items || []) as any[];

    return (
        <>
            <PageHeader title="Prescription Detail" backHref="/hospital/prescriptions" action={<Button onClick={() => window.print()} className="bg-orange-500 hover:bg-orange-600 text-white print:hidden"><Printer className="h-4 w-4 mr-2" />Print</Button>} />
            <div className="p-4 md:p-6">
                {/* Printable Prescription */}
                <div className="max-w-lg mx-auto bg-white rounded-xl border p-8 print:border-0 print:shadow-none print:rounded-none">
                    {/* Hospital letterhead */}
                    <div className="flex justify-between border-b-2 border-gray-800 pb-3 mb-4">
                        <div>
                            <h1 className="text-xl font-bold text-orange-500">Hospital</h1>
                            <p className="text-xs text-gray-500">Healthcare Management System</p>
                        </div>
                        <div className="text-right">
                            {prescription.doctor && (
                                <>
                                    <p className="font-bold text-gray-900">Dr. {prescription.doctor.name}</p>
                                    <p className="text-sm text-gray-600">{prescription.doctor.specialization}</p>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Patient info */}
                    <div className="flex justify-between text-sm mb-4">
                        <div><span className="text-gray-500">Patient: </span><strong>{prescription.patient.name}</strong></div>
                        <div><span className="text-gray-500">Date: </span>{formatDate(prescription.issuedAt)}</div>
                    </div>
                    <div className="flex justify-between text-sm mb-4">
                        <div><span className="text-gray-500">Status: </span><StatusBadge status={prescription.status} /></div>
                        {prescription.validUntil && <div><span className="text-gray-500">Valid Until: </span>{formatDate(prescription.validUntil)}</div>}
                    </div>

                    {/* Rx symbol + medicine list */}
                    <p className="text-3xl font-serif text-gray-800 mb-3">℞</p>
                    <ol className="space-y-3">
                        {items.map((item: any, i: number) => (
                            <li key={i} className="border-b border-dashed pb-2">
                                <p className="font-semibold">{i + 1}. {item.medicineName} {item.dosage}</p>
                                <p className="text-sm text-gray-600">{item.frequency} × {item.duration} {item.quantity ? `(Qty: ${item.quantity})` : ""}</p>
                                {item.instructions && <p className="text-xs text-gray-500">{item.instructions}</p>}
                            </li>
                        ))}
                    </ol>

                    {/* Notes */}
                    {prescription.notes && <p className="mt-4 text-sm italic text-gray-600">{prescription.notes}</p>}

                    {/* Signature */}
                    <div className="mt-10 flex justify-end">
                        <div className="text-center border-t border-gray-400 pt-2 w-40">
                            <p className="text-xs text-gray-500">Doctor&apos;s Signature</p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
