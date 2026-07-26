/**
 * TEMPORARY route for bootstrapping the first admin account on a fresh
 * database when you don't have terminal/Shell access (e.g. Render free
 * tier). Does exactly what scripts/seedAdmin.ts does, but as a page you
 * can visit in a browser.
 *
 * SECURITY: gated by BOOTSTRAP_SECRET so a stranger can't hit this and
 * create their own admin account. Remove this whole file and its one
 * line in app.ts once you've used it - don't leave it live long-term.
 *
 * Visit (all on one line):
 *   https://your-backend-url.onrender.com/bootstrap-admin
 *     ?secret=YOUR_BOOTSTRAP_SECRET
 *     &school=Your+School+Name
 *     &email=you@example.com
 *     &password=SomeStrongPassword123
 *     &first_name=Jane
 *     &last_name=Doe
 */

import { Router, Request, Response } from "express";
import { hash } from "bcryptjs";
import { ESystemAccessLevel } from "../interface";
import AccountModel from "../models/account";
import { CreateOrganization } from "../services/organization.services";
import { CreatePermission } from "../services/permission.services";

const router = Router();

router.get("/", async (req: Request, res: Response) => {
  try {
    const { secret, school, email, password, first_name, last_name } =
      req.query as Record<string, string>;

    if (!process.env.BOOTSTRAP_SECRET) {
      return res
        .status(500)
        .send("BOOTSTRAP_SECRET is not set on the server. Add it as an environment variable first.");
    }

    if (!secret || secret !== process.env.BOOTSTRAP_SECRET) {
      return res.status(403).send("Invalid or missing secret.");
    }

    if (!school || !email || !password) {
      return res
        .status(400)
        .send("Missing required query params: school, email, password.");
    }

    const normalizedEmail = email.toLowerCase();

    const existing = await AccountModel.findOne({ email: normalizedEmail });
    if (existing) {
      return res
        .status(409)
        .send(`An account with ${normalizedEmail} already exists. Nothing was created.`);
    }

    const organization = await CreateOrganization({ name: school });

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

    const hashedPassword = await hash(password, 10);

    const account = await AccountModel.create({
      first_name: first_name ?? "Admin",
      last_name: last_name ?? "User",
      email: normalizedEmail,
      password: hashedPassword,
      organization: organization._id,
      permission: permission._id,
      access_level: ESystemAccessLevel.DELETE_ADMIN,
      is_email_verified: true,
      is_verified: true,
    });

    return res.send(
      `Success! Organization "${organization.name}" and account "${account.email}" were created.\n\n` +
        `Log in at your frontend's /auth/login page with:\n` +
        `  email: ${account.email}\n` +
        `  password: (the one you put in the URL)\n\n` +
        `Now go remove this bootstrap route and redeploy - it should not stay live.`
    );
  } catch (error: any) {
    return res.status(500).send(`Error: ${error.message}`);
  }
});

export default router;
