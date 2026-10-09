import { expect, test } from "@playwright/test";
import { expectNoAxeViolations } from "./axe";

const tabs = [
  { name: "Início", path: "/" },
  { name: "Tarefas", path: "/tarefas" },
  { name: "Convidados", path: "/convidados" },
  { name: "Orçamento", path: "/orcamento" },
];

const screens = [
  "/mais",
  "/fornecedores",
  "/fornecedores/novo",
  "/fornecedores/comparar",
  "/equipe",
  "/ideias",
  "/ideias/nova",
  "/musicas",
  "/cortejo",
  "/cronograma",
  "/enxoval",
  "/enxoval/colar",
  "/tarefas/nova",
  "/convidados/nova",
  "/convidados/colar",
  "/convidados/triagem",
  "/orcamento/gastos/novo",
  "/orcamento/categorias/nova",
  "/ajustes",
  "/ajustes/casamento",
  "/ajustes/conta",
  "/ajustes/conta/exportar",
  "/ajustes/conta/excluir",
];

for (const colorScheme of ["light", "dark"] as const) {
  test.describe(`${colorScheme} theme`, () => {
    test.use({ colorScheme });

    test("tab bar navigates between sections", async ({ page }) => {
      test.slow();
      await page.goto(`/dev/entrar?as=abas-${colorScheme}&next=/`);
      const nav = page.getByRole("navigation", { name: "Navegação principal" });

      for (const tab of tabs) {
        await nav.getByRole("link", { name: tab.name }).click();
        await expect(page).toHaveURL(tab.path);
        await expect(
          page.getByRole("heading", { level: 1, name: tab.name }),
        ).toBeVisible();
        await expect(nav.getByRole("link", { name: tab.name })).toHaveAttribute(
          "aria-current",
          "page",
        );
        await expectNoAxeViolations(page);
      }
    });

    test("more opens vendors, team and settings", async ({ page }) => {
      await page.goto(`/dev/entrar?as=mais-${colorScheme}&next=/`);
      await page.getByRole("link", { name: "Mais" }).click();
      await expect(
        page.getByRole("heading", { level: 1, name: "Mais" }),
      ).toBeVisible();
      for (const name of ["Fornecedores", "Equipe", "Ajustes"]) {
        await expect(
          page.getByRole("main").getByRole("link", { name }),
        ).toBeVisible();
      }
      await expectNoAxeViolations(page);
    });

    test("the add button opens a sheet with shortcuts", async ({ page }) => {
      await page.goto(`/dev/entrar?as=adicionar-${colorScheme}&next=/`);
      await page.getByRole("button", { name: "Adicionar" }).click();
      const sheet = page.getByRole("dialog", { name: "Adicionar" });
      await expect(sheet).toBeVisible();
      await expectNoAxeViolations(page);
      await sheet.getByRole("link", { name: /Tarefa/ }).click();
      await expect(
        page.getByRole("heading", { level: 1, name: "Nova tarefa" }),
      ).toBeVisible();
    });

    test("every screen meets WCAG", async ({ page }) => {
      test.slow();
      await page.goto(`/dev/entrar?as=telas-${colorScheme}&next=/`);
      for (const path of screens) {
        await page.goto(path);
        await expectNoAxeViolations(page);
      }
    });

    test("component gallery meets contrast", async ({ page }) => {
      await page.goto("/dev/ui");
      await expectNoAxeViolations(page);
    });
  });
}

test("no horizontal scroll at 320px", async ({ page }) => {
  test.slow();
  await page.setViewportSize({ width: 320, height: 640 });
  await page.goto("/dev/entrar?as=estreito&next=/");
  for (const path of [...tabs.map((tab) => tab.path), ...screens]) {
    await page.goto(path);
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - 320,
    );
    expect(overflow, path).toBeLessThanOrEqual(0);
  }
});
