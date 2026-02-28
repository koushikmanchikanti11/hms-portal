"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface BookAppointmentModalProps {
    onSuccess: () => void;
    trigger?: React.ReactNode;
}

export function BookAppointmentModal({ onSuccess, trigger }: BookAppointmentModalProps) {
    const [open, setOpen] = useState(false);
    const [doctors, setDoctors] = useState<any[]>([]);
    const [loadingDoctors, setLoadingDoctors] = useState(false);

    const [doctorId, setDoctorId] = useState("");
    const [date, setDate] = useState<Date>();
    const [booking, setBooking] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (open && doctors.length === 0) {
            setLoadingDoctors(true);
            fetch("/api/doctors")
                .then((res) => res.json())
                .then((data) => setDoctors(Array.isArray(data) ? data : []))
                .catch(() => setError("Failed to load doctors"))
                .finally(() => setLoadingDoctors(false));
        }
    }, [open, doctors.length]);

    const handleBook = async () => {
        if (!doctorId || !date) {
            setError("Please select a doctor and date");
            return;
        }

        setBooking(true);
        setError("");

        try {
            const res = await fetch("/api/patient/appointments", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    doctorId,
                    appointmentDate: date.toISOString(),
                }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Failed to book appointment");
            }

            setOpen(false);
            setDoctorId("");
            setDate(undefined);
            onSuccess();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setBooking(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || <Button className="bg-orange-500 hover:bg-orange-600 text-white">Book Appointment</Button>}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Book an Appointment</DialogTitle>
                    <DialogDescription>
                        Select a doctor and date for your consultation.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    {error && (
                        <div className="p-3 text-sm text-red-700 bg-red-50 rounded-md border border-red-200">
                            {error}
                        </div>
                    )}

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Doctor</label>
                        <Select value={doctorId} onValueChange={setDoctorId} disabled={loadingDoctors}>
                            <SelectTrigger>
                                <SelectValue placeholder={loadingDoctors ? "Loading..." : "Select doctor"} />
                            </SelectTrigger>
                            <SelectContent>
                                {doctors.map((doc) => (
                                    <SelectItem key={doc.id} value={doc.id}>
                                        Dr. {doc.name} ({doc.specialization})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2 flex flex-col">
                        <label className="text-sm font-medium">Date</label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant={"outline"}
                                    className={cn(
                                        "w-full justify-start text-left font-normal",
                                        !date && "text-muted-foreground"
                                    )}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {date ? format(date, "PPP") : <span>Pick a date</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                    mode="single"
                                    selected={date}
                                    onSelect={setDate}
                                    initialFocus
                                    disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                                />
                            </PopoverContent>
                        </Popover>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)} disabled={booking}>
                        Cancel
                    </Button>
                    <Button onClick={handleBook} disabled={booking || !doctorId || !date} className="bg-orange-500 hover:bg-orange-600 text-white">
                        {booking ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Booking...</> : "Confirm Booking"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
