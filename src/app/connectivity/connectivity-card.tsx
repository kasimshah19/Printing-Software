import { ReactNode } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export type CapabilityStatus = 
  | "available"
  | "unavailable"
  | "unsupported"
  | "not-configured"
  | "permission-required"
  | "offline"
  | "error";

interface ConnectivityCardProps {
  title: string;
  icon: ReactNode;
  status: CapabilityStatus;
  statusLabel: string;
  description: string;
  metric?: string;
  actionLabel: string;
  onAction: () => void;
}

export function ConnectivityCard({
  title,
  icon,
  status,
  statusLabel,
  description,
  metric,
  actionLabel,
  onAction
}: ConnectivityCardProps) {
  
  const getStatusBadge = () => {
    switch (status) {
      case "available":
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">{statusLabel}</span>;
      case "error":
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">{statusLabel}</span>;
      case "unsupported":
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">{statusLabel}</span>;
      case "not-configured":
      case "permission-required":
      case "offline":
      case "unavailable":
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">{statusLabel}</span>;
      default:
        return null;
    }
  };

  return (
    <Card className="flex flex-col border-slate-200 shadow-sm transition-all hover:shadow-md">
      <CardHeader className="pb-3 border-b border-slate-100 bg-slate-50/50">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-white p-2 shadow-sm border border-slate-100">
              {icon}
            </div>
            <CardTitle className="text-lg">{title}</CardTitle>
          </div>
          {getStatusBadge()}
        </div>
      </CardHeader>
      <CardContent className="pt-4 flex-1">
        <p className="text-sm text-slate-600 mb-4">{description}</p>
        {metric && (
          <p className="text-sm font-semibold text-slate-900">{metric}</p>
        )}
      </CardContent>
      <CardFooter className="pt-2 border-t border-slate-100 bg-slate-50/30 flex justify-end">
        <Button onClick={onAction} variant={status === "available" ? "default" : "outline"}>
          {actionLabel}
        </Button>
      </CardFooter>
    </Card>
  );
}
