// ==============================
// 2️⃣ طبقة Domain — Repository Interface
// العقد: "ماذا يجب أن يوفر مصدر البيانات؟"
// ==============================

import { LoginRequest, LoginResponse } from "../entities/Auth";

export interface IAuthRepository {
  login(credentials: LoginRequest): Promise<LoginResponse>;
  logout(): Promise<void>;
}
