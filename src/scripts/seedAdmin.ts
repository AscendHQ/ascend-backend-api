/**
 * One-time bootstrap script for a fresh database.
 *
 * Normal signup (POST /auth/organizations) requires you to already be
 * logged in as an admin - which is impossible on a brand new database
 * with zero accounts. This script creates the first organization,
 * permission set, and admin account directly, bypassing that chicken-
 * and-egg problem.
 *
 * Usage:
 *   npx ts-node src/scripts/seedAdmin.ts \
 *     --school "Your School Name" \
 *     --email admin@example.com \
 *     --password "SomeStrongPassword123" \
 *     --first-name Jane \
 *     --last-name Doe
 *
 * Run this once against your production database, log in with the
 * email/password you chose, then you can use the normal in-app signup
 * flow (as this admin) to onboard every other school going forward.
 */

import { hash } from "bcryptjs";
import mongoose from "mongoose";
import { connect } from "mongoose";
import { config } from "../config/env";
import { ESystemAccessLevel } from "../interface";
import AccountModel from "../models/account";
import { CreateOrganization } from "../services/organization.services";
import { CreatePermission } from "../services/permission.services";

function getArg(flag: string): string | undefined {
  const index = process.argv.indexOf(flag);
  return index !== -1 ? process.argv[index + 1] : undefined;
}

async function main() {
  const schoolName = getArg("--school");
  const email = getArg("--email")?.toLowerCase();
  const password = getArg("--password");
  const firstName = getArg("--first-name") ?? "Admin";
  const lastName = getArg("--last-name") ?? "User";

  if (!schoolName || !email || !password) {
    console.error(
      "Missing required args. Example:\n" +
        '  npx ts-node src/scripts/seedAdmin.ts --school "My School" --email admin@example.com --password "StrongPass123"'
    );
    process.exit(1);
  }

  mongoose.set("strictQuery", false);
  await connect(config.MONGODB_URL);
  console.log("Connected to database.");

  const existing = await AccountModel.findOne({ email });
  if (existing) {
    console.error(`An account with ${email} already exists. Aborting.`);
    process.exit(1);
  }

  const organization = await CreateOrganization({ name: schoolName });
  console.log(`Created organization: ${organization.name} (${organization._id})`);

  const fullAccess = { create: true, view: true, edit: true, delete: true };
  const permission = await CreatePermission({
    organization: organization._id,
    name: "Admin",
    description: "Full access to every module. Assigned to the school's primary account.",
    dashboard: fullAccess,
    staff: fullAccess,
    students: fullAccess,
    subjects: fullAccess,
    classes: fullAccess,
    teachers: fullAccess,
    hostels: fullAccess,
    lesson_plan: fullAccess,
    time_table: fullAccess,
    results: fullAccess,
    administration: fullAccess,
    payroll: fullAccess,
    roles: fullAccess,
  });
  console.log(`Created permission set: ${permission._id}`);

  const hashedPassword = await hash(password, 10);

  const account = await AccountModel.create({
    first_name: firstName,
    last_name: lastName,
    email,
    password: hashedPassword,
    organization: organization._id,
    permission: permission._id,
    access_level: ESystemAccessLevel.DELETE_ADMIN,
    is_email_verified: true,
    is_verified: true,
  });
  console.log(`Created account: ${account.email} (${account._id})`);

  console.log("\nDone. Log in with:");
  console.log(`  email:    ${email}`);
  console.log(`  password: (the one you passed in --password)`);

  await mongoose.disconnect();
  process.exit(0);
}

main().catch(error => {
  console.error("Seed script failed:", error);
  process.exit(1);
});
