import { expect, type Page, test } from "@playwright/test";
import { expectNoAxeViolations } from "./axe";

function signIn(page: Page, alias: string, next: string, project: string) {
  return page.goto(
    `/dev/entrar?as=${alias}-${project}&next=${encodeURIComponent(next)}`,
  );
}

const pixel = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
  "base64",
);

test("a song is chosen for a ceremony moment", async ({ page }, testInfo) => {
  await signIn(page, "musica", "/musicas", testInfo.project.name);
  await expectNoAxeViolations(page);
  await page
    .getByRole("button", { name: "Adicionar música: Primeira dança" })
    .click();
  const sheet = page.getByRole("dialog");
  await sheet.getByLabel("Música").fill("Can I Have This Dance");
  await sheet.getByLabel("Artista").fill("High School Musical");
  await sheet.getByRole("button", { name: "Salvar" }).click();
  await expect(page.getByText("Música salva").last()).toBeVisible();

  const star = page.getByRole("button", {
    name: "Escolher Can I Have This Dance",
  });
  await star.click();
  await expect(
    page.getByRole("button", { name: "Desmarcar Can I Have This Dance" }),
  ).toHaveAttribute("aria-pressed", "true");
  await expect(
    page.getByRole("link", { name: "Buscar Can I Have This Dance no Spotify" }),
  ).toHaveAttribute("href", /open\.spotify\.com\/search\//);
});

test("the wedding party walks in pairs and can be reordered", async ({
  page,
}, testInfo) => {
  await signIn(page, "cortejo", "/cortejo", testInfo.project.name);
  for (const [name, role, side] of [
    ["Lia", "Madrinha", "De Ana"],
    ["Rafa", "Padrinho", "De Bruno"],
    ["Theo", "Pajem", "De Bruno"],
  ] as const) {
    await page.getByRole("button", { name: "Adicionar pessoa" }).click();
    const sheet = page.getByRole("dialog");
    await sheet.getByLabel("Nome").fill(name);
    await sheet.getByLabel("Papel").selectOption({ label: role });
    await sheet.getByText(side, { exact: true }).click();
    await expect(sheet.getByRole("radio", { name: side })).toBeChecked();
    if (name === "Rafa")
      await sheet.getByLabel("Entra junto com").selectOption({ label: "Lia" });
    await sheet.getByRole("button", { name: "Salvar" }).click();
    await expect(page.getByText("Pessoa salva").last()).toBeVisible();
  }
  const rows = page.getByRole("main").getByRole("listitem");
  await expect(
    rows.filter({ hasText: "Lia" }).filter({ hasText: "Rafa" }),
  ).toHaveCount(1);
  await page
    .getByRole("button", { name: "Subir Theo na ordem de entrada" })
    .click();
  await expect(rows.filter({ hasText: "1º" })).toContainText("Theo");
  await expectNoAxeViolations(page);
});

test("the day timeline warns about clashing times", async ({
  page,
}, testInfo) => {
  await signIn(page, "cronograma", "/cronograma", testInfo.project.name);
  for (const [start, end, title] of [
    ["16:00", "17:00", "Cerimônia"],
    ["16:30", "", "Fotos com os padrinhos"],
  ] as const) {
    await page
      .getByRole("button", { name: "Adicionar momento" })
      .first()
      .click();
    const sheet = page.getByRole("dialog");
    await sheet.getByLabel("Começa").fill(start);
    if (end) await sheet.getByLabel("Termina").fill(end);
    await sheet.getByLabel("O que acontece").fill(title);
    await sheet.getByRole("button", { name: "Salvar" }).click();
    await expect(page.getByText("Momento salvo").last()).toBeVisible();
  }
  await expect(page.getByText("16h00 às 17h00")).toBeVisible();
  await expect(page.getByText("Horário em conflito")).toHaveCount(2);
  await expectNoAxeViolations(page);
});

test("an idea keeps a photo and a link", async ({ page }, testInfo) => {
  await signIn(
    page,
    "ideia",
    "/ideias/nova?quadro=decoracao",
    testInfo.project.name,
  );
  await page.getByLabel("Adicionar foto").setInputFiles({
    name: "lirios.png",
    mimeType: "image/png",
    buffer: pixel,
  });
  await expect(
    page.getByRole("button", { name: "Remover foto" }),
  ).toBeVisible();
  await page
    .getByRole("textbox", { name: "Ideia" })
    .fill("Lírios em vaso longo");
  await page
    .getByLabel("Link da referência")
    .fill("https://pinterest.com/pin/123");
  await page.getByRole("radio", { name: "Aprovada" }).check({ force: true });
  await page.getByLabel("Quanto deve custar").fill("50000");
  await page.getByRole("button", { name: "Nova ideia" }).click();

  await expect(page).toHaveURL("/ideias?quadro=decoracao");
  await expect(page.getByText("R$ 500 em ideias aprovadas")).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Abrir referência: Lírios em vaso longo" }),
  ).toBeVisible();
  const photo = page.getByRole("main").locator("img");
  await expect(photo).toHaveAttribute(
    "src",
    /\/storage\/v1\/object\/sign\/ideias\//,
  );
  await expect
    .poll(() => photo.evaluate((img: HTMLImageElement) => img.naturalWidth))
    .toBeGreaterThan(0);
  await expectNoAxeViolations(page);
});
