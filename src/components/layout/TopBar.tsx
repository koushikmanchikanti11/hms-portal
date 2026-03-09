"use client";

import { Search, Plus, Bell, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { formatDistanceToNow } from "date-fns";
import { useRouter } from "next/navigation";

function ModalSearchInput({ type, placeholder }: { type: 'patient' | 'doctor', placeholder: string }) {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<any[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (query.trim().length === 0) {
            setResults([]);
            setIsOpen(false);
            return;
        }
        const delay = setTimeout(() => {
            setLoading(true);
            fetch(`/api/dashboard/topbar?q=${query}`)
                .then(r => r.json())
                .then(d => {
                    if (type === 'patient') setResults(d.search?.patients || []);
                    if (type === 'doctor') setResults(d.search?.doctors || []);
                    setIsOpen(true);
                    setLoading(false);
                });
        }, 300);
        return () => clearTimeout(delay);
    }, [query, type]);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setIsOpen(false); };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={ref}>
            <Input
                placeholder={placeholder}
                value={query}
                onChange={e => setQuery(e.target.value)}
                onFocus={() => { if (results.length > 0) setIsOpen(true); }}
                className="mt-1 bg-gray-50 border-gray-200 focus-visible:ring-[#1A56DB]"
                required
            />
            {loading && <Loader2 className="absolute right-3 top-1/2 w-4 h-4 text-gray-400 animate-spin" style={{ marginTop: '-6px' }} />}
            {isOpen && results.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-100 z-[60] max-h-40 overflow-y-auto">
                    {results.map(r => (
                        <div
                            key={r.id}
                            onClick={() => { setQuery(r.name); setIsOpen(false); }}
                            className="px-3 py-2 hover:bg-gray-50 cursor-pointer text-sm font-medium text-gray-900 border-b border-gray-50 last:border-0"
                        >
                            {r.name}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export function TopBar({ userRole }: { userRole?: string } = {}) {
    const router = useRouter();
    const [notificationsOpen, setNotificationsOpen] = useState(false);
    const [notifications, setNotifications] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [isSearching, setIsSearching] = useState(false);
    const [searchResults, setSearchResults] = useState<{ patients: any[], doctors: any[] }>({ patients: [], doctors: [] });
    const searchRef = useRef<HTMLDivElement>(null);
    const [isSearchOpen, setIsSearchOpen] = useState(false);

    // Modal states
    const [isApptOpen, setIsApptOpen] = useState(false);
    const [isPatOpen, setIsPatOpen] = useState(false);
    const [isInvOpen, setIsInvOpen] = useState(false);
    const [isRxOpen, setIsRxOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // Initial load of notifications
    useEffect(() => {
        fetch("/api/dashboard/topbar")
            .then(res => res.json())
            .then(data => {
                if (data.notifications) setNotifications(data.notifications);
            })
            .catch(console.error);
    }, []);

    // Handle Search with debounce
    useEffect(() => {
        if (searchQuery.trim().length < 2) {
            setSearchResults({ patients: [], doctors: [] });
            setIsSearchOpen(false);
            return;
        }

        const delayDebounceFn = setTimeout(() => {
            setIsSearching(true);
            fetch(`/api/dashboard/topbar?q=${encodeURIComponent(searchQuery)}`)
                .then(res => res.json())
                .then(data => {
                    if (data.search) {
                        setSearchResults(data.search);
                        setIsSearchOpen(true);
                    }
                    setIsSearching(false);
                })
                .catch(() => setIsSearching(false));
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery]);

    // Close search dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setIsSearchOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const unreadCount = notifications.filter(n => n.unread).length;
    const markAllAsRead = () => {
        setNotifications(notifications.map(n => ({ ...n, unread: false })));
    };

    // Form handlers (Mock functions for UI)
    const handleQuickAction = (e: React.FormEvent, type: string) => {
        e.preventDefault();
        setSubmitting(true);
        setTimeout(() => {
            setSubmitting(false);
            if (type === 'appt') setIsApptOpen(false);
            if (type === 'pat') setIsPatOpen(false);
            if (type === 'inv') setIsInvOpen(false);
            if (type === 'rx') setIsRxOpen(false);
            router.refresh();
        }, 800);
    };

    const showQuickActions = userRole !== 'patient' && userRole !== 'super_admin';

    return (
        <header className="h-16 bg-white border-b border-gray-200 flex items-center px-6 gap-3 sticky top-0 z-30 shrink-0 print:hidden">
            {/* Global Search */}
            <div className="relative flex-1 max-w-sm" ref={searchRef}>
                <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 w-full focus-within:ring-2 focus-within:ring-blue-100 focus-within:border-blue-300 transition-all">
                    {isSearching ? <Loader2 className="w-4 h-4 text-[#1A56DB] shrink-0 animate-spin" /> : <Search className="w-4 h-4 text-gray-400 shrink-0" />}
                    <input
                        type="text"
                        placeholder="Search patients, doctors..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onFocus={() => { if (searchQuery.trim().length >= 2) setIsSearchOpen(true); }}
                        className="bg-transparent border-none outline-none text-sm text-gray-700 placeholder:text-gray-400 w-full"
                    />
                </div>

                {/* Search Results Dropdown */}
                {isSearchOpen && (searchResults.patients.length > 0 || searchResults.doctors.length > 0) && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-[var(--shadow-lg)] border border-gray-100 z-50 overflow-hidden">
                        <div className="max-h-[60vh] overflow-y-auto p-2">
                            {searchResults.patients.length > 0 && (
                                <div className="mb-2">
                                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 py-2">Patients</h4>
                                    {searchResults.patients.map(p => (
                                        <div
                                            key={p.id}
                                            onClick={() => {
                                                setIsSearchOpen(false);
                                                window.location.href = '/hospital/patients';
                                            }}
                                            className="px-3 py-2.5 hover:bg-gray-50 rounded-lg cursor-pointer flex flex-col transition-colors"
                                        >
                                            <span className="text-sm font-medium text-gray-900">{p.name}</span>
                                            <span className="text-xs text-gray-500">{p.phone}</span>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {searchResults.doctors.length > 0 && (
                                <div>
                                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 py-2 border-t border-gray-50 pt-3">Doctors</h4>
                                    {searchResults.doctors.map(d => (
                                        <div
                                            key={d.id}
                                            onClick={() => {
                                                setIsSearchOpen(false);
                                                window.location.href = '/hospital/doctors';
                                            }}
                                            className="px-3 py-2.5 hover:bg-gray-50 rounded-lg cursor-pointer flex flex-col transition-colors"
                                        >
                                            <span className="text-sm font-medium text-gray-900">{d.name}</span>
                                            <span className="text-xs text-[#1A56DB]">{d.specialization}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            <div className="ml-auto flex items-center gap-2">
                {userRole && (
                    <div className="hidden sm:flex items-center px-2.5 py-1 rounded-md bg-blue-50/50 text-xs font-medium text-blue-700 border border-blue-100/50 mr-2">
                        {userRole === 'patient' ? 'Patient View — Read Only' :
                            userRole.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                    </div>
                )}

                {showQuickActions && (
                    <>
                        {/* Appointment Modal */}
                        <Dialog open={isApptOpen} onOpenChange={setIsApptOpen}>
                            <DialogTrigger asChild>
                                <Button suppressHydrationWarning size="sm" className="bg-[#1A56DB] hover:bg-[#1E40AF] text-white text-xs gap-1.5 shadow-sm rounded-lg h-8">
                                    <Plus className="w-3.5 h-3.5" /> Appointment
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[425px] rounded-2xl border-0 shadow-2xl">
                                <DialogHeader>
                                    <DialogTitle className="text-xl font-bold font-dm-sans text-gray-900">New Appointment</DialogTitle>
                                </DialogHeader>
                                <form onSubmit={(e) => handleQuickAction(e, 'appt')} className="space-y-4 mt-2">
                                    <div className="space-y-3">
                                        <div><Label className="text-xs text-gray-500">Patient</Label><ModalSearchInput type="patient" placeholder="Search Patient..." /></div>
                                        <div><Label className="text-xs text-gray-500">Doctor</Label><ModalSearchInput type="doctor" placeholder="Search Doctor..." /></div>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div><Label className="text-xs text-gray-500">Date</Label><Input type="date" required className="mt-1 bg-gray-50 border-gray-200 focus-visible:ring-[#1A56DB]" /></div>
                                            <div><Label className="text-xs text-gray-500">Time</Label><Input type="time" required className="mt-1 bg-gray-50 border-gray-200 focus-visible:ring-[#1A56DB]" /></div>
                                        </div>
                                    </div>
                                    <Button type="submit" disabled={submitting} className="w-full bg-[#1A56DB] hover:bg-[#1E40AF] text-white rounded-xl h-10">
                                        {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : "Schedule Appointment"}
                                    </Button>
                                </form>
                            </DialogContent>
                        </Dialog>

                        <div className="hidden sm:flex items-center gap-2">
                            {/* Patient Modal */}
                            <Dialog open={isPatOpen} onOpenChange={setIsPatOpen}>
                                <DialogTrigger asChild>
                                    <Button suppressHydrationWarning size="sm" variant="outline" className="text-xs gap-1.5 border-gray-200 text-gray-700 bg-white hover:bg-gray-50 rounded-lg h-8">
                                        <Plus className="w-3.5 h-3.5" /> Patient
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-[500px] rounded-2xl border-0 shadow-2xl">
                                    <DialogHeader>
                                        <DialogTitle className="text-xl font-bold font-dm-sans text-gray-900">Register Patient</DialogTitle>
                                    </DialogHeader>
                                    <form onSubmit={(e) => handleQuickAction(e, 'pat')} className="space-y-4 mt-2">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="col-span-2"><Label className="text-xs text-gray-500">Full Name</Label><Input placeholder="John Doe" required className="mt-1 bg-gray-50 border-gray-200 focus-visible:ring-[#1A56DB]" /></div>
                                            <div><Label className="text-xs text-gray-500">Phone</Label><Input placeholder="+1..." required className="mt-1 bg-gray-50 border-gray-200 focus-visible:ring-[#1A56DB]" /></div>
                                            <div><Label className="text-xs text-gray-500">Date of Birth</Label><Input type="date" className="mt-1 bg-gray-50 border-gray-200 focus-visible:ring-[#1A56DB]" /></div>
                                            <div>
                                                <Label className="text-xs text-gray-500">Gender</Label>
                                                <Select>
                                                    <SelectTrigger className="mt-1 bg-gray-50 border-gray-200"><SelectValue placeholder="Select" /></SelectTrigger>
                                                    <SelectContent><SelectItem value="male">Male</SelectItem><SelectItem value="female">Female</SelectItem></SelectContent>
                                                </Select>
                                            </div>
                                            <div>
                                                <Label className="text-xs text-gray-500">Blood</Label>
                                                <Select>
                                                    <SelectTrigger className="mt-1 bg-gray-50 border-gray-200"><SelectValue placeholder="Select" /></SelectTrigger>
                                                    <SelectContent><SelectItem value="o+">O+</SelectItem><SelectItem value="a+">A+</SelectItem></SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                        <Button type="submit" disabled={submitting} className="w-full bg-[#1A56DB] hover:bg-[#1E40AF] text-white rounded-xl h-10 mt-2">
                                            {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : "Save Patient"}
                                        </Button>
                                    </form>
                                </DialogContent>
                            </Dialog>

                            {/* Invoice Modal */}
                            <Dialog open={isInvOpen} onOpenChange={setIsInvOpen}>
                                <DialogTrigger asChild>
                                    <Button suppressHydrationWarning size="sm" variant="outline" className="text-xs gap-1.5 border-gray-200 text-gray-700 bg-white hover:bg-gray-50 rounded-lg h-8">
                                        <Plus className="w-3.5 h-3.5" /> Invoice
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-[425px] rounded-2xl border-0 shadow-2xl">
                                    <DialogHeader>
                                        <DialogTitle className="text-xl font-bold font-dm-sans text-gray-900">Draft Invoice</DialogTitle>
                                    </DialogHeader>
                                    <form onSubmit={(e) => handleQuickAction(e, 'inv')} className="space-y-4 mt-2">
                                        <div className="space-y-3">
                                            <div><Label className="text-xs text-gray-500">Patient</Label><ModalSearchInput type="patient" placeholder="Search Patient..." /></div>
                                            <div><Label className="text-xs text-gray-500">Amount ($)</Label><Input type="number" placeholder="0.00" required className="mt-1 bg-gray-50 border-gray-200 focus-visible:ring-[#1A56DB]" /></div>
                                            <div><Label className="text-xs text-gray-500">Due Date</Label><Input type="date" required className="mt-1 bg-gray-50 border-gray-200 focus-visible:ring-[#1A56DB]" /></div>
                                        </div>
                                        <Button type="submit" disabled={submitting} className="w-full bg-[#1A56DB] hover:bg-[#1E40AF] text-white rounded-xl h-10 mt-2">
                                            {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : "Create Invoice"}
                                        </Button>
                                    </form>
                                </DialogContent>
                            </Dialog>

                            {/* Prescription Modal */}
                            <Dialog open={isRxOpen} onOpenChange={setIsRxOpen}>
                                <DialogTrigger asChild>
                                    <Button suppressHydrationWarning size="sm" variant="outline" className="text-xs gap-1.5 border-gray-200 text-gray-700 bg-white hover:bg-gray-50 rounded-lg h-8">
                                        <Plus className="w-3.5 h-3.5" /> Prescription
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-[425px] rounded-2xl border-0 shadow-2xl">
                                    <DialogHeader>
                                        <DialogTitle className="text-xl font-bold font-dm-sans text-gray-900">New Prescription</DialogTitle>
                                    </DialogHeader>
                                    <form onSubmit={(e) => handleQuickAction(e, 'rx')} className="space-y-4 mt-2">
                                        <div className="space-y-3">
                                            <div><Label className="text-xs text-gray-500">Patient</Label><ModalSearchInput type="patient" placeholder="Search Patient..." /></div>
                                            <div><Label className="text-xs text-gray-500">Medications (Comma separated)</Label><Input placeholder="Paracetamol, Amoxicillin..." required className="mt-1 bg-gray-50 border-gray-200 focus-visible:ring-[#1A56DB]" /></div>
                                            <div><Label className="text-xs text-gray-500">Notes / Dosage</Label><Input placeholder="1x daily after food" className="mt-1 bg-gray-50 border-gray-200 focus-visible:ring-[#1A56DB]" /></div>
                                        </div>
                                        <Button type="submit" disabled={submitting} className="w-full bg-[#1A56DB] hover:bg-[#1E40AF] text-white rounded-xl h-10 mt-2">
                                            {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : "Issue Prescription"}
                                        </Button>
                                    </form>
                                </DialogContent>
                            </Dialog>
                        </div>
                    </>
                )}

                <div className="w-px h-6 bg-gray-200 mx-1 hidden sm:block" />

                {/* Notifications Dropdown Container */}
                <div className="relative">
                    <button
                        onClick={() => setNotificationsOpen(!notificationsOpen)}
                        className="w-8 h-8 rounded-lg border border-gray-200 bg-white flex items-center justify-center text-gray-500 hover:bg-gray-50 relative transition-colors focus:outline-none"
                    >
                        <Bell className="w-4 h-4" />
                        {unreadCount > 0 && (
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
                        )}
                    </button>

                    {/* Notification Dropdown Panel */}
                    {notificationsOpen && (
                        <>
                            <div
                                className="fixed inset-0 z-40"
                                onClick={() => setNotificationsOpen(false)}
                            />
                            <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-[var(--shadow-lg)] border border-gray-100 z-50 overflow-hidden">
                                <div className="px-4 py-3 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                                    <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
                                    <span onClick={markAllAsRead} className="text-xs text-[#1A56DB] font-medium cursor-pointer hover:underline">
                                        Mark all read
                                    </span>
                                </div>
                                <div className="max-h-80 overflow-y-auto">
                                    {notifications.length > 0 ? (
                                        notifications.map((n) => (
                                            <div key={n.id} className={`p-4 border-b border-gray-50 hover:bg-gray-50/80 transition-colors cursor-pointer ${n.unread ? 'bg-blue-50/30' : ''}`}>
                                                <div className="flex justify-between items-start mb-1">
                                                    <h4 className={`text-sm tracking-tight ${n.unread ? 'font-semibold text-gray-900' : 'font-medium text-gray-700'}`}>
                                                        {n.title}
                                                    </h4>
                                                    <span className="text-[10px] text-gray-400 whitespace-nowrap ml-2">
                                                        {n.time ? formatDistanceToNow(new Date(n.time), { addSuffix: true }) : ''}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-gray-500">{n.desc}</p>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="p-8 text-center text-sm text-gray-500">
                                            No new notifications
                                        </div>
                                    )}
                                </div>
                                <div className="p-3 border-t border-gray-100 text-center bg-gray-50/50">
                                    <Link href="/hospital/dashboard" onClick={() => setNotificationsOpen(false)} className="text-xs font-medium text-gray-500 hover:text-gray-900 transition-colors">
                                        View All Activity
                                    </Link>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
}
