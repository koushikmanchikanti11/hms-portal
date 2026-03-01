"use client";

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { AlertTriangle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ConfirmDialogProps {
    open: boolean;
    onOpenChange?: (open: boolean) => void;
    title: string;
    description: string;
    onConfirm: () => void;
    onCancel?: () => void;
    loading?: boolean;
}

export function ConfirmDialog({ open, onOpenChange, title, description, onConfirm, onCancel, loading }: ConfirmDialogProps) {
    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent className="rounded-2xl p-6 max-w-sm border-none shadow-[0_20px_40px_rgba(0,0,0,0.12)]">
                <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center mb-4">
                    <AlertTriangle className="w-5 h-5 text-red-500" />
                </div>
                <AlertDialogHeader className="text-left">
                    <AlertDialogTitle className="text-[17px] font-semibold text-gray-900 mb-1 font-dm-sans">
                        {title}
                    </AlertDialogTitle>
                    <AlertDialogDescription className="text-sm text-gray-500">
                        {description}
                    </AlertDialogDescription>
                </AlertDialogHeader>

                <div className="flex gap-2 mt-6">
                    <AlertDialogCancel asChild>
                        <Button
                            variant="outline"
                            className="flex-1 border-gray-200 text-gray-700 hover:bg-gray-50 rounded-lg h-10 mt-0"
                            onClick={onCancel}
                            disabled={loading}
                        >
                            Cancel
                        </Button>
                    </AlertDialogCancel>
                    <Button
                        className="flex-1 bg-red-500 hover:bg-red-600 text-white rounded-lg h-10"
                        onClick={onConfirm}
                        disabled={loading}
                    >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Delete"}
                    </Button>
                </div>
            </AlertDialogContent>
        </AlertDialog>
    );
}
