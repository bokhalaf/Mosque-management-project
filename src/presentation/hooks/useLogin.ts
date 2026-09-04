// ==============================
// Presentation — useLogin Hook
// ==============================

import { useState, useMemo } from "react";
import { AuthUser, LoginRequest, LoginResponse } from "../../domain/entities/Auth";
import { getAuthRepository } from "../../data/factories/repositoryFactory";
import { LoginUseCase } from "../../domain/usecases/LoginUseCase";

export function useLogin() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);

  const repository = useMemo(() => getAuthRepository(), []);
  const loginUseCase = useMemo(() => new LoginUseCase(repository), [repository]);

  // يُعيد LoginResponse عند النجاح أو null عند الفشل
  const login = async (credentials: LoginRequest): Promise<LoginResponse | null> => {
    setLoading(true);
    setError(null);

    try {
      const result = await loginUseCase.execute(credentials);
      setUser(result.user);
      return result;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "حدث خطأ غير متوقع";
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { login, loading, error, user };
}
