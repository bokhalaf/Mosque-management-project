// ==============================
// 3️⃣ طبقة Domain — Use Case
// قاعدة عمل: اعتماد خطبة للجمعة القادمة أو إلغاء اعتمادها
// ==============================

import { Sermon, SermonSelection } from "../../entities/Sermon";
import { ISermonRepository } from "../../repositories/ISermonRepository";

export class SelectFridaySermonUseCase {
  constructor(private sermonRepository: ISermonRepository) {}

  async select(sermon: Sermon): Promise<SermonSelection> {
    const todayStr = new Date().toISOString().split('T')[0];
    const payload = {
      sermon_id: sermon.id,
      selection_date: todayStr,
      notes: `تم اعتماد خطبة "${sermon.title}" رسمياً يوم الجمعة`,
    };
    const newSelection = await this.sermonRepository.storeSermonSelection(payload);
    return { ...newSelection, sermon };
  }

  async cancel(selectionId: string | number): Promise<void> {
    return await this.sermonRepository.deleteSermonSelection(selectionId);
  }
}
