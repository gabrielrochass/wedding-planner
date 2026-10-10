import { expect, test } from "@playwright/test";
import { expectNoAxeViolations } from "./axe";

test("a new couple sets up the wedding and invites the partner", async ({
  page,
}, testInfo) => {
  await page.goto(
    `/dev/entrar?as=novo-${testInfo.project.name}&sem-casamento=1&next=/`,
  );
  await expect(page).toHaveURL("/comecar");
  await expect(page.getByLabel("Primeiro nome")).toHaveValue("Ana");
  await expect(
    page.getByRole("radio", { name: "Quem vai casar" }),
  ).toBeChecked();
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

  await page.getByRole("radio", { name: "Uns 150" }).check({ force: true });
  await expect(page.getByLabel("Ou digite o número")).toHaveValue("150");
  await page
    .getByRole("radio", { name: "Uns R$ 100 mil" })
    .check({ force: true });
  await expectNoAxeViolations(page);
  await page.getByRole("button", { name: "Continuar" }).click();

  await expect(
    page.getByRole("heading", { name: "O que vocês já garantiram?" }),
  ).toBeFocused();
  await page
    .getByRole("checkbox", { name: "Espaço da festa" })
    .check({ force: true });
  await page
    .getByRole("checkbox", { name: "Foto e vídeo" })
    .check({ force: true });
  await expectNoAxeViolations(page);
  await page.getByRole("button", { name: "Continuar" }).click();

  for (const name of ["Fotos e vídeo", "Lua de mel", "Decoração"]) {
    await page.getByRole("checkbox", { name }).check({ force: true });
  }
  await expect(
    page.getByRole("checkbox", { name: "Festa e música" }),
  ).toBeDisabled();
  await expectNoAxeViolations(page);
  await page.getByRole("button", { name: "Criar nosso casamento" }).click();

  await expect(
    page.getByRole("heading", { name: "Agora chame Bruno" }),
  ).toBeFocused();
  await expect(
    page.getByRole("link", { name: "Enviar pelo WhatsApp" }),
  ).toHaveAttribute("href", /wa\.me.*Bruno.*convite/);
  await expectNoAxeViolations(page);
  await page.getByRole("button", { name: "Depois eu chamo" }).click();

  await expect(
    page.getByRole("heading", { name: "Tudo pronto!" }),
  ).toBeVisible();
  await expect(page.getByText("4 já feitas")).toBeVisible();
  await page.getByRole("radio", { name: "Instagram" }).check({ force: true });
  await expectNoAxeViolations(page);
  await page.getByRole("button", { name: "Ana e Bruno" }).click();
  await expect(page).toHaveURL("/");
  await expect(page.getByRole("main").getByText("Ana e Bruno")).toBeVisible();
  await expect(page.getByText("dias para o sim")).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "12 meses ou mais antes" }),
  ).toBeVisible();

  await page.goto("/tarefas");
  await expect(
    page.getByText("Registrar o casamento religioso no cartório"),
  ).toBeVisible();
  await expect(
    page.getByText("Fazer a inscrição no curso de noivos"),
  ).toBeVisible();
});

test("a planner starts with only the month in mind", async ({
  page,
}, testInfo) => {
  await page.goto(
    `/dev/entrar?as=assessoria-${testInfo.project.name}&sem-casamento=1&next=/`,
  );
  await page
    .getByRole("radio", { name: "Assessoria ou cerimonial" })
    .check({ force: true });
  await expect(page.getByLabel("Primeiro nome")).toHaveValue("");
  await page.getByLabel("Primeiro nome").fill("Lia");
  await page.getByLabel("Segundo nome").fill("Rafa");
  await page.getByRole("button", { name: "Continuar" }).click();

  await page.getByRole("radio", { name: "Só o mês" }).check({ force: true });
  await page.getByLabel("Mês previsto").fill("2028-05");
  for (let step = 0; step < 4; step++) {
    await page.getByRole("button", { name: "Continuar" }).click();
  }
  await page.getByRole("button", { name: "Criar nosso casamento" }).click();

  await expect(
    page.getByRole("heading", { name: "Agora chame o casal" }),
  ).toBeFocused();
  await page.getByRole("button", { name: "Depois eu chamo" }).click();
  await page.getByRole("button", { name: "Lia e Rafa" }).click();
  await expect(page).toHaveURL("/");
  await expect(page.getByText("previsto para maio de 2028")).toBeVisible();
});

test("a person with a wedding skips the setup", async ({ page }) => {
  await page.goto("/dev/entrar?as=ja-casando&next=/comecar");
  await expect(page).toHaveURL("/");
});
