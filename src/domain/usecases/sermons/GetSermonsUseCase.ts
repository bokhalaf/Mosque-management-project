// ==============================
// 3️⃣ طبقة Domain — Use Case
// قاعدة عمل: جلب بيانات مكتبة الخطب (المؤرشفة 6 بالصفحة، المعلقة 3 بالصفحة، والاعتمادات)
// ==============================

import { PaginatedSermons, SermonSelection } from "../../entities/Sermon";
import { ISermonRepository } from "../../repositories/ISermonRepository";

export interface SermonsPageData {
  archivedRes: PaginatedSermons;
  pendingRes: PaginatedSermons;
  upcomingSelection: SermonSelection | null;
  selectionsHistory: SermonSelection[];
}

export class GetSermonsUseCase {
  constructor(private sermonRepository: ISermonRepository) {}

  async execute(
    archivedPage: number = 1,
    pendingPage: number = 1,
    archivedLimit: number = 6,
    pendingLimit: number = 3
  ): Promise<SermonsPageData> {
    const [archivedRes, pendingRes, upcomingSelection, selectionsHistory] = await Promise.all([
      this.sermonRepository.getArchivedSermons(archivedPage, archivedLimit),
      this.sermonRepository.getPendingSermons(pendingPage, pendingLimit),
      this.sermonRepository.getUpcomingSermonSelection(),
      this.sermonRepository.getSermonSelections(),
    ]);

    let finalArchivedRes = archivedRes;
    if (finalArchivedRes.data.length === 0) {
      finalArchivedRes = await this.sermonRepository.getSermons(archivedPage, archivedLimit);
    }

    let resolvedUpcoming = upcomingSelection;
    if (resolvedUpcoming && !resolvedUpcoming.sermon) {
      const matched = finalArchivedRes.data.find(s => String(s.id) === String(resolvedUpcoming!.sermon_id));
      if (matched) resolvedUpcoming = { ...resolvedUpcoming, sermon: matched };
    }

    return {
      archivedRes: finalArchivedRes,
      pendingRes,
      upcomingSelection: resolvedUpcoming,
      selectionsHistory,
    };
  }
}
