import { expect, test } from "@playwright/test";
import { expectNoAxeViolations } from "./axe";

test("a new couple sets up the wedding in four answers", async ({
  page,
}, testInfo) => {
  await page.goto(
    `/dev/entrar?as=novo-${testInfo.project.name}&sem-casamento=1&next=/`,
  );
  await expect(page).toHaveURL("/comecar");
  await expect(page.getByLabel("Primeiro nome")).toHaveValue("Ana");
  await expectNoAxeViolations(page);

  await page.getByRole("button", { name: "Continuar" }).click();
  await expect(page.getByRole("main").locator("output")).toHaveText(
    "Escreva os dois nomes",
  );
  await page.getByLabel("Segundo nome").fill("Bruno");
  await page.getByRole("button", { name: "Continuar" }).click();

  await expect(
    page.getByRole("heading", { name: "Quando é o grande dia?" }),
  ).toBeFocused();
  await page.getByLabel("Data do casamento").fill("2028-02-20");
  await page.getByLabel("Cidade").fill("Recife");
  await expectNoAxeViolations(page);
  await page.getByRole("button", { name: "Continuar" }).click();

  await page
    .getByRole("radio", { name: "Religioso com efeito civil" })
    .check({ force: true });
  await page.getByRole("button", { name: "Continuar" }).click();

  await page.getByLabel("Quantos convidados, mais ou menos").fill("150");
  await page.getByLabel("Quanto querem gastar, mais ou menos").fill("8000000");
  await page.getByRole("button", { name: "Criar nosso casamento" }).click();

  await expect(
    page.getByRole("heading", { name: "Tudo pronto!" }),
  ).toBeVisible();
  await expectNoAxeViolations(page);
  await page.getByRole("button", { name: "Ana e Bruno" }).click();
  await expect(page).toHaveURL("/");
  await expect(page.getByRole("main").getByText("Ana e Bruno")).toBeVisible();
  await expect(page.getByText("dias para o sim")).toBeVisible();

  await page.goto("/tarefas");
  await expect(
    page.getByText("Registrar o casamento religioso no cartório"),
  ).toBeVisible();
  await expect(
    page.getByText("Fazer a inscrição no curso de noivos"),
  ).toBeVisible();
});

test("a person with a wedding skips the setup", async ({ page }) => {
  await page.goto("/dev/entrar?as=ja-casando&next=/comecar");
  await expect(page).toHaveURL("/");
});
