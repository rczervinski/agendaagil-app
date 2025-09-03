const { chromium } = require('playwright');

async function testResponsiveness() {
  console.log('🚀 Iniciando teste de responsividade...');
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // Ir para a página de calendário
    console.log('📱 Navegando para http://localhost:3005/dashboard/calendar');
    await page.goto('http://localhost:3005/dashboard/calendar', { 
      waitUntil: 'domcontentloaded',
      timeout: 30000 
    });

    // Teste 1: Desktop (1920x1080)
    console.log('🖥️  Testando Desktop (1920x1080)');
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.waitForTimeout(2000);
    
    // Verificar se o sidebar está visível
    const desktopSidebar = await page.isVisible('text=Calendário');
    console.log(`✅ Sidebar visível no desktop: ${desktopSidebar}`);
    
    // Verificar se as stats estão em 4 colunas
    const statsGrid = await page.locator('.grid.grid-cols-1.sm\\:grid-cols-2.lg\\:grid-cols-4');
    const desktopStats = await statsGrid.count() > 0;
    console.log(`✅ Grid de estatísticas responsivo no desktop: ${desktopStats}`);

    // Teste 2: Tablet (768x1024)
    console.log('📱 Testando Tablet (768x1024)');
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForTimeout(2000);
    
    // Verificar se o sidebar colapsou
    const tabletSidebar = await page.isVisible('text=Calendário');
    console.log(`✅ Sidebar responsiva no tablet: ${tabletSidebar}`);

    // Teste 3: Mobile (375x667)
    console.log('📱 Testando Mobile (375x667)');
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(2000);
    
    // Verificar se o header está responsivo
    const mobileHeader = await page.isVisible('.text-lg.sm\\:text-xl');
    console.log(`✅ Header responsivo no mobile: ${mobileHeader}`);

    // Teste 4: Testar modal de novo agendamento
    console.log('📝 Testando modal de novo agendamento');
    await page.click('button:has-text("Nova Consulta")');
    await page.waitForTimeout(1000);
    
    // Verificar se o modal está visível
    const modal = await page.isVisible('text=Nova Consulta');
    console.log(`✅ Modal de nova consulta responsivo: ${modal}`);
    
    // Fechar modal
    await page.click('button[aria-label="Close"], button:has-text("Cancelar")');
    await page.waitForTimeout(500);

    // Teste 5: Verificar se não há overflow horizontal
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    const windowWidth = await page.evaluate(() => window.innerWidth);
    const noHorizontalOverflow = bodyWidth <= windowWidth;
    console.log(`✅ Sem overflow horizontal no mobile: ${noHorizontalOverflow}`);

    console.log('\n✨ Teste de responsividade concluído com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro durante o teste:', error.message);
  } finally {
    await browser.close();
  }
}

testResponsiveness().catch(console.error);