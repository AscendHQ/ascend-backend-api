import { model, Schema } from "mongoose";
import { EGender, IStudent, IStudentDocument } from "../interface";

const studentSchemaFields: Record<keyof IStudent, any> = {
  registration_number: { type: String, required: true, unique: true },
  organization: {
    type: Schema.Types.ObjectId,
    ref: "organization",
    required: true,
  },
  hostel: {
    hostel_id: { type: Schema.Types.ObjectId, ref: "hostel" },
    block: { type: String },
    room: { type: String },
  },
  personal_information: {
    first_name: { type: String, required: true },
    last_name: { type: String, required: true },
    gender: { type: String, enum: EGender },
    dob: { type: Date },
    religion: { type: String },
    nationality: { type: String },
    address: {
      home_address: { type: String },
      state_of_origin: { type: String },
      local_government_area: { type: String },
    },
  },
  academic_details: {
    class: { type: Schema.Types.ObjectId, ref: "class" },
    previous_school: { type: String },
    enrollment_year: { type: String },
    graduation_year: { type: String },
    awards: [{ type: String }],
    leadership_role: { type: String },
    extra_curricular: [{ type: String }],
  },
  lesson_offering: [{ type: Schema.Types.ObjectId, ref: "lesson" }],
  contact_information: {
    residential_address: { type: String },
    phone_number: { type: String },
    guardian_name: { type: String },
    email: { type: String },
  },
  guardian_information: {
    first_name: { type: String },
    last_name: { type: String },
    relationship_to_student: { type: String },
    phone_number: { type: String },
    email: { type: String },
  },
  medical_information: {
    blood_group: { type: String },
    allergies: { type: String },
    medication: { type: String },
    emergency_contact: { type: String },
  },
  additional_information: {
    previous_school: [{ type: String }],
    disabilities: { type: String },
    medication: { type: String },
    nature_of_disability: { type: String },
  },
  is_active: { type: Boolean, default: true },
};

const studentSchema = new Schema(studentSchemaFields, {
  timestamps: true,
});

const StudentModel = model<IStudentDocument>("student", studentSchema);
export default StudentModel;
