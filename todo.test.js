'use strict';

require('chromedriver');

const { Builder, By, until, Key } = require('selenium-webdriver');
const assert = require('assert');
const fs     = require('fs');
const path   = require('path');

const BASE_URL   = 'http://127.0.0.1:5500';
const LOGIN_URL  = `${BASE_URL}/login.html`;
const TIMEOUT    = 15000;
const SCREENSHOT = path.join(__dirname, 'screenshots');

const VALID_USER = 'admin';
const VALID_PASS = '1234';

if (!fs.existsSync(SCREENSHOT)) fs.mkdirSync(SCREENSHOT, { recursive: true });

async function takeScreenshot(driver, name) {
  const img  = await driver.takeScreenshot();
  const file = path.join(SCREENSHOT, `${name}.png`);
  fs.writeFileSync(file, img, 'base64');
}

async function buildDriver() {
  console.log('🚀 Creando driver...');
  const driver = await new Builder().forBrowser('chrome').build();
  console.log('✅ Driver creado');
  return driver;
}

async function doLogin(driver, user = VALID_USER, pass = VALID_PASS) {
  await driver.get(LOGIN_URL);
  await driver.findElement(By.id('username')).sendKeys(user);
  await driver.findElement(By.id('password')).sendKeys(pass);
  await driver.findElement(By.id('btn-login')).click();
}

async function waitForDashboard(driver) {
  await driver.wait(until.elementLocated(By.id('stat-total')), TIMEOUT);
}

async function fillTaskForm(driver, title, priority = 'media', description = '') {
  await driver.findElement(By.id('btn-new-task')).click();
  await driver.wait(until.elementLocated(By.id('task-title')), TIMEOUT);
  if (title) await driver.findElement(By.id('task-title')).sendKeys(title);
  if (description) await driver.findElement(By.id('task-description')).sendKeys(description);
  const sel = await driver.findElement(By.id('task-priority'));
  await sel.findElement(By.css(`option[value="${priority}"]`)).click();
}

// ══════════════════════════════════════════════
// HU-01 — Login exitoso
// ══════════════════════════════════════════════
describe('HU-01: Login exitoso', function () {
  this.timeout(TIMEOUT * 2);
  let driver;

  beforeEach(async () => { driver = await buildDriver(); });
  afterEach(async ()  => { if (driver) await driver.quit(); });

  it('✅ Camino feliz: login correcto redirige al dashboard', async () => {
    await doLogin(driver);
    await waitForDashboard(driver);
    const url = await driver.getCurrentUrl();
    await takeScreenshot(driver, 'HU01-camino-feliz');
    assert.ok(url.includes('index.html'));
  });

  it('🔲 Límites: contraseña de un carácter es rechazada', async () => {
    await driver.get(LOGIN_URL);
    await driver.findElement(By.id('username')).sendKeys('admin');
    await driver.findElement(By.id('password')).sendKeys('1');
    await driver.findElement(By.id('btn-login')).click();
    await driver.sleep(800);
    const err = await driver.findElement(By.id('login-error'));
    await takeScreenshot(driver, 'HU01-limite-password-corto');
    assert.strictEqual(await err.isDisplayed(), true);
  });
});

// ══════════════════════════════════════════════
// HU-02 — Login fallido
// ══════════════════════════════════════════════
describe('HU-02: Login fallido', function () {
  this.timeout(TIMEOUT * 2);
  let driver;

  beforeEach(async () => { driver = await buildDriver(); });
  afterEach(async ()  => { if (driver) await driver.quit(); });

  it('❌ Negativa: credenciales incorrectas muestran error', async () => {
    await driver.get(LOGIN_URL);
    await driver.findElement(By.id('username')).sendKeys('fake');
    await driver.findElement(By.id('password')).sendKeys('fake');
    await driver.findElement(By.id('btn-login')).click();
    await driver.sleep(800);
    const err = await driver.findElement(By.id('login-error'));
    await takeScreenshot(driver, 'HU02-negativa-credenciales-malas');
    assert.strictEqual(await err.isDisplayed(), true);
  });

  it('🔲 Límites: campos vacíos no permiten avanzar', async () => {
    await driver.get(LOGIN_URL);
    await driver.findElement(By.id('btn-login')).click();
    await driver.sleep(600);
    const err = await driver.findElement(By.id('login-error'));
    await takeScreenshot(driver, 'HU02-limite-campos-vacios');
    assert.strictEqual(await err.isDisplayed(), true);
  });
});

// ══════════════════════════════════════════════
// HU-03 — Crear tarea
// ══════════════════════════════════════════════
describe('HU-03: Crear tarea', function () {
  this.timeout(TIMEOUT * 3);
  let driver;

  beforeEach(async () => {
    driver = await buildDriver();
    await doLogin(driver);
    await waitForDashboard(driver);
  });
  afterEach(async () => { if (driver) await driver.quit(); });

  it('✅ Camino feliz: crear tarea correctamente', async () => {
    await fillTaskForm(driver, 'Tarea Selenium', 'alta');
    await driver.findElement(By.css('#task-form button[type="submit"]')).click();
    await driver.sleep(800);
    const cards = await driver.findElements(By.css('.task-card'));
    await takeScreenshot(driver, 'HU03-camino-feliz-crear');
    assert.ok(cards.length >= 1);
  });

  it('❌ Negativa: no debe crear tarea sin título', async () => {
    await driver.findElement(By.id('btn-new-task')).click();
    await driver.wait(until.elementLocated(By.id('task-title')), TIMEOUT);
    const sel = await driver.findElement(By.id('task-priority'));
    await sel.findElement(By.css('option[value="media"]')).click();
    await driver.findElement(By.css('#task-form button[type="submit"]')).click();
    await driver.sleep(500);
    const errTitle = await driver.findElement(By.id('err-title'));
    await takeScreenshot(driver, 'HU03-negativa-sin-titulo');
    assert.strictEqual(await errTitle.isDisplayed(), true);
  });

  it('🔲 Límites: título de 80 caracteres es aceptado', async () => {
    await fillTaskForm(driver, 'A'.repeat(80), 'baja');
    await driver.findElement(By.css('#task-form button[type="submit"]')).click();
    await driver.sleep(800);
    const cards = await driver.findElements(By.css('.task-card'));
    await takeScreenshot(driver, 'HU03-limite-80-caracteres');
    assert.ok(cards.length >= 1);
  });
});

