import OrganizationModel from "../../models/organization";

export const GetOrganizationById = async (organization_id: string) => {
  const organization = await OrganizationModel.findById(organization_id);

  return organization;
};
