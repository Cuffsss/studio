
"use client"

import { cn } from "@/lib/utils";

interface CircularProgressProps {
    progress: number;
    children?: React.ReactNode;
    needsCheckup?: boolean;
}

const CircularProgress: React.FC<CircularProgressProps> = ({ progress, children, needsCheckup = false }) => {
    const radius = 50;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (progress / 100) * circumference;

    return (
        <div className="relative w-32 h-32">
            <svg
                className="w-full h-full"
                viewBox="0 0 120 120"
            >
                <circle
                    className="text-muted/20"
                    strokeWidth="10"
                    stroke="currentColor"
                    fill="transparent"
                    r={radius}
                    cx="60"
                    cy="60"
                />
                <circle
                    className={cn(
                        "transition-all duration-300",
                        needsCheckup ? "text-red-500" : "text-primary"
                    )}
                    strokeWidth="10"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="transparent"
                    r={radius}
                    cx="60"
                    cy="60"
                    transform="rotate(-90 60 60)"
                />
            </svg>
            <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center">
                {children}
            </div>
        </div>
    );
};

export default CircularProgress;
