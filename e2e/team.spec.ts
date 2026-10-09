import { type Browser, expect, type Page, test } from "@playwright/test";
import { expectNoAxeViolations } from "./axe";

async function inviteLink(page: Page, role: string) {
  await page.goto("/equipe");
  await page.getByRole("radio", { name: role }).check({ force: true });
  await page.getByRole("button", { name: "Criar link de convite" }).click();
  const field = page.getByRole("textbox", { name: "Convite" });
  await expect(field).toHaveValue(/\/convite\/[0-9a-f]{48}$/);
  return new URL(await field.inputValue()).pathname;
}

async function guest(browser: Browser, alias: string, path: string) {
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto(
    `/dev/entrar?as=${alias}&sem-casamento=1&next=${encodeURIComponent(path)}`,
  );
  return { page, close: () => context.close() };
}

test("the partner joins with a link and plans together", async ({
  page,
  browser,
}, testInfo) => {
  const project = testInfo.project.name;
  await page.goto(`/dev/entrar?as=casal-${project}&next=/equipe`);
  await expectNoAxeViolations(page);
  const path = await inviteLink(page, "Casal");
  await expect(page.getByText("Link pronto.")).toBeVisible();

  const partner = await guest(browser, `parceira-${project}`, path);
  try {
    await expect(
      partner.page.getByRole("heading", {
        name: "Planejar o casamento de Ana e Bruno",
      }),
    ).toBeVisible();
    await expectNoAxeViolations(partner.page);
    await partner.page
      .getByRole("button", { name: "Entrar no casamento" })
      .click();
    await expect(partner.page).toHaveURL("/");
    await expect(
      partner.page.getByRole("main").getByText("Ana e Bruno"),
    ).toBeVisible();

    await partner.page.goto(path);
    await expect(
      partner.page.getByText("Você já faz parte deste casamento."),
    ).toBeVisible();
  } finally {
    await partner.close();
  }

  await page.reload();
  await expect(
    page.getByRole("main").getByRole("list").first().getByRole("listitem"),
  ).toHaveCount(2);
});

test("a helper edits guests but not the budget", async ({
  page,
  browser,
}, testInfo) => {
  const project = testInfo.project.name;
  await page.goto(`/dev/entrar?as=dona-${project}&next=/equipe`);
  const path = await inviteLink(page, "Ajudante");

  const helper = await guest(browser, `ajudante-${project}`, path);
  try {
    await helper.page
      .getByRole("button", { name: "Entrar no casamento" })
      .click();
    await expect(helper.page).toHaveURL("/");
    await helper.page.goto("/orcamento");
    await expect(
      helper.page.getByRole("link", { name: "Novo gasto" }),
    ).toHaveCount(0);
    await helper.page.goto("/convidados");
    await expect(
      helper.page.getByRole("link", { name: "Nova família ou grupo" }).first(),
    ).toBeVisible();
  } finally {
    await helper.close();
  }
});

test("a used or unknown invite explains what happened", async ({ page }) => {
  await page.goto(
    `/dev/entrar?as=sem-convite&sem-casamento=1&next=/convite/${"0".repeat(48)}`,
  );
  await expect(
    page.getByRole("heading", { name: "Convite inválido" }),
  ).toBeVisible();
  await expectNoAxeViolations(page);
});
