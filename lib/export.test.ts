import { describe, expect, it } from "vitest";
import { bom, csvCell, toCsv } from "./csv";
import { expensesCsv, guestsCsv, tasksCsv, vendorsCsv } from "./export";

function lines(csv: string) {
  return csv.slice(bom.length).trimEnd().split("\r\n");
}

describe("toCsv", () => {
  it("starts with a byte order mark and uses CRLF and semicolons", () => {
    const csv = toCsv(["a", "b"], [["1", "2"]]);
    expect(csv.startsWith(bom)).toBe(true);
    expect(csv).toBe(`${bom}"a";"b"\r\n"1";"2"\r\n`);
  });

  it("quotes every cell and doubles inner quotes", () => {
    expect(csvCell('Bolo "naked"; 3 andares')).toBe(
      '"Bolo ""naked""; 3 andares"',
    );
    expect(csvCell(null)).toBe('""');
  });

  it("keeps spreadsheets from running formulas", () => {
    expect(csvCell("=SOMA(A1:A9)")).toBe(`"'=SOMA(A1:A9)"`);
    expect(csvCell("+55 81 9999")).toBe(`"'+55 81 9999"`);
  });
});

describe("guestsCsv", () => {
  it("writes one row per person with household details", () => {
    const csv = guestsCsv(
      [
        {
          id: "h1",
          name: "Família Souza",
          side: "a",
          list: "a",
          phone: "5581999990000",
          address: null,
          save_the_date_on: "2027-06-01",
          invited_on: null,
          gift: null,
          thanked_on: null,
        },
      ],
      [
        {
          household_id: "h1",
          name: "Rita",
          age_band: "adult",
          rsvp: "yes",
          is_plus_one: false,
          dietary: "Sem glúten",
        },
        {
          household_id: "h1",
          name: "Acompanhante",
          age_band: "adult",
          rsvp: "pending",
          is_plus_one: true,
          dietary: null,
        },
        {
          household_id: "x",
          name: "Órfão",
          age_band: "adult",
          rsvp: "pending",
          is_plus_one: false,
          dietary: null,
        },
      ],
      { a: "Ana", b: "Bruno" },
    );
    const rows = lines(csv);
    expect(rows).toHaveLength(3);
    expect(rows[1]).toContain(
      '"Família Souza";"Rita";"Ana";"Lista A";"Adulto";"Vai";"";"Sem glúten"',
    );
    expect(rows[2]).toContain(
      '"Acompanhante";"Ana";"Lista A";"Adulto";"Sem resposta";"Sim"',
    );
  });
});

describe("tasksCsv", () => {
  it("resolves due dates from the wedding date and assignee names", () => {
    const csv = tasksCsv(
      [
        {
          title: "Habilitação",
          area: "documentos",
          offset_days: 80,
          due_on: null,
          assignee_id: "u1",
          assignee_label: null,
          done_at: null,
          notes: null,
        },
      ],
      "2028-02-20",
      new Map([["u1", "Ana"]]),
    );
    expect(lines(csv)[1]).toBe(
      '"Habilitação";"Documentos";"2027-12-02";"Ana";"";""',
    );
  });
});

describe("expensesCsv", () => {
  it("writes one row per payment and keeps expenses without payments", () => {
    const csv = expensesCsv(
      [
        {
          id: "e1",
          category_id: "c1",
          vendor_id: "v1",
          title: "Buffet",
          estimated_cents: null,
          contracted_cents: 3000000,
        },
        {
          id: "e2",
          category_id: "c1",
          vendor_id: null,
          title: "Bebidas",
          estimated_cents: 500000,
          contracted_cents: null,
        },
      ],
      [
        {
          expense_id: "e1",
          amount_cents: 1500000,
          due_on: "2027-03-10",
          paid_on: "2027-03-09",
          method: "pix",
        },
        {
          expense_id: "e1",
          amount_cents: 1500000,
          due_on: "2027-04-10",
          paid_on: null,
          method: null,
        },
      ],
      {
        categories: [{ id: "c1", name: "Buffet e bebidas" }],
        vendors: [{ id: "v1", name: "Sabor & Arte" }],
      },
    );
    const rows = lines(csv);
    expect(rows).toHaveLength(4);
    expect(rows[1]).toBe(
      '"Buffet e bebidas";"Buffet";"Sabor & Arte";"";"30000,00";"15000,00";"2027-03-10";"2027-03-09";"Pix"',
    );
    expect(rows[3]).toBe(
      '"Buffet e bebidas";"Bebidas";"";"5000,00";"";"";"";"";""',
    );
  });
});

describe("vendorsCsv", () => {
  it("translates the status and category", () => {
    const csv = vendorsCsv(
      [
        {
          name: "Sítio das Flores",
          category_id: "c1",
          status: "favorite",
          contact_name: null,
          phone: null,
          email: null,
          instagram: "sitio",
          website: null,
          quote_cents: 1800000,
          quote_details: null,
          rating: 5,
          notes: null,
        },
      ],
      [{ id: "c1", name: "Espaço" }],
    );
    expect(lines(csv)[1]).toBe(
      '"Sítio das Flores";"Espaço";"Favorito";"";"";"";"sitio";"";"18000,00";"";"5";""',
    );
  });
});
