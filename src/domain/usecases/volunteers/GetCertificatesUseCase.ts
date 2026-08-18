import { IVolunteerRepository } from "../../repositories/IVolunteerRepository";
import { VolunteerCertificate } from "../../entities/Volunteer";

export class GetCertificatesUseCase {
  constructor(private repository: IVolunteerRepository) {}

  async execute(): Promise<VolunteerCertificate[]> {
    return this.repository.getCertificates();
  }
}
