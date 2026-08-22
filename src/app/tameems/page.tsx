'use client';
import React, { useState } from 'react';
import { TameemsListSection, TameemDetailsSection } from "../../presentation/sections/tameems";

export default function TameemsPage() {
  const [selectedId, setSelectedId] = useState<string | number | null>(null);

  if (selectedId) {
    return (
      <TameemDetailsSection 
        tameemId={selectedId} 
        onBack={() => setSelectedId(null)} 
      />
    );
  }

  return (
    <TameemsListSection 
      onViewDetails={(id) => setSelectedId(id)}
    />
  );
}
