import { expect, test } from "@playwright/test";
import { expectNoAxeViolations } from "./axe";

test("the suggested list fills the enxoval by room", async ({
  page,
}, testInfo) => {
  await page.goto(
    `/dev/entrar?as=enxoval-${testInfo.project.name}&next=/enxoval`,
  );
  await expectNoAxeViolations(page);
  await page.getByRole("button", { name: "Usar a lista sugerida" }).click();
  await expect(page.getByText("128 itens adicionados")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Cozinha" })).toBeVisible();
  await expect(page.getByText("0 de 128 itens")).toBeVisible();

  await page.getByLabel("Situação de Jogo de panelas").selectOption("bought");
  await expect(
    page.getByRole("dialog", { name: "Jogo de panelas: Comprado" }),
  ).toBeVisible();
  await page
    .getByRole("navigation", { name: "Mostrar" })
    .getByRole("link", { name: /Comprado/ })
    .click();
  await expect(
    page.getByText("Jogo de panelas", { exact: true }),
  ).toBeVisible();
  await expect(page.getByText("Liquidificador")).toHaveCount(0);
  await expectNoAxeViolations(page);
});

test("a spreadsheet is pasted into the enxoval", async ({ page }, testInfo) => {
  await page.goto(
    `/dev/entrar?as=planilha-${testInfo.project.name}&next=/enxoval/colar`,
  );
  await page
    .getByLabel("Linhas da planilha")
    .fill(
      "Item\tQtd\tPreço\nEdredom king\t2\tR$ 350,00\nTaças de vinho\t6\t25,00\nAir fryer\t1\t\tsim",
    );
  await expect(page.getByText("3 itens encontrados")).toBeVisible();
  await expectNoAxeViolations(page);
  await page.getByRole("button", { name: "Adicionar ao enxoval" }).click();
  await expect(page).toHaveURL("/enxoval");
  await expect(page.getByRole("heading", { name: "Quarto" })).toBeVisible();
  await expect(page.getByText("R$ 350 cada")).toBeVisible();
  await expect(page.getByLabel("Situação de Air fryer")).toHaveValue("bought");
});
