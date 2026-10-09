import { z } from "zod";
import { ptBR } from "zod/locales";
import { taskAreas } from "@/lib/checklist";
import { homeRooms } from "@/lib/home";
import { m } from "@/lib/i18n";
import { categoryIconKeys } from "@/lib/icons";
import { ideaBoards } from "@/lib/ideas";
import { musicMoments } from "@/lib/music";
import { partyRoles } from "@/lib/party";
import { Constants } from "@/lib/supabase/database.types";

z.config(ptBR());

const enums = Constants.public.Enums;

export const isoDate = z
  .string()
  .regex(
    /^(20\d{2}|2100)-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/,
    m.common.dateInvalid,
  );

const money = z
  .number()
  .int()
  .min(1, m.common.amountRequired)
  .max(9_999_999_999);
const optionalMoney = z.number().int().min(1).max(9_999_999_999).nullable();
const text = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .transform((value) => value || null);
const label = (max: number, message: string = m.common.nameRequired) =>
  z.string().trim().min(1, message).max(max);
const person = z
  .string()
  .trim()
  .min(1, m.wedding.partnerRequired)
  .max(40)
  .regex(/^[^\p{Cc}]+$/u);

export const weddingInput = z.object({
  id: z.uuid(),
  partnerA: person,
  partnerB: person,
  weddingDate: isoDate.nullable(),
  city: text(80),
  ceremony: z.enum(enums.ceremony_kind),
  guestEstimate: z.number().int().min(1).max(5000).nullable(),
  budgetCents: optionalMoney,
});

export type WeddingInput = z.input<typeof weddingInput>;

export const weddingSettingsInput = weddingInput.omit({ id: true }).extend({
  motto: text(200),
  contingencyPercent: z.number().int().min(0).max(50),
});

export type WeddingSettingsInput = z.input<typeof weddingSettingsInput>;

export const taskInput = z
  .object({
    id: z.uuid(),
    title: label(120, m.tasks.titleRequired),
    notes: text(2000),
    area: z.enum(taskAreas),
    offsetDays: z.number().int().min(-400).max(1200).nullable(),
    dueOn: isoDate.nullable(),
    assigneeId: z.uuid().nullable(),
    assigneeLabel: text(40),
    vendorId: z.uuid().nullable(),
  })
  .refine((task) => !(task.assigneeId && task.assigneeLabel), {
    path: ["assigneeLabel"],
  });

export type TaskInput = z.input<typeof taskInput>;

export const categoryInput = z.object({
  id: z.uuid(),
  name: label(40),
  icon: z.enum(categoryIconKeys),
  plannedCents: z.number().int().min(0).max(9_999_999_999).nullable(),
});

export type CategoryInput = z.input<typeof categoryInput>;

export const paymentPlanInput = z.object({
  count: z.number().int().min(1).max(60),
  firstDue: isoDate,
});

export const expenseInput = z.object({
  id: z.uuid(),
  categoryId: z.uuid(),
  vendorId: z.uuid().nullable(),
  title: label(80),
  estimatedCents: optionalMoney,
  contractedCents: optionalMoney,
  notes: text(2000),
  plan: paymentPlanInput.nullable(),
});

export type ExpenseInput = z.input<typeof expenseInput>;

export const paymentInput = z.object({
  id: z.uuid(),
  expenseId: z.uuid(),
  amountCents: money,
  dueOn: isoDate,
  paidOn: isoDate.nullable(),
  method: z.enum(enums.payment_method).nullable(),
  contributorId: z.uuid().nullable(),
  note: text(120),
});

export type PaymentInput = z.input<typeof paymentInput>;

export const contributorInput = z.object({
  id: z.uuid(),
  name: label(40),
  promisedCents: optionalMoney,
});

export type ContributorInput = z.input<typeof contributorInput>;

export const vendorInput = z.object({
  id: z.uuid(),
  categoryId: z.uuid().nullable(),
  name: label(80),
  status: z.enum(enums.vendor_status),
  contactName: text(80),
  phone: text(30),
  email: z
    .union([z.literal(""), z.email().max(120)])
    .transform((value) => value || null),
  instagram: text(80),
  website: text(300),
  quoteCents: optionalMoney,
  quoteDetails: text(2000),
  capacity: z.number().int().min(1).max(10000).nullable(),
  rating: z.number().int().min(1).max(5).nullable(),
  visitOn: isoDate.nullable(),
  notes: text(2000),
});

export type VendorInput = z.input<typeof vendorInput>;

