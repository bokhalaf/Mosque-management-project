import React from 'react';
import { ArrowRight, ChevronLeft } from "lucide-react";

interface PageHeaderProps {
  title: string;
  description?: string;
  breadcrumbs?: { label: string; active?: boolean }[];
  onBack?: () => void;
  actions?: React.ReactNode;
}

export function PageHeader({ title, description, breadcrumbs, onBack, actions }: PageHeaderProps) {
  return (
    <div className="px-4 md:px-8 py-6 space-y-4">
      {breadcrumbs && (
        <nav className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">
          {breadcrumbs.map((crumb, idx) => (
            <React.Fragment key={crumb.label}>
              <span className={crumb.active ? "text-primary" : ""}>{crumb.label}</span>
              {idx < breadcrumbs.length - 1 && <ChevronLeft className="w-3 h-3" />}
            </React.Fragment>
          ))}
        </nav>
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          {onBack && (
            <button 
              onClick={onBack}
              className="p-3 bg-card border border-border text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-2xl transition-all shadow-sm active:scale-95"
            >
              <ArrowRight className="w-5 h-5" />
            </button>
          )}
          <div>
            <h1 className="text-3xl font-black text-foreground tracking-tight">{title}</h1>
            {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
          </div>
        </div>
        
        {actions && (
          <div className="flex items-center flex-wrap gap-3">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}
