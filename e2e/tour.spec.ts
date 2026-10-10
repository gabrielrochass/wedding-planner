import { expect, type Page, test } from "@playwright/test";
import { expectNoAxeViolations } from "./axe";

function dialog(page: Page) {
  return page.getByRole("dialog");
}

async function fresh(page: Page, name: string, next = "/") {
  await page.goto(
    `/dev/entrar?as=${name}&tours=1&next=${encodeURIComponent(next)}`,
  );
}

test("the general tour leads into the page tour and is not shown again", async ({
  page,
}, testInfo) => {
  await fresh(page, `tour-${testInfo.project.name}`);
  await expect(dialog(page)).toHaveAccessibleName("Boas-vindas ao Dois em Um");
  await expect(page.getByRole("button", { name: "Próximo" })).toBeFocused();
  await expectNoAxeViolations(page);

  await page.getByRole("button", { name: "Próximo" }).click();
  await expect(dialog(page)).toHaveAccessibleName("Início, o resumo de tudo");
  await page.keyboard.press("ArrowLeft");
  await expect(dialog(page)).toHaveAccessibleName("Boas-vindas ao Dois em Um");

  for (let step = 0; step < 12; step++) {
    const next = page.getByRole("button", { name: /Próximo|Concluir/ });
    if (!(await next.isVisible())) break;
    await next.click();
  }
  await expect(dialog(page)).toHaveAccessibleName("Prontos para começar");
  await page.getByRole("button", { name: "Ver o tour de Início" }).click();
  await expect(dialog(page)).toHaveAccessibleName("Contagem até o sim");
  await expectNoAxeViolations(page);
  await page.keyboard.press("Escape");
  await expect(dialog(page)).toHaveCount(0);
  await page.waitForLoadState("networkidle");

  await page.reload();
  await expect(page.getByRole("heading", { name: "Início" })).toBeVisible();
  await page.waitForTimeout(800);
  await expect(dialog(page)).toHaveCount(0);

  await page.goto("/tarefas");
  await expect(dialog(page)).toHaveAccessibleName("Quanto já foi feito");
  await page.getByRole("button", { name: "Pular" }).click();
  await expect(dialog(page)).toHaveCount(0);
  await page.waitForLoadState("networkidle");

  await page.reload();
  await page.waitForTimeout(800);
  await expect(dialog(page)).toHaveCount(0);
  await page.getByRole("link", { name: "Como funciona esta tela" }).click();
  await expect(dialog(page)).toHaveAccessibleName("Quanto já foi feito");
  await page.keyboard.press("Escape");
  await expect(dialog(page)).toHaveCount(0);
  await expect(page).toHaveURL("/tarefas");
});

test("every page tour opens with its first step", async ({
  page,
}, testInfo) => {
  await fresh(page, `abas-${testInfo.project.name}`, "/ajustes");
  await expect(dialog(page)).toHaveAccessibleName("Boas-vindas ao Dois em Um");
  await page.keyboard.press("Escape");

  const pages: [string, string][] = [
    ["/ajustes", "Casamento e equipe"],
    ["/orcamento", "O resumo"],
    ["/fornecedores", "Comecem por aqui"],
    ["/convidados", "Comecem a lista"],
    ["/mais", "O que não cabe na barra"],
    ["/equipe", "Quem está no casamento"],
    ["/ideias", "O moodboard"],
    ["/musicas", "Momentos com música"],
    ["/cortejo", "Quem entra com vocês"],
    ["/cronograma", "O roteiro do dia"],
    ["/enxoval", "Comecem pela lista sugerida"],
  ];
  for (const [path, title] of pages) {
    await page.goto(`${path}?tour=1`);
    await expect(dialog(page)).toHaveAccessibleName(title);
    await page.keyboard.press("Escape");
    await expect(dialog(page)).toHaveCount(0);
  }
});

test("the page tours can be replayed from Ajustes", async ({
  page,
}, testInfo) => {
  await fresh(page, `rever-${testInfo.project.name}`, "/ajustes");
  await expect(dialog(page)).toHaveAccessibleName("Boas-vindas ao Dois em Um");
  await page.keyboard.press("Escape");
  await expect(dialog(page)).toHaveAccessibleName("Casamento e equipe");
  await page.keyboard.press("Escape");
  await expect(dialog(page)).toHaveCount(0);
  await page.emulateMedia({ colorScheme: "dark" });
  await page.getByRole("button", { name: /Rever os tours das abas/ }).click();
  await expect(page).toHaveURL("/");
  await expect(dialog(page)).toHaveAccessibleName("Contagem até o sim");
  await expectNoAxeViolations(page);
});

test("the tour fits a 320px screen", async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 320, height: 640 });
  await fresh(page, `estreito-${testInfo.project.name}`);
  await page.getByRole("button", { name: "Próximo" }).click();
  await expect(dialog(page)).toHaveAccessibleName("Início, o resumo de tudo");
  await expect
    .poll(async () => {
      const box = await dialog(page).boundingBox();
      return box ? [box.x >= 0, box.x + box.width <= 320] : [];
    })
    .toEqual([true, true]);
  await page.keyboard.press("Escape");
});
