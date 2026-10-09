import { expect, type Page, test } from "@playwright/test";
import { expectNoAxeViolations } from "./axe";

function signIn(page: Page, alias: string, next: string, project: string) {
  return page.goto(
    `/dev/entrar?as=${alias}-${project}&next=${encodeURIComponent(next)}`,
  );
}

test("tasks are created, completed and grouped by phase", async ({
  page,
}, testInfo) => {
  await signIn(page, "tarefas", "/tarefas/nova", testInfo.project.name);
  await page.getByRole("button", { name: "Nova tarefa" }).click();
  await expect(page.getByLabel("O que fazer")).toHaveAccessibleDescription(
    "Escreva a tarefa",
  );

  await page.getByLabel("O que fazer").fill("Provar os doces da Simone");
  await page.getByLabel("Dias antes do casamento").fill("200");
  await page.getByRole("button", { name: "Nova tarefa" }).click();
  await expect(page).toHaveURL("/tarefas");

  const task = page.getByRole("checkbox", {
    name: "Marcar como feita: Provar os doces da Simone",
  });
  await expect(task).toBeVisible();
  await expect(
    page.locator("#fase-6m").getByText("Provar os doces da Simone"),
  ).toBeVisible();
  await task.check({ force: true });
  await expect(page.getByText("Feito!")).toBeVisible();
  await page.goto("/tarefas?ver=todas");
  await expect(
    page.getByRole("checkbox", {
      name: "Desmarcar: Provar os doces da Simone",
    }),
  ).toBeChecked();
  await expectNoAxeViolations(page);
});

test("an expense in installments shows up as payments", async ({
  page,
}, testInfo) => {
  await signIn(
    page,
    "orcamento",
    "/orcamento/gastos/novo",
    testInfo.project.name,
  );
  await page.getByLabel("Descrição").fill("Vestido");
  await page.getByLabel("Categoria").selectOption({ label: "Traje e beleza" });
  await page.getByLabel("Valor fechado").fill("600000");
  await page.getByLabel("Quantas parcelas").selectOption("3");
  await page.getByLabel("Primeiro vencimento").fill("2027-01-10");
  await expect(page.getByText("3x R$ 2.000,00")).toBeVisible();
  await page.getByRole("button", { name: "Novo gasto" }).click();

  await expect(
    page.getByRole("heading", { level: 1, name: "Vestido" }),
  ).toBeVisible();
  const first = page.getByRole("checkbox", {
    name: "Marcar como pago: Parcela 1 de 3",
  });
  await expect(first).toBeVisible();
  await first.check({ force: true });
  await expect(page.getByText("R$ 2.000,00 pago")).toBeVisible();
  await expectNoAxeViolations(page);

  await page.goto("/orcamento");
  await expect(page.getByText("Traje e beleza", { exact: true })).toBeVisible();
  await expectNoAxeViolations(page);
});

test("a vendor moves through the board and is hired", async ({
  page,
}, testInfo) => {
  await signIn(page, "fornecedor", "/fornecedores/novo", testInfo.project.name);
  await page.getByLabel("Nome", { exact: true }).fill("Sítio das Flores");
  await page.getByLabel("Categoria").selectOption({ label: "Espaço" });
  await page.getByLabel("Orçamento").fill("1800000");
  await page
    .getByLabel("O que inclui")
    .fill("Cerimônia no jardim, 200 lugares, gerador");
  await page.getByRole("button", { name: "Novo fornecedor" }).click();
  await expect(
    page.getByRole("heading", { level: 1, name: "Sítio das Flores" }),
  ).toBeVisible();

  await page.goto("/fornecedores");
  await page.getByLabel("Mover Sítio das Flores").selectOption("favorite");
  await expect(
    page.getByText("Sítio das Flores foi para Favorito"),
  ).toBeVisible();
  await expectNoAxeViolations(page);

  await page.goto("/fornecedores/comparar");
  await expect(page.getByText("Menor preço")).toBeVisible();
  await page.getByRole("link", { name: "Contratar" }).click();

  await page.getByLabel("Quantas parcelas").selectOption("2");
  await page.getByLabel("Primeiro vencimento").fill("2027-03-10");
  await page.getByRole("button", { name: "Contratar" }).click();
  await expect(page).toHaveURL(/\/orcamento\/gastos\//);
  await expect(page.getByText("Parcela 2 de 2")).toBeVisible();
});

test("a pasted list goes through triage", async ({ page }, testInfo) => {
  await signIn(page, "triagem", "/convidados/colar", testInfo.project.name);
  await page
    .getByLabel("Lista de nomes")
    .fill("Rita e Theo Souza\nTio João\nPrima Carla");
  await expect(page.getByText("3 famílias, 4 pessoas")).toBeVisible();
  await page.getByRole("button", { name: "Adicionar à triagem" }).click();

  await expect(page).toHaveURL("/convidados/triagem");
  await expect(
    page.getByRole("heading", { name: "Rita e Theo Souza" }),
  ).toBeVisible();
  await expectNoAxeViolations(page);
  await page.getByRole("button", { name: "Lista A" }).click();
  await expect(page.getByRole("heading", { name: "Tio João" })).toBeVisible();
  await page.keyboard.press("b");
  await expect(
    page.getByRole("heading", { name: "Prima Carla" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Não convidar" }).click();
  await expect(
    page.getByRole("heading", { name: "Triagem concluída" }),
  ).toBeVisible();

  await page.goto("/convidados");
  const family = page.getByRole("link", { name: /Rita e Theo Souza/ });
  await expect(family).toBeVisible();
  await family.click();
  await page.getByLabel("WhatsApp").fill("(81) 99999-0000");
  await page.getByRole("button", { name: "Salvar" }).click();
  await expect(page).toHaveURL("/convidados");
  await expect(
    page.getByRole("link", { name: "Mensagem no WhatsApp: Rita e Theo Souza" }),
  ).toHaveAttribute("href", /^https:\/\/wa\.me\/5581999990000\?text=/);
  await page
    .getByRole("link", { name: /Rita e Theo Souza/ })
    .first()
    .click();
  await page
    .getByRole("group", { name: "Rita" })
    .getByText("Vai", { exact: true })
    .click();
  await expect(page.getByRole("dialog", { name: "Rita: Vai" })).toBeVisible();
  await page.goto("/convidados");
  await expect(page.getByText("Rita: Vai")).toBeAttached();
  await expectNoAxeViolations(page);
});
