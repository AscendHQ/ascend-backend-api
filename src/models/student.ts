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
    state_of_origin: { type: String },
    local_government_area: { type: String },
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
    current_session: { type: String },
    current_term: { type: String },
    progression_history: [
      {
        from_session: { type: String, required: true },
        from_term: { type: String, required: true },
        from_class: {
          type: Schema.Types.ObjectId,
          ref: "class",
          required: true,
        },
        to_session: { type: String, required: true },
        to_term: { type: String, required: true },
        to_class: { type: Schema.Types.ObjectId, ref: "class" },
        decision: {
          type: String,
          enum: ["advanced", "promoted", "repeated", "graduated"],
          required: true,
        },
        result_average: { type: Number },
        processed_at: { type: Date, default: Date.now },
        processed_by: { type: Schema.Types.ObjectId, ref: "account" },
      },
    ],
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
};

const studentSchema = new Schema(studentSchemaFields, {
  timestamps: true,
});

const StudentModel = model<IStudentDocument>("student", studentSchema);
export default StudentModel;