export const hireInput = z.object({
  vendorId: z.uuid(),
  expenseId: z.uuid(),
  categoryId: z.uuid(),
  contractedCents: money,
  plan: paymentPlanInput,
});

export type HireInput = z.input<typeof hireInput>;

export const guestMemberInput = z.object({
  id: z.uuid(),
  name: label(80),
  ageBand: z.enum(enums.age_band),
  rsvp: z.enum(enums.rsvp_status),
  isPlusOne: z.boolean(),
  dietary: text(120),
});

export const householdInput = z.object({
  id: z.uuid(),
  name: label(80),
  side: z.enum(enums.guest_side),
  list: z.enum(enums.guest_list),
  phone: text(30),
  address: text(300),
  notes: text(2000),
  saveTheDateOn: isoDate.nullable(),
  invitedOn: isoDate.nullable(),
  gift: text(120),
  thankedOn: isoDate.nullable(),
  members: z.array(guestMemberInput).min(1).max(30),
});

export type HouseholdInput = z.input<typeof householdInput>;

export const bulkHouseholdsInput = z
  .array(
    z.object({
      id: z.uuid(),
      name: label(80),
      members: z
        .array(z.object({ id: z.uuid(), name: label(80) }))
        .min(1)
        .max(12),
    }),
  )
  .min(1)
  .max(300);

export type BulkHouseholdsInput = z.input<typeof bulkHouseholdsInput>;

const link = z
  .union([
    z.literal(""),
    z.url({ protocol: /^https?$/, error: m.ideas.linkInvalid }).max(500),
  ])
  .transform((value) => value || null);

export const ideaInput = z.object({
  id: z.uuid(),
  board: z.enum(ideaBoards),
  title: label(80),
  notes: text(2000),
  url: link,
  imagePath: z
    .string()
    .regex(/^[0-9a-f-]{36}\/[0-9a-f-]{36}\/[0-9a-f-]{36}\.webp$/)
    .nullable(),
  status: z.enum(enums.idea_status),
  estimateCents: optionalMoney,
  vendorId: z.uuid().nullable(),
});

export type IdeaInput = z.input<typeof ideaInput>;

export const songInput = z.object({
  id: z.uuid(),
  moment: z.enum(musicMoments),
  title: label(80),
  artist: text(80),
  url: link,
  chosen: z.boolean(),
});

export type SongInput = z.input<typeof songInput>;

export const partyInput = z.object({
  id: z.uuid(),
  name: label(80),
  role: z.enum(partyRoles),
  side: z.enum(enums.guest_side),
  pairId: z.uuid().nullable(),
  attire: text(120),
  inviteStatus: z.enum(enums.party_invite),
  phone: text(30),
  notes: text(2000),
});

export type PartyInput = z.input<typeof partyInput>;

const time = z
  .string()
  .regex(/^([01]\d|2[0-3]):[0-5]\d$/, m.timeline.timeRequired);

export const timelineInput = z
  .object({
    id: z.uuid(),
    startsAt: time,
    endsAt: time.nullable(),
    title: label(80),
    place: text(120),
    responsible: text(80),
    notes: text(2000),
    songId: z.uuid().nullable(),
  })
  .refine((item) => !item.endsAt || item.endsAt > item.startsAt, {
    path: ["endsAt"],
    message: m.timeline.endBeforeStart,
  });

export type TimelineInput = z.input<typeof timelineInput>;

export const homeItemInput = z.object({
  id: z.uuid(),
  room: z.enum(homeRooms),
  name: label(80),
  quantity: z.number().int().min(1).max(999),
  priority: z.enum(enums.home_priority),
  status: z.enum(enums.home_status),
  estimateCents: optionalMoney,
  paidCents: z.number().int().min(0).max(9_999_999_999).nullable(),
  store: text(80),
  url: link,
  householdId: z.uuid().nullable(),
  notes: text(2000),
});

export type HomeItemInput = z.input<typeof homeItemInput>;

export const homeItemsBulkInput = z
  .array(
    z.object({
      name: label(80),
      room: z.enum(homeRooms),
      quantity: z.number().int().min(1).max(999),
      priority: z.enum(enums.home_priority),
      status: z.enum(enums.home_status),
      estimateCents: optionalMoney,
    }),
  )
  .min(1)
  .max(500);

export type HomeItemsBulkInput = z.input<typeof homeItemsBulkInput>;

export function fieldErrors(error: z.ZodError) {
  return z.flattenError(error).fieldErrors as Record<
    string,
    string[] | undefined
  >;
}
