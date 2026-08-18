'use client';

// ==============================
// Presentation Section — CreateOpportunitySection
// صفحة إنشاء فرصة تطوعية جديدة مع مهامها المخصصة
// ==============================

import React from 'react';
import { PageHeader } from '../../../app/components/PageHeader';
import { AlertCircle } from 'lucide-react';
import { useCreateOpportunity } from '../../hooks/useCreateOpportunity';
import {
  CreateOpportunityBasicInfoCard,
  CreateOpportunityDatesCard,
  CreateOpportunityTasksCard,
  CreateOpportunitySidebar,
  CreateOpportunityFooter,
} from './components/create/index';

export function CreateOpportunitySection() {
  const {
    form,
    tasks,
    newTaskInput,
    setNewTaskInput,
    submitting,
    error,
    handleFieldChange,
    handleAddTask,
    handleRemoveTask,
    handleUpdateTask,
    handleSubmit,
    router,
  } = useCreateOpportunity();

  return (
    <div className="flex flex-col min-h-screen bg-transparent font-['Cairo'] pb-16">
      <PageHeader
        title="طرح فرصة تطوعية جديدة"
        description="أدخل تفاصيل الفرصة التطوعية بالمسجد، الإطار الزمني، وقم بإضافة المهام التفصيلية المخصصة لها."
        breadcrumbs={[
          { label: 'إدارة المسجد' },
          { label: 'إدارة المتطوعين' },
          { label: 'طرح فرصة تطوعية', active: true },
        ]}
        onBack={() => router.push('/volunteers')}
      />

      <form onSubmit={handleSubmit} className="px-4 md:px-8 max-w-7xl w-full mx-auto space-y-6">
        {error && (
          <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-xs text-rose-600 flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span className="font-bold">{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form (Left 2 Columns) */}
          <div className="lg:col-span-2 space-y-6">
            <CreateOpportunityBasicInfoCard
              form={form}
              onChange={handleFieldChange}
            />

            <CreateOpportunityDatesCard
              form={form}
              onChange={handleFieldChange}
            />

            <CreateOpportunityTasksCard
              tasks={tasks}
              newTaskInput={newTaskInput}
              onNewTaskInputChange={setNewTaskInput}
              onAddTask={handleAddTask}
              onRemoveTask={handleRemoveTask}
              onUpdateTask={handleUpdateTask}
            />

            <CreateOpportunityFooter
              submitting={submitting}
              onCancel={() => router.push('/volunteers')}
            />
          </div>

          {/* Sidebar (Right 1 Column) */}
          <div className="lg:col-span-1">
            <div className="sticky top-6">
              <CreateOpportunitySidebar
                form={form}
                tasksCount={tasks.length}
              />
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
