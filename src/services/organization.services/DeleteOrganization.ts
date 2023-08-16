import OrganizationModel from "../../models/organization";

export const DeleteOrganization = async (organization_id: string) => {
  const organization = await OrganizationModel.findByIdAndDelete(
    organization_id
  );

  return organization;
};
