"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export default function ConfigPage() {
    const [config, setConfig] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ text: "", type: "" });

    useEffect(() => {
        const fetchConfig = async () => {
            try {
                const res = await fetch("/api/admin/config");
                if (res.ok) {
                    const data = await res.json();
                    setConfig({
                        platform_name: data.platform_name || "HMS Platform",
                        support_email: data.support_email || "support@hms.com",
                        maintenance_mode: data.maintenance_mode || "false",
                        allow_registration: data.allow_registration || "true",
                    });
                }
            } catch (error) {
                console.error("Failed to fetch system config");
            } finally {
                setLoading(false);
            }
        };

        fetchConfig();
    }, []);

    const handleChange = (key: string, value: string) => {
        setConfig(prev => ({ ...prev, [key]: value }));
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setMessage({ text: "", type: "" });

        try {
            const res = await fetch("/api/admin/config", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(config),
            });

            if (res.ok) {
                setMessage({ text: "Configuration saved successfully", type: "success" });
            } else {
                setMessage({ text: "Failed to save configuration", type: "error" });
            }
        } catch (error) {
            setMessage({ text: "An error occurred", type: "error" });
        } finally {
            setSaving(false);
            setTimeout(() => setMessage({ text: "", type: "" }), 3000);
        }
    };

    return (
        <>
            <PageHeader title="System Configuration" />

            <div className="p-4 md:p-6 space-y-6">
                {loading ? (
                    <div className="flex justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-[#1A56DB]" />
                    </div>
                ) : (
                    <form onSubmit={handleSave} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:p-8 max-w-3xl">
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-lg font-medium text-gray-900">General Settings</h3>
                                <p className="text-sm text-gray-500 mb-4">Manage global platform settings and configurations.</p>
                            </div>

                            {message.text && (
                                <div className={`p-3 text-sm rounded-md ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                                    {message.text}
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="platform_name">Platform Name</Label>
                                    <Input
                                        id="platform_name"
                                        value={config.platform_name || ""}
                                        onChange={(e) => handleChange("platform_name", e.target.value)}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="support_email">Support Email</Label>
                                    <Input
                                        id="support_email"
                                        type="email"
                                        value={config.support_email || ""}
                                        onChange={(e) => handleChange("support_email", e.target.value)}
                                    />
                                </div>

                                <div className="space-y-2 flex flex-col justify-center mt-2 border border-gray-100 p-4 rounded-lg bg-gray-50">
                                    <div className="flex items-center gap-3">
                                        <input
                                            type="checkbox"
                                            id="maintenance_mode"
                                            checked={config.maintenance_mode === "true"}
                                            onChange={(e) => handleChange("maintenance_mode", e.target.checked ? "true" : "false")}
                                            className="h-4 w-4 rounded border-gray-300 text-[#1A56DB] focus:ring-[#1A56DB]"
                                        />
                                        <Label htmlFor="maintenance_mode" className="font-medium cursor-pointer">Maintenance Mode</Label>
                                    </div>
                                    <p className="text-xs text-gray-500 pl-7">Disables access for all non-admin users when active.</p>
                                </div>

                                <div className="space-y-2 flex flex-col justify-center mt-2 border border-gray-100 p-4 rounded-lg bg-gray-50">
                                    <div className="flex items-center gap-3">
                                        <input
                                            type="checkbox"
                                            id="allow_registration"
                                            checked={config.allow_registration === "true"}
                                            onChange={(e) => handleChange("allow_registration", e.target.checked ? "true" : "false")}
                                            className="h-4 w-4 rounded border-gray-300 text-orange-600 focus:ring-orange-600"
                                        />
                                        <Label htmlFor="allow_registration" className="font-medium cursor-pointer">Allow New Registrations</Label>
                                    </div>
                                    <p className="text-xs text-gray-500 pl-7">Enable or disable new user signups globally.</p>
                                </div>
                            </div>

                            <div className="pt-6 border-t border-gray-100 flex justify-end">
                                <Button type="submit" className="bg-[#1A56DB] hover:bg-[#1E40AF] text-white" disabled={saving}>
                                    {saving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</> : <><Save className="w-4 h-4 mr-2" /> Save Configuration</>}
                                </Button>
                            </div>
                        </div>
                    </form>
                )}
            </div>
        </>
    );
}
