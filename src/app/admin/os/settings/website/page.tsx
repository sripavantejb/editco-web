export const dynamic = "force-dynamic";

import Image from "next/image";
import { requireOsPage } from "@/lib/os/page";
import { connectDB } from "@/lib/db";
import {
  ensureSiteContentSeeded,
  siteClientImageSrc,
  siteCrewImageSrc,
  siteWorkImageSrc,
} from "@/lib/site-content";
import { SiteClientLogo } from "@/models/os/SiteClientLogo";
import { SiteCrewMember } from "@/models/os/SiteCrewMember";
import { SiteWork } from "@/models/os/SiteWork";
import {
  archiveSiteClientLogo,
  archiveSiteCrewMember,
  archiveSiteWork,
  upsertSiteClientLogo,
  upsertSiteCrewMember,
  upsertSiteWork,
} from "@/actions/os/site-content";
import { OsActionForm } from "@/components/os/OsActionForm";
import { OsSlideOver } from "@/components/os/OsSlideOver";
import { RowDeleteButton } from "@/components/os/RowDeleteButton";
import { Field, OsPage, osInputClass, osTextareaClass } from "@/components/os/ui";
import { OsSelect } from "@/components/os/OsSelect";

function previewSrc(
  doc: {
    _id: { toString(): string };
    imageBase64?: string | null;
    imageUrl?: string | null;
  },
  kind: "client" | "work" | "crew"
) {
  if (doc.imageBase64) {
    if (kind === "client") return siteClientImageSrc(doc._id.toString());
    if (kind === "work") return siteWorkImageSrc(doc._id.toString());
    return siteCrewImageSrc(doc._id.toString());
  }
  return doc.imageUrl || "";
}

