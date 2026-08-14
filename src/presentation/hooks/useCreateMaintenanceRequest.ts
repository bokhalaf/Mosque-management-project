// ==============================
// Presentation — Hook
// useCreateMaintenanceRequest: إدارة نموذج إنشاء طلب صيانة جديد
// ==============================

import { useState, useRef, useCallback } from 'react';
import { MaintenanceRepositoryImpl, MaintenanceOperationDebugResponse } from '../../data/repositories/MaintenanceRepositoryImpl';
import { CreateMaintenanceRequestUseCase } from '../../domain/usecases/maintenance/CreateMaintenanceRequestUseCase';

const maintenanceRepo = new MaintenanceRepositoryImpl();
const createMaintenanceUseCase = new CreateMaintenanceRequestUseCase(maintenanceRepo);

export function useCreateMaintenanceRequest(onSuccess: () => void) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('electrical');
  const [priority, setPriority] = useState('medium');
  const [description, setDescription] = useState('');
  const [notes, setNotes] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Debug inspector state
  const [debugResponse, setDebugResponse] = useState<MaintenanceOperationDebugResponse | null>(null);
  const [copiedDebug, setCopiedDebug] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      setSelectedFiles(prev => [...prev, ...newFiles]);
    }
  }, []);

  const removeFile = useCallback((index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  }, []);

  const formatFileSize = useCallback((bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }, []);

  const copyDebugJson = useCallback(() => {
    if (debugResponse) {
      navigator.clipboard.writeText(JSON.stringify(debugResponse.rawResponse, null, 2));
      setCopiedDebug(true);
      setTimeout(() => setCopiedDebug(false), 2000);
    }
  }, [debugResponse]);

  const handleSubmit = useCallback(async () => {
    if (!title.trim()) {
      setError('يرجى كتابة عنوان مختصر ومحدد للطلب.');
      return;
    }
    if (!description.trim()) {
      setError('يرجى كتابة وصف مفصل للمشكلة لمساعدة الفني.');
      return;
    }

    setSubmitting(true);
    setError(null);
    setDebugResponse(null);

    try {
      const resDebug = await maintenanceRepo.createMaintenanceRequestWithDebug({
        title: title.trim(),
        category,
        priority,
        description: description.trim(),
        notes: notes.trim() || undefined,
        files: selectedFiles.length > 0 ? selectedFiles : undefined,
      });
      setDebugResponse(resDebug.debug);
    } catch (err: any) {
      console.error('Error creating maintenance request:', err);
      setError(err.message || 'حدث خطأ أثناء إرسال طلب الصيانة');
    } finally {
      setSubmitting(false);
    }
  }, [title, category, priority, description, notes, selectedFiles]);

  return {
    // Form state
    title, setTitle,
    category, setCategory,
    priority, setPriority,
    description, setDescription,
    notes, setNotes,
    selectedFiles,
    // File handling
    fileInputRef,
    handleFileChange,
    removeFile,
    formatFileSize,
    // Submit
    submitting,
    error,
    setError,
    handleSubmit,
    // Debug
    debugResponse,
    setDebugResponse,
    copiedDebug,
    copyDebugJson,
  };
}