// ══════════════════════════════════════════════
// HU-04 — Editar tarea
// ══════════════════════════════════════════════
describe('HU-04: Editar tarea', function () {
  this.timeout(TIMEOUT * 3);
  let driver;

  beforeEach(async () => {
    driver = await buildDriver();
    await doLogin(driver);
    await waitForDashboard(driver);
    await fillTaskForm(driver, 'Tarea base', 'media');
    await driver.findElement(By.css('#task-form button[type="submit"]')).click();
    await driver.sleep(800);
  });
  afterEach(async () => { if (driver) await driver.quit(); });

  it('✅ Camino feliz: editar título de tarea existente', async () => {
    await driver.findElement(By.css('[data-edit]')).click();
    const input = await driver.findElement(By.id('task-title'));
    await input.clear();
    await input.sendKeys('Editada por Selenium');
    await driver.findElement(By.css('#task-form button[type="submit"]')).click();
    await driver.sleep(800);
    const text = await driver.findElement(By.css('.task-title')).getText();
    await takeScreenshot(driver, 'HU04-camino-feliz-editar');
    assert.ok(text.includes('Editada por Selenium'));
  });

  it('❌ Negativa: borrar título al editar muestra error', async () => {
    await driver.findElement(By.css('[data-edit]')).click();
    await driver.wait(until.elementLocated(By.id('task-title')), TIMEOUT);
    const input = await driver.findElement(By.id('task-title'));
    await input.sendKeys(Key.CONTROL + 'a');
    await input.sendKeys(Key.BACK_SPACE);
    await driver.findElement(By.css('#task-form button[type="submit"]')).click();
    await driver.sleep(500);
    const errTitle = await driver.findElement(By.id('err-title'));
    await takeScreenshot(driver, 'HU04-negativa-titulo-vacio');
    assert.strictEqual(await errTitle.isDisplayed(), true);
  });

  it('🔲 Límites: cambiar prioridad a alta refleja el cambio', async () => {
    await driver.findElement(By.css('[data-edit]')).click();
    await driver.wait(until.elementLocated(By.id('task-priority')), TIMEOUT);
    const sel = await driver.findElement(By.id('task-priority'));
    await sel.findElement(By.css('option[value="alta"]')).click();
    await driver.findElement(By.css('#task-form button[type="submit"]')).click();
    await driver.sleep(800);
    const badge = await driver.findElement(By.css('.tag-alta'));
    await takeScreenshot(driver, 'HU04-limite-prioridad-alta');
    assert.strictEqual(await badge.isDisplayed(), true);
  });
});

// ══════════════════════════════════════════════
// HU-05 — Eliminar tarea
// ══════════════════════════════════════════════
describe('HU-05: Eliminar tarea', function () {
  this.timeout(TIMEOUT * 3);
  let driver;

  beforeEach(async () => {
    driver = await buildDriver();
    await doLogin(driver);
    await waitForDashboard(driver);
    await fillTaskForm(driver, 'Eliminar', 'baja');
    await driver.findElement(By.css('#task-form button[type="submit"]')).click();
    await driver.sleep(800);
  });
  afterEach(async () => { if (driver) await driver.quit(); });

  it('✅ Camino feliz: eliminar tarea la quita de la lista', async () => {
    const before = await driver.findElements(By.css('.task-card'));
    await driver.findElement(By.css('[data-delete]')).click();
    await driver.switchTo().alert().accept();
    await driver.sleep(800);
    const after = await driver.findElements(By.css('.task-card'));
    await takeScreenshot(driver, 'HU05-camino-feliz-eliminar');
    assert.strictEqual(after.length, before.length - 1);
  });

  it('❌ Negativa: cancelar el diálogo NO elimina la tarea', async () => {
    const before = await driver.findElements(By.css('.task-card'));
    await driver.findElement(By.css('[data-delete]')).click();
    await driver.switchTo().alert().dismiss();
    await driver.sleep(500);
    const after = await driver.findElements(By.css('.task-card'));
    await takeScreenshot(driver, 'HU05-negativa-cancelar-eliminar');
    assert.strictEqual(after.length, before.length);
  });

  it('🔲 Límites: eliminar la única tarea muestra estado vacío', async () => {
    await driver.findElement(By.css('[data-delete]')).click();
    await driver.switchTo().alert().accept();
    await driver.sleep(800);
    const empty = await driver.findElements(By.css('.empty-state'));
    await takeScreenshot(driver, 'HU05-limite-lista-vacia');
    assert.ok(empty.length >= 1);
  });
});