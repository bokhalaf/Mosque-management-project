'use client';
import React, { useState } from 'react';
import { KhutbahsListSection } from "../../presentation/sections/KhutbahsListSection";
import { CreateKhutbahSection } from "../../presentation/sections/CreateKhutbahSection";

export default function SermonsPage() {
  const [view, setView] = useState<'list' | 'create'>('list');

  if (view === 'create') {
    return <CreateKhutbahSection onBack={() => setView('list')} />;
  }

  return <KhutbahsListSection onNavigateToAdd={() => setView('create')} />;
}
