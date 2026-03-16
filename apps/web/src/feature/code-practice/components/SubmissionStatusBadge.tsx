import React from "react";
import { Badge } from "@workspace/ui/components/Badge";
import { SubmissionStatus } from "../types/coding.type";
import { cn } from "@workspace/ui/lib/utils";
import { CheckCircle, XCircle, Clock, AlertCircle, Code, Zap } from "lucide-react";

interface SubmissionStatusBadgeProps {
  status: SubmissionStatus;
  className?: string;
  showIcon?: boolean;
}

export const SubmissionStatusBadge: React.FC<SubmissionStatusBadgeProps> = ({
  status,
  className,
  showIcon = false,
}) => {
  const getConfig = () => {
    switch (status) {
      case SubmissionStatus.ACCEPTED:
        return {
          label: "Accepted",
          className: "bg-green-100 text-green-700 border-green-200",
          icon: CheckCircle,
        };
      case SubmissionStatus.WRONG_ANSWER:
        return {
          label: "Wrong Answer",
          className: "bg-red-100 text-red-700 border-red-200",
          icon: XCircle,
        };
      case SubmissionStatus.TIME_LIMIT_EXCEEDED:
        return {
          label: "Time Limit",
          className: "bg-orange-100 text-orange-700 border-orange-200",
          icon: Clock,
        };
      case SubmissionStatus.RUNTIME_ERROR:
        return {
          label: "Runtime Error",
          className: "bg-red-100 text-red-700 border-red-200",
          icon: AlertCircle,
        };
      case SubmissionStatus.COMPILE_ERROR:
        return {
          label: "Compile Error",
          className: "bg-red-100 text-red-700 border-red-200",
          icon: Code,
        };
      case SubmissionStatus.PENDING:
        return {
          label: "Pending",
          className: "bg-gray-100 text-gray-700 border-gray-200",
          icon: Clock,
        };
      case SubmissionStatus.RUNNING:
        return {
          label: "Running",
          className: "bg-blue-100 text-blue-700 border-blue-200",
          icon: Zap,
        };
      default:
        return {
          label: status,
          className: "bg-gray-100 text-gray-700 border-gray-200",
          icon: Clock,
        };
    }
  };

  const config = getConfig();
  const Icon = config.icon;

  return (
    <Badge variant="outline" className={cn("font-medium border", config.className, className)}>
      {showIcon && <Icon className="w-3 h-3 mr-1" />}
      {config.label}
    </Badge>
  );
};
