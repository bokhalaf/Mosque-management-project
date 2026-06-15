// ==============================
// 3️⃣ طبقة Domain — Use Case
// قاعدة عمل: "كيف تتم عملية تسجيل الدخول؟"
// ==============================

import { LoginRequest, LoginResponse } from "../entities/Auth";
import { IAuthRepository } from "../repositories/IAuthRepository";

export class LoginUseCase {
  constructor(private authRepository: IAuthRepository) {}

  async execute(credentials: LoginRequest): Promise<LoginResponse> {
    // يمكن إضافة أي منطق هنا (validation، logging، إلخ)
    return await this.authRepository.login(credentials);
  }
}
