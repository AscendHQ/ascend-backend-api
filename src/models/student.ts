import { model, Schema } from "mongoose";
import { EGender, IStudent, IStudentDocument } from "../interface";

const studentSchemaFields: Record<keyof IStudent, any> = {
  registration_number: { type: String, required: true, unique: true },
  organization: {
    type: Schema.Types.ObjectId,
    ref: "organization",
    required: true,
  },
  personal_information: {
    first_name: { type: String, required: true },
    middle_name: { type: String },
    last_name: { type: String, required: true },
    gender: { type: String, enum: EGender },
    dob: { type: Date },
    religion: { type: String },
    nationality: { type: String },
  },
  contact_information: {
    residential_address: { type: String },
    contact_number: { type: String },
  },
  guardian_information: {
    first_name: { type: String },
    last_name: { type: String },
    relationship_with_student: { type: String },
    contact_number: { type: String },
    email: { type: String },
  },
  academic_details: {
    class: { type: Schema.Types.ObjectId, ref: "class" },
    previous_school: { type: String },
  },
  accommodation: {
    block: { type: String },
    room: { type: String },
  },
  medical_information: {
    allergies: { type: String },
    emergency_contact: { type: String },
    medication: { type: String },
  },
  additional_information: {
    disabilities: { type: String },
    nature_of_disability: { type: String },
    medication: { type: String },
  },
  is_active: { type: Boolean, default: true },
  is_deleted: { type: Boolean, default: false },
  is_registered: { type: Boolean, default: false },
};

const studentSchema = new Schema(studentSchemaFields, {
  timestamps: true,
});

const StudentModel = model<IStudentDocument>("student", studentSchema);
export default StudentModel;
