import React from "react";
import { Calendar, Eye, Edit, Download, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TemplateResponse } from "../types/template.type";

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

export const getRelativeTime = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInDays === 0) return "Hôm nay";
  if (diffInDays === 1) return "Hôm qua";
  if (diffInDays < 7) return `${diffInDays} ngày trước`;
  if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} tuần trước`;
  if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} tháng trước`;
  return `${Math.floor(diffInDays / 365)} năm trước`;
};

interface TemplateCardProps {
  template: TemplateResponse;
  onClick: () => void;
  onEdit?: () => void;
  onDownload?: () => void;
  onDelete?: () => void;
}

export const TemplateCard: React.FC<TemplateCardProps> = ({ template, onClick, onEdit, onDownload, onDelete }) => {
  return (
    <Card
      className="group cursor-pointer hover:shadow-xl hover:shadow-slate-200/50 transition-all overflow-hidden border-slate-200"
      onClick={onClick}
    >
      <div className="relative aspect-video bg-slate-100 overflow-hidden">
        <img
          alt={template.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          src={template.thumbnailUrl || "https://via.placeholder.com/800x450?text=No+Image"}
        />
        <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
          {onEdit && (
            <Button
              size="icon"
              variant="secondary"
              className="w-10 h-10 rounded-full bg-white/90 hover:bg-blue-600 hover:text-white backdrop-blur-sm shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-all duration-300"
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
            >
              <Edit className="w-4 h-4" />
            </Button>
          )}
          {onDownload && (
            <Button
              size="icon"
              variant="secondary"
              className="w-10 h-10 rounded-full bg-white/90 hover:bg-blue-600 hover:text-white backdrop-blur-sm shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-all duration-300 delay-75"
              onClick={(e) => {
                e.stopPropagation();
                onDownload();
              }}
            >
              <Download className="w-4 h-4" />
            </Button>
          )}
          {onDelete && (
            <Button
              size="icon"
              variant="secondary"
              className="w-10 h-10 rounded-full bg-white/90 hover:bg-red-500 hover:text-white backdrop-blur-sm shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-all duration-300 delay-150"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
      <CardContent className="p-5">
        <h3 className="font-semibold text-base mb-1 text-slate-900">{template.name}</h3>
        <p className="text-sm text-slate-500 line-clamp-2 mb-4">{template.description || "Không có mô tả"}</p>
        <div className="flex items-center justify-between text-[11px] font-medium text-slate-400 uppercase tracking-wider border-t border-slate-100 pt-4">
          <span className="flex items-center gap-1" title={formatDate(template.createdAt)}>
            <Calendar className="w-3.5 h-3.5" />
            {getRelativeTime(template.createdAt)}
          </span>
          <span className="flex items-center gap-1">
            <Eye className="w-3.5 h-3.5" />
            ID: {template.id}
          </span>
        </div>
      </CardContent>
    </Card>
  );
};
