import { expect, test } from "@playwright/test";
import { expectNoAxeViolations } from "./axe";

const appPaths = [
  "/",
  "/tarefas",
  "/convidados",
  "/orcamento",
  "/fornecedores",
  "/fornecedores/comparar",
  "/equipe",
  "/ideias",
  "/musicas",
  "/cortejo",
  "/cronograma",
  "/enxoval",
  "/ajustes",
  "/ajustes/casamento",
  "/ajustes/conta",
];

for (const colorScheme of ["light", "dark"] as const) {
  test(`desktop screens meet WCAG in the ${colorScheme} theme`, async ({
    page,
  }) => {
    test.slow();
    await page.emulateMedia({ colorScheme });
    for (const path of ["/entrar", "/termos", "/dev/ui"]) {
      await page.goto(path);
      await expectNoAxeViolations(page);
    }
    await page.goto(`/dev/entrar?as=desktop-${colorScheme}&next=/`);
    for (const path of appPaths) {
      await page.goto(path);
      await expectNoAxeViolations(page);
    }
  });
}

test("the general tour points at the side navigation", async ({ page }) => {
  await page.goto("/dev/entrar?as=tour-desktop&tours=1&next=%2F");
  const dialog = page.getByRole("dialog");
  await expect(dialog).toHaveAccessibleName("Boas-vindas ao Dois em Um");
  for (const title of [
    "Início, o resumo de tudo",
    "Tarefas, o checklist com prazos",
    "Adicionar de qualquer lugar",
    "Convidados, por família",
    "Orçamento, com parcelas",
    "O resto fica em Mais",
  ]) {
    await page.getByRole("button", { name: "Próximo" }).click();
    await expect(dialog).toHaveAccessibleName(title);
  }
  await expectNoAxeViolations(page);
  await page.keyboard.press("Escape");
  await expect(dialog).toHaveCount(0);
});
