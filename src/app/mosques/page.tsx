'use client';

import React, { useState } from 'react';
import { 
  MosquesListSection, 
  CreateMosqueSection, 
  MosqueDetailsSection, 
  EditMosqueSection 
} from "../../presentation/sections/mosques";

export default function MosquesPage() {
  const [view, setView] = useState<'list' | 'create' | 'details' | 'edit'>('list');
  const [selectedId, setSelectedId] = useState<string | number | null>(null);

  if (view === 'create') {
    return <CreateMosqueSection onBack={() => setView('list')} />;
  }

  if (view === 'details' && selectedId) {
    return (
      <MosqueDetailsSection
        mosqueId={selectedId}
        onBack={() => setView('list')}
        onNavigateToEdit={(id) => {
          setSelectedId(id);
          setView('edit');
        }}
        onDeleteSuccess={() => {
          setSelectedId(null);
          setView('list');
        }}
      />
    );
  }

  if (view === 'edit' && selectedId) {
    return (
      <EditMosqueSection
        mosqueId={selectedId}
        onBack={() => setView('details')}
        onSaveSuccess={() => setView('details')}
      />
    );
  }

  return (
    <MosquesListSection
      onNavigateToAdd={() => setView('create')}
      onViewDetails={(id) => {
        setSelectedId(id);
        setView('details');
      }}
      onNavigateToEdit={(id) => {
        setSelectedId(id);
        setView('edit');
      }}
    />
  );
}
