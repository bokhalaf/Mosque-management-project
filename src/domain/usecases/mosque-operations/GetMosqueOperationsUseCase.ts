import { IMosqueOperationRepository, GetMosqueOperationsParams, MosqueOperationsResult } from "../../repositories/IMosqueOperationRepository";

export class GetMosqueOperationsUseCase {
  constructor(private mosqueOperationRepository: IMosqueOperationRepository) {}

  async execute(params: GetMosqueOperationsParams): Promise<MosqueOperationsResult> {
    return await this.mosqueOperationRepository.getMosqueOperations(params);
  }
}
