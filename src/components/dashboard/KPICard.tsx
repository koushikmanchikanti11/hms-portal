import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface KPICardProps {
    title?: string;
    label?: string;
    value: string | number | React.ReactNode;
    subtitle?: string;
    icon: LucideIcon | React.ElementType;
    color?: "orange" | "green" | "amber" | "red" | "blue" | "purple" | "indigo" | "cyan";
    iconColor?: "blue" | "green" | "amber" | "red" | "purple" | "cyan";
    trend?: "up" | "down" | "neutral" | { value: string | React.ReactNode; direction: "up" | "down" | "neutral"; label: string };
    className?: string;
    variant?: "default" | "highlight";
}

const colorMap = {
    orange: { bg: "bg-orange-50", icon: "text-orange-500", border: "border-orange-100" },
    green: { bg: "bg-green-50", icon: "text-green-600", border: "border-green-100" },
    amber: { bg: "bg-amber-50", icon: "text-amber-600", border: "border-amber-100" },
    red: { bg: "bg-red-50", icon: "text-red-600", border: "border-red-100" },
    blue: { bg: "bg-blue-50", icon: "text-blue-600", border: "border-blue-100" },
    purple: { bg: "bg-purple-50", icon: "text-purple-600", border: "border-purple-100" },
    indigo: { bg: "bg-indigo-50", icon: "text-indigo-500", border: "border-indigo-100" },
    cyan: { bg: "bg-cyan-50", icon: "text-cyan-600", border: "border-cyan-100" },
};

export function KPICard({ title, label, value, subtitle, icon: Icon, color, iconColor = "blue", trend, className, variant = "default" }: KPICardProps) {
    const displayLabel = label || title;
    const activeColor = color || iconColor;
    const colors = colorMap[activeColor] || colorMap.blue;

    const isHighlight = variant === "highlight";

    return (
        <div className={cn(
            "border rounded-xl p-5 flex flex-col gap-3 shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)] transition-shadow",
            isHighlight ? "bg-[#1A56DB] border-[#1E40AF]" : "bg-white border-gray-200",
            className
        )}>
            <div className="flex items-center justify-between">
                <span className={cn("text-[13px] font-medium leading-tight", isHighlight ? "text-blue-100" : "text-gray-500")}>
                    {displayLabel}
                </span>
                <div className={cn(
                    "h-8 w-8 rounded-lg flex items-center justify-center shrink-0",
                    isHighlight ? "bg-white/10" : colors.bg
                )}>
                    <Icon className={cn("h-4 w-4", isHighlight ? "text-white" : colors.icon)} />
                </div>
            </div>

            <span className={cn(
                "text-[32px] md:text-[36px] font-bold tracking-tight tabular-nums leading-none font-dm-sans",
                isHighlight ? "text-white" : "text-gray-900"
            )}>
                {typeof value === "number" ? value.toLocaleString() : value}
            </span>

            {/* Legacy string trend support */}
            {typeof trend === "string" && subtitle && (
                <div className="flex items-center gap-1.5 text-xs mt-1">
                    <span className={cn(
                        "inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-semibold tabular",
                        isHighlight
                            ? "bg-white/20 text-white"
                            : trend === "up" ? "bg-green-100 text-green-700" : trend === "down" ? "bg-red-100 text-red-600" : "text-gray-500"
                    )}>
                        {trend === "up" ? "↑" : trend === "down" ? "↓" : ""}
                    </span>
                    <span className={isHighlight ? "text-blue-200" : "text-gray-400"}>
                        {subtitle}
                    </span>
                </div>
            )}

            {/* New object trend support */}
            {typeof trend === "object" && trend !== null && (
                <div className="flex items-center gap-1.5 text-xs">
                    <span className={cn(
                        "inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-semibold tabular",
                        isHighlight
                            ? "bg-white/20 text-white"
                            : trend.direction === "up" ? "bg-green-100 text-green-700" :
                                trend.direction === "down" ? "bg-red-100 text-red-600" :
                                    "bg-gray-100 text-gray-500"
                    )}>
                        {trend.direction === "up" ? "+" : trend.direction === "down" ? "-" : ""}{trend.value}
                    </span>
                    <span className={isHighlight ? "text-blue-200" : "text-gray-400"}>
                        {trend.label}
                    </span>
                </div>
            )}

            {/* Simple subtitle without trend */}
            {!trend && subtitle && (
                <div className={cn("text-xs mt-1", isHighlight ? "text-blue-200" : "text-gray-400")}>
                    {subtitle}
                </div>
            )}
        </div>
    );
}
