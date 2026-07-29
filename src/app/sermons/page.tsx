'use client';
import React, { useState } from 'react';
import { KhutbahsListSection } from "../../presentation/sections/KhutbahsListSection";
import { CreateKhutbahSection } from "../../presentation/sections/CreateKhutbahSection";
import { SermonDetailsSection } from "../../presentation/sections/SermonDetailsSection";

export default function SermonsPage() {
  const [view, setView] = useState<'list' | 'create' | 'details'>('list');
  const [selectedId, setSelectedId] = useState<string | number | null>(null);

  if (view === 'create') {
    return <CreateKhutbahSection onBack={() => setView('list')} />;
  }

  if (view === 'details' && selectedId) {
    return (
      <SermonDetailsSection 
        sermonId={selectedId} 
        onBack={() => setView('list')} 
        onSelectForFriday={() => setView('list')}
      />
    );
  }

  return (
    <KhutbahsListSection 
      onNavigateToAdd={() => setView('create')} 
      onViewDetails={(id) => {
        setSelectedId(id);
        setView('details');
      }}
    />
  );
}
