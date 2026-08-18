'use client';

// ==============================
// Dawah Programs — CreateDawahProgramSection Component (Clean & Modular)
// ==============================

import React from 'react';
import { PageHeader } from "../../../app/components/PageHeader";
import { ArrowRight } from "lucide-react";
import { useCreateDawahProgram } from "../../hooks/useCreateDawahProgram";
import {
  CreateProgramBasicInfoCard,
  CreateProgramSchedulesCard,
  CreateProgramSidebar,
  CreateProgramFooter,
} from "./components";

interface CreateDawahProgramSectionProps {
  onBack: () => void;
}

export function CreateDawahProgramSection({ onBack }: CreateDawahProgramSectionProps) {
  const {
    formData,
    setFormData,
    spaces,
    schedules,
    handleAddSchedule,
    handleRemoveSchedule,
    handleUpdateSchedule,
    isSubmitting,
    handleSubmit,
  } = useCreateDawahProgram(onBack);

  return (
    <div className="flex flex-col min-h-screen bg-transparent font-['Cairo'] pb-16">
      <PageHeader
        title="إضافة برنامج دعوي جديد"
        description="إنشاء دورة علمية، محاضرة، أو مسابقة مع جدولة الجلسات وتحديد مكان الانعقاد بالمسجد."
        onBack={onBack}
        breadcrumbs={[
          { label: 'إدارة المسجد' },
          { label: 'البرامج الدعوية' },
          { label: 'إضافة برنامج جديد', active: true },
        ]}
        actions={
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-2 px-4 py-2 bg-card border border-border text-foreground hover:bg-muted rounded-xl text-xs font-bold transition-all shadow-sm"
          >
            <ArrowRight className="w-4 h-4" />
            <span>العودة للقائمة</span>
          </button>
        }
      />

      <form onSubmit={handleSubmit} className="max-w-6xl mx-auto px-4 md:px-8 w-full mt-2">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Column */}
          <div className="lg:col-span-2 space-y-6">
            <CreateProgramBasicInfoCard
              formData={formData}
              setFormData={setFormData}
              spaces={spaces}
            />

            <CreateProgramSchedulesCard
              schedules={schedules}
              onAddSchedule={handleAddSchedule}
              onRemoveSchedule={handleRemoveSchedule}
              onUpdateSchedule={handleUpdateSchedule}
            />
          </div>

          {/* Sidebar Column */}
          <CreateProgramSidebar
            formData={formData}
            setFormData={setFormData}
          />
        </div>

        {/* Footer Actions */}
        <CreateProgramFooter
          onBack={onBack}
          isSubmitting={isSubmitting}
        />
      </form>
    </div>
  );
}
