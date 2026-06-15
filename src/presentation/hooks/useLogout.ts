// ==============================
// Presentation — useLogout Hook
// ==============================

import { useState, useMemo } from "react";
import { AuthRepositoryImpl } from "../../data/repositories/AuthRepositoryImpl";
import { LogoutUseCase } from "../../domain/usecases/LogoutUseCase";

export function useLogout() {
  const [loading, setLoading] = useState(false);

  const repository = useMemo(() => new AuthRepositoryImpl(), []);
  const logoutUseCase = useMemo(() => new LogoutUseCase(repository), [repository]);

  const logout = async (): Promise<void> => {
    setLoading(true);
    try {
      await logoutUseCase.execute();
    } finally {
      setLoading(false);
    }
  };

  return { logout, loading };
}
