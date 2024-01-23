import ClassModel from "../../models/class";
import { IClass } from "../../interface";

export const AddClass = async (payload: IClass) => {
  const { other_section } = payload;

  if (other_section) {
    const other_section_list = other_section.split(",");
    const bulk_payload = [];

    for (let i = 0; i < other_section_list.length; i++) {
      bulk_payload.push({ ...payload, other_section: other_section_list[i] });
    }

    const new_class = await ClassModel.insertMany(bulk_payload);

    return new_class;
  }

  const new_class = await ClassModel.create(payload);

  // since the above is an array returning this as array too
  return [new_class];
};
