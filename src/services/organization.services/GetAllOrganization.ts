import OrganizationModel from "../../models/organization";
import { ICustomInterface } from "../../interface";

export const GetAllOrganization = async (
  query: ICustomInterface,
  options: ICustomInterface
) => {
  const { limit, page } = options;

  const organizations = await OrganizationModel.find(query)
    .limit(limit)
    .skip((page - 1) * limit)
    .exec();

  const total_documents = await OrganizationModel.countDocuments(query);

  return {
    limit,
    page,
    organizations,
    total_documents,
  };
};
