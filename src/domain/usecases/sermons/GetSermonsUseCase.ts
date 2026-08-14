// ==============================
// 3️⃣ طبقة Domain — Use Case
// قاعدة عمل: جلب بيانات مكتبة الخطب (المؤرشفة، المعلقة، الاعتمادات)
// ==============================

import { Sermon, SermonSelection } from "../../entities/Sermon";
import { ISermonRepository } from "../../repositories/ISermonRepository";

export interface SermonsPageData {
  archived: Sermon[];
  pending: Sermon[];
  upcomingSelection: SermonSelection | null;
  selectionsHistory: SermonSelection[];
}

export class GetSermonsUseCase {
  constructor(private sermonRepository: ISermonRepository) {}

  async execute(): Promise<SermonsPageData> {
    const [archived, pending, upcomingSelection, selectionsHistory] = await Promise.all([
      this.sermonRepository.getArchivedSermons(),
      this.sermonRepository.getPendingSermons(),
      this.sermonRepository.getUpcomingSermonSelection(),
      this.sermonRepository.getSermonSelections(),
    ]);

    // Fallback: إذا لم تُعد خطب مؤرشفة، نجلب الكل
    let finalArchived = archived;
    if (finalArchived.length === 0) {
      finalArchived = await this.sermonRepository.getSermons();
    }

    // ربط بيانات الخطبة بالاعتماد القادم
    let resolvedUpcoming = upcomingSelection;
    if (resolvedUpcoming && !resolvedUpcoming.sermon) {
      const matched = finalArchived.find(s => String(s.id) === String(resolvedUpcoming!.sermon_id));
      if (matched) resolvedUpcoming = { ...resolvedUpcoming, sermon: matched };
    }

    return {
      archived: finalArchived,
      pending,
      upcomingSelection: resolvedUpcoming,
      selectionsHistory,
    };
  }
}