export default async function WebsiteSettingsPage() {
  await requireOsPage("*");
  await connectDB();
  await ensureSiteContentSeeded();

  const [clientLogos, works, crewMembers] = await Promise.all([
    SiteClientLogo.find({ recordStatus: "active" })
      .sort({ sortOrder: 1, createdAt: 1 })
      .lean(),
    SiteWork.find({ recordStatus: "active" })
      .sort({ sortOrder: 1, createdAt: 1 })
      .lean(),
    SiteCrewMember.find({ recordStatus: "active" })
      .sort({ sortOrder: 1, createdAt: 1 })
      .lean(),
  ]);

  return (
    <OsPage
      title="Website images"
      subtitle="Update Clients logos, Selected Works, and The Crew photos & portfolio links."
      backHref="/admin/os/settings"
      backLabel="Back to settings"
    >
      <section className="mb-12">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-archivo text-sm uppercase tracking-wide">
              Clients section
            </h2>
            <p className="mt-1 font-inter text-xs text-[var(--dash-muted)]">
              Logos shown in the scrolling strip under Problem.
            </p>
          </div>
          <OsSlideOver triggerLabel="Add client logo" title="Add client logo">
            <OsActionForm
              action={upsertSiteClientLogo}
              submitLabel="Add logo"
              className="grid gap-3"
            >
              <Field label="Title">
                <input name="title" required className={osInputClass()} />
              </Field>
              <Field label="Website URL (optional)">
                <input name="href" placeholder="https://" className={osInputClass()} />
              </Field>
              <Field label="Alt text">
                <input name="alt" className={osInputClass()} />
              </Field>
              <div className="grid gap-3 sm:grid-cols-3">
                <Field label="Card">
                  <OsSelect
                    name="card"
                    defaultValue="light"
                    options={[
                      { value: "light", label: "Light" },
                      { value: "dark", label: "Dark" },
                    ]}
                  />
                </Field>
                <Field label="Scale">
                  <input
                    name="scale"
                    type="number"
                    step="0.05"
                    min="0.5"
                    max="2"
                    defaultValue="1.2"
                    className={osInputClass()}
                  />
                </Field>
                <Field label="Order">
                  <input
                    name="sortOrder"
                    type="number"
                    defaultValue={clientLogos.length}
                    className={osInputClass()}
                  />
                </Field>
              </div>
              <Field label="Image file">
                <input name="image" type="file" accept="image/*" className={osInputClass()} />
              </Field>
              <Field label="Or image URL / path">
                <input
                  name="imageUrl"
                  placeholder="/clients/logo.png or https://…"
                  className={osInputClass()}
                />
              </Field>
            </OsActionForm>
          </OsSlideOver>
        </div>

        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {clientLogos.map((logo) => {
            const src = previewSrc(logo, "client");
            return (
              <li
                key={String(logo._id)}
                className="rounded-2xl border border-[var(--dash-border)] p-4"
              >
                <div className="mb-3 flex h-24 items-center justify-center overflow-hidden rounded-xl bg-[#f5f5f5]">
                  {src ? (
                    <Image
                      src={src}
                      alt={logo.alt || logo.title}
                      width={200}
                      height={96}
                      className="max-h-20 w-auto object-contain"
                      unoptimized
                    />
                  ) : (
                    <span className="font-inter text-xs text-[var(--dash-muted)]">
                      No image
                    </span>
                  )}
                </div>
                <p className="font-archivo text-sm uppercase">{logo.title}</p>
                <p className="mt-0.5 font-inter text-[11px] text-[var(--dash-muted)]">
                  Order {logo.sortOrder} · {logo.card || "light"}
                </p>
                <div className="mt-3 flex items-center gap-2">
                  <OsSlideOver
                    triggerLabel="Edit"
                    title={`Edit · ${logo.title}`}
                    triggerClassName="!h-8 !rounded-lg !px-3 !text-[12px] !normal-case"
                  >
                    <OsActionForm
                      action={upsertSiteClientLogo}
                      submitLabel="Save logo"
                      className="grid gap-3"
                    >
                      <input type="hidden" name="id" value={String(logo._id)} />
                      <Field label="Title">
                        <input
                          name="title"
                          required
                          defaultValue={logo.title}
                          className={osInputClass()}
                        />
                      </Field>
                      <Field label="Website URL">
                        <input
                          name="href"
                          defaultValue={logo.href || ""}
                          className={osInputClass()}
                        />
                      </Field>
                      <Field label="Alt text">
                        <input
                          name="alt"
                          defaultValue={logo.alt || ""}
                          className={osInputClass()}
                        />
                      </Field>
                      <div className="grid gap-3 sm:grid-cols-3">
                        <Field label="Card">
                          <OsSelect
                            name="card"
                            defaultValue={logo.card === "dark" ? "dark" : "light"}
                            options={[
                              { value: "light", label: "Light" },
                              { value: "dark", label: "Dark" },
                            ]}
                          />
                        </Field>
                        <Field label="Scale">
                          <input
                            name="scale"
                            type="number"
                            step="0.05"
                            min="0.5"
                            max="2"
                            defaultValue={logo.scale ?? 1.2}
                            className={osInputClass()}
                          />
                        </Field>
                        <Field label="Order">
                          <input
                            name="sortOrder"
                            type="number"
                            defaultValue={logo.sortOrder ?? 0}
                            className={osInputClass()}
                          />
                        </Field>
                      </div>
                      <Field label="Replace image">
                        <input name="image" type="file" accept="image/*" className={osInputClass()} />
                      </Field>
                      <Field label="Or image URL / path">
                        <input
                          name="imageUrl"
                          defaultValue={logo.imageBase64 ? "" : logo.imageUrl || ""}
                          placeholder="Leave blank to keep current upload"
                          className={osInputClass()}
                        />
                      </Field>
                    </OsActionForm>
                  </OsSlideOver>
                  <RowDeleteButton
                    action={archiveSiteClientLogo}
                    id={String(logo._id)}
                    confirmMessage={`Remove ${logo.title} from the Clients section?`}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      <section>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-archivo text-sm uppercase tracking-wide">
              Selected Works
            </h2>
            <p className="mt-1 font-inter text-xs text-[var(--dash-muted)]">
              Cards in the hover-expand gallery and /work pages.
            </p>
          </div>
          <OsSlideOver
            triggerLabel="Add work"
            title="Add selected work"
            wide
          >
            <OsActionForm
              action={upsertSiteWork}
              submitLabel="Add work"
              className="grid gap-3"
            >
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Title">
                  <input name="title" required className={osInputClass()} />
                </Field>
                <Field label="Slug">
                  <input
                    name="slug"
                    placeholder="auto from title"
                    className={osInputClass()}
                  />
                </Field>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Category">
                  <input name="category" className={osInputClass()} />
                </Field>
                <Field label="Location">
                  <input name="location" className={osInputClass()} />
                </Field>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Order">
                  <input
                    name="sortOrder"
                    type="number"
                    defaultValue={works.length}
                    className={osInputClass()}
                  />
                </Field>
                <Field label="Full width">
                  <OsSelect
                    name="fullWidth"
                    defaultValue="false"
                    options={[
                      { value: "false", label: "No" },
                      { value: "true", label: "Yes" },
                    ]}
                  />
                </Field>
              </div>
              <Field label="Problem">
                <textarea name="problem" rows={2} className={osTextareaClass()} />
              </Field>
              <Field label="Approach">
                <textarea name="approach" rows={2} className={osTextareaClass()} />
              </Field>
              <Field label="Outcome">
                <textarea name="outcome" rows={2} className={osTextareaClass()} />
              </Field>
              <Field label="Focus tags (comma-separated)">
                <input name="focus" placeholder="Website, Booking" className={osInputClass()} />
              </Field>
              <Field label="Image file">
                <input name="image" type="file" accept="image/*" className={osInputClass()} />
              </Field>
              <Field label="Or image URL / path">
                <input
                  name="imageUrl"
                  placeholder="/works/project.png or https://…"
                  className={osInputClass()}
                />
              </Field>
            </OsActionForm>
          </OsSlideOver>
        </div>

        <ul className="grid gap-3 lg:grid-cols-2">
          {works.map((work) => {
            const src = previewSrc(work, "work");
            return (
              <li
                key={String(work._id)}
                className="overflow-hidden rounded-2xl border border-[var(--dash-border)]"
              >
                <div className="relative h-40 bg-[#111]">
                  {src ? (
                    <Image
                      src={src}
                      alt={work.title}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  ) : null}
                </div>
                <div className="p-4">
                  <p className="font-archivo text-sm uppercase">{work.title}</p>
                  <p className="mt-0.5 font-inter text-[11px] text-[var(--dash-muted)]">
                    {work.category || "—"} · /work/{work.slug}
                  </p>
                  <div className="mt-3 flex items-center gap-2">
                    <OsSlideOver
                      triggerLabel="Edit"
                      title={`Edit · ${work.title}`}
                      wide
                      triggerClassName="!h-8 !rounded-lg !px-3 !text-[12px] !normal-case"
                    >
                      <OsActionForm
                        action={upsertSiteWork}
                        submitLabel="Save work"
                        className="grid gap-3"
                      >
                        <input type="hidden" name="id" value={String(work._id)} />
                        <div className="grid gap-3 sm:grid-cols-2">
                          <Field label="Title">
                            <input
                              name="title"
                              required
                              defaultValue={work.title}
                              className={osInputClass()}
                            />
                          </Field>
                          <Field label="Slug">
                            <input
                              name="slug"
                              defaultValue={work.slug}
                              className={osInputClass()}
                            />
                          </Field>
                        </div>
                        <div className="grid gap-3 sm:grid-cols-2">
                          <Field label="Category">
                            <input
                              name="category"
                              defaultValue={work.category || ""}
                              className={osInputClass()}
                            />
                          </Field>
                          <Field label="Location">
                            <input
                              name="location"
                              defaultValue={work.location || ""}
                              className={osInputClass()}
                            />
                          </Field>
                        </div>
                        <div className="grid gap-3 sm:grid-cols-2">
                          <Field label="Order">
                            <input
                              name="sortOrder"
                              type="number"
                              defaultValue={work.sortOrder ?? 0}
                              className={osInputClass()}
                            />
                          </Field>
                          <Field label="Full width">
                            <OsSelect
                              name="fullWidth"
                              defaultValue={work.fullWidth ? "true" : "false"}
                              options={[
                                { value: "false", label: "No" },
                                { value: "true", label: "Yes" },
                              ]}
                            />
                          </Field>
                        </div>
                        <Field label="Problem">
                          <textarea
                            name="problem"
                            rows={2}
                            defaultValue={work.problem || ""}
                            className={osTextareaClass()}
                          />
                        </Field>
                        <Field label="Approach">
                          <textarea
                            name="approach"
                            rows={2}
                            defaultValue={work.approach || ""}
                            className={osTextareaClass()}
                          />
                        </Field>
                        <Field label="Outcome">
                          <textarea
                            name="outcome"
                            rows={2}
                            defaultValue={work.outcome || ""}
                            className={osTextareaClass()}
                          />
                        </Field>
                        <Field label="Focus tags (comma-separated)">
                          <input
                            name="focus"
                            defaultValue={(work.focus || []).join(", ")}
                            className={osInputClass()}
                          />
                        </Field>
                        <Field label="Replace image">
                          <input name="image" type="file" accept="image/*" className={osInputClass()} />
                        </Field>
                        <Field label="Or image URL / path">
                          <input
                            name="imageUrl"
                            defaultValue={work.imageBase64 ? "" : work.imageUrl || ""}
                            placeholder="Leave blank to keep current upload"
                            className={osInputClass()}
                          />
                        </Field>
                      </OsActionForm>
                    </OsSlideOver>
                    <RowDeleteButton
                      action={archiveSiteWork}
                      id={String(work._id)}
                      confirmMessage={`Remove ${work.title} from Selected Works?`}
                    />
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="mt-12">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-archivo text-sm uppercase tracking-wide">
              The Crew
            </h2>
            <p className="mt-1 font-inter text-xs text-[var(--dash-muted)]">
              Photos, roles, LinkedIn, and portfolio links on the homepage.
            </p>
          </div>
          <OsSlideOver triggerLabel="Add crew member" title="Add crew member" wide>
            <OsActionForm
              action={upsertSiteCrewMember}
              submitLabel="Add member"
              className="grid gap-3"
            >
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Name">
                  <input name="name" required className={osInputClass()} />
                </Field>
                <Field label="Slug">
                  <input name="slug" placeholder="harsha" className={osInputClass()} />
                </Field>
              </div>
              <Field label="Role">
                <input name="role" className={osInputClass()} />
              </Field>
              <Field label="Description">
                <textarea name="description" rows={2} className={osTextareaClass()} />
              </Field>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Accent">
                  <OsSelect
                    name="accent"
                    defaultValue="orange"
                    options={[
                      { value: "orange", label: "Orange" },
                      { value: "green", label: "Green" },
                      { value: "purple", label: "Purple" },
                    ]}
                  />
                </Field>
                <Field label="Order">
                  <input
                    name="sortOrder"
                    type="number"
                    defaultValue={crewMembers.length}
                    className={osInputClass()}
                  />
                </Field>
              </div>
              <Field label="LinkedIn URL">
                <input name="linkedin" placeholder="https://linkedin.com/in/…" className={osInputClass()} />
              </Field>
              <Field label="Portfolio URL">
                <input name="portfolio" placeholder="https://…" className={osInputClass()} />
              </Field>
              <Field label="Photo">
                <input name="image" type="file" accept="image/*" className={osInputClass()} />
              </Field>
              <Field label="Or image URL / path">
                <input
                  name="imageUrl"
                  placeholder="/crew/harsha.jpg"
                  className={osInputClass()}
                />
              </Field>
            </OsActionForm>
          </OsSlideOver>
        </div>

        <ul className="grid gap-3 lg:grid-cols-3">
          {crewMembers.map((member) => {
            const src = previewSrc(member, "crew");
            return (
              <li
                key={String(member._id)}
                className="overflow-hidden rounded-2xl border border-[var(--dash-border)]"
              >
                <div className="relative h-48 bg-[#111]">
                  {src ? (
                    <Image
                      src={src}
                      alt={member.name}
                      fill
                      className="object-cover object-top"
                      unoptimized
                    />
                  ) : null}
                </div>
                <div className="p-4">
                  <p className="font-archivo text-sm uppercase">{member.name}</p>
                  <p className="mt-0.5 font-inter text-[11px] text-[var(--dash-muted)]">
                    {member.role || "—"}
                  </p>
                  {member.portfolio ? (
                    <p className="mt-1 truncate font-inter text-[11px] text-[var(--dash-accent)]">
                      {member.portfolio}
                    </p>
                  ) : null}
                  <div className="mt-3 flex items-center gap-2">
                    <OsSlideOver
                      triggerLabel="Edit"
                      title={`Edit · ${member.name}`}
                      wide
                      triggerClassName="!h-8 !rounded-lg !px-3 !text-[12px] !normal-case"
                    >
                      <OsActionForm
                        action={upsertSiteCrewMember}
                        submitLabel="Save member"
                        className="grid gap-3"
                      >
                        <input type="hidden" name="id" value={String(member._id)} />
                        <div className="grid gap-3 sm:grid-cols-2">
                          <Field label="Name">
                            <input
                              name="name"
                              required
                              defaultValue={member.name}
                              className={osInputClass()}
                            />
                          </Field>
                          <Field label="Slug">
                            <input
                              name="slug"
                              defaultValue={member.slug}
                              className={osInputClass()}
                            />
                          </Field>
                        </div>
                        <Field label="Role">
                          <input
                            name="role"
                            defaultValue={member.role || ""}
                            className={osInputClass()}
                          />
                        </Field>
                        <Field label="Description">
                          <textarea
                            name="description"
                            rows={2}
                            defaultValue={member.description || ""}
                            className={osTextareaClass()}
                          />
                        </Field>
                        <div className="grid gap-3 sm:grid-cols-2">
                          <Field label="Accent">
                            <OsSelect
                              name="accent"
                              defaultValue={member.accent || "orange"}
                              options={[
                                { value: "orange", label: "Orange" },
                                { value: "green", label: "Green" },
                                { value: "purple", label: "Purple" },
                              ]}
                            />
                          </Field>
                          <Field label="Order">
                            <input
                              name="sortOrder"
                              type="number"
                              defaultValue={member.sortOrder ?? 0}
                              className={osInputClass()}
                            />
                          </Field>
                        </div>
                        <Field label="LinkedIn URL">
                          <input
                            name="linkedin"
                            defaultValue={member.linkedin || ""}
                            className={osInputClass()}
                          />
                        </Field>
                        <Field label="Portfolio URL">
                          <input
                            name="portfolio"
                            defaultValue={member.portfolio || ""}
                            className={osInputClass()}
                          />
                        </Field>
                        <Field label="Replace photo">
                          <input name="image" type="file" accept="image/*" className={osInputClass()} />
                        </Field>
                        <Field label="Or image URL / path">
                          <input
                            name="imageUrl"
                            defaultValue={member.imageBase64 ? "" : member.imageUrl || ""}
                            placeholder="Leave blank to keep current upload"
                            className={osInputClass()}
                          />
                        </Field>
                      </OsActionForm>
                    </OsSlideOver>
                    <RowDeleteButton
                      action={archiveSiteCrewMember}
                      id={String(member._id)}
                      confirmMessage={`Remove ${member.name} from The Crew?`}
                    />
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </section>
    </OsPage>
  );
}
