// ==============================
// 3️⃣ طبقة Domain — Use Case
// قاعدة عمل: جلب قائمة المساجد مع الفلاتر والصفحات (mosques.index)
// ==============================

import { IMosqueRepository, MosqueFilterOptions, PaginatedMosques } from "../../repositories/IMosqueRepository";

export class GetMosquesUseCase {
  constructor(private mosqueRepository: IMosqueRepository) {}

  execute(optionsOrPage?: MosqueFilterOptions | number, limit?: number): Promise<PaginatedMosques> {
    return this.mosqueRepository.getMosques(optionsOrPage, limit);
  }
}
