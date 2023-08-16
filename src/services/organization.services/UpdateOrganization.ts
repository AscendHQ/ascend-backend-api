import { UpdateQuery } from "mongoose";
import OrganizationModel from "../../models/organization";
import { IOrganization } from "../../interface";

export const UpdateOrganization = async (
  organization_id: string,
  update: UpdateQuery<IOrganization>
) => {
  const organization = await OrganizationModel.findByIdAndUpdate(
    organization_id,
    update,
    { new: true }
  );

  return organization;
};
