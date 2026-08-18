import { IVolunteerRepository } from "../../repositories/IVolunteerRepository";
import { VolunteerCertificate } from "../../entities/Volunteer";

export class IssueCertificateUseCase {
  constructor(private repository: IVolunteerRepository) {}

  async execute(volunteerId: number | string, opportunityId: number | string): Promise<VolunteerCertificate> {
    return this.repository.issueCertificate(volunteerId, opportunityId);
  }
}
