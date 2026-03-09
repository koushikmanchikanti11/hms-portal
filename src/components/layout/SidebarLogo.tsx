import { Hospital } from "lucide-react";

interface SidebarLogoProps {
    label: string;
    sublabel?: string;
    accentColor: string;
}

export function SidebarLogo({ label, sublabel, accentColor }: SidebarLogoProps) {
    return (
        <div className="px-4 py-4 border-b border-gray-200">
            {/* Thin accent strip */}
            <div className="w-full h-0.5 rounded-full mb-3" style={{ background: accentColor }} />
            <div className="flex items-center gap-2.5">
                {/* Icon box */}
                <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                    style={{ background: accentColor }}>
                    <Hospital className="w-4 h-4 text-white" />
                </div>
                <div>
                    <p className="text-sm font-bold text-gray-900 leading-tight">{label}</p>
                    {sublabel && <p className="text-[11px] text-gray-500 leading-tight">{sublabel}</p>}
                </div>
            </div>
        </div>
    );
}
