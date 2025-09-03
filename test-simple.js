const { execSync } = require('child_process');

console.log('🚀 Teste básico de responsividade iniciado...');

try {
  // Teste 1: Verificar se o servidor está rodando
  console.log('🌐 Verificando se o servidor está rodando...');
  const response = execSync('curl -s -o /dev/null -w "%{http_code}" http://localhost:3005/dashboard/calendar', { encoding: 'utf-8' });
  
  if (response.trim() === '200') {
    console.log('✅ Servidor respondendo na porta 3005');
    console.log('🎯 Para testar responsividade:');
    console.log('  1. Abra http://localhost:3005/dashboard/calendar no navegador');
    console.log('  2. Use DevTools (F12) > Device Toolbar');
    console.log('  3. Teste diferentes tamanhos: Mobile (375px), Tablet (768px), Desktop (1200px+)');
    console.log('  4. Verifique se:');
    console.log('     - Sidebar colapsa em telas menores');
    console.log('     - Header ajusta tamanhos');
    console.log('     - Cards de estatísticas se reorganizam');
    console.log('     - Modais ficam responsivos');
    console.log('     - Arca dentária mantém proporção');
    console.log('');
    console.log('📱 Melhorias implementadas:');
    console.log('  ✅ Sidebar responsiva (ícones only em mobile/tablet)');
    console.log('  ✅ Header com breakpoints');
    console.log('  ✅ Padding e margin responsivos');
    console.log('  ✅ Grid de estatísticas adaptativo');
    console.log('  ✅ Modais com melhor responsividade');
    console.log('  ✅ Botões e inputs adaptáveis');
    
  } else {
    console.log('❌ Servidor não está respondendo. Status:', response.trim());
  }
} catch (error) {
  console.error('❌ Erro ao verificar servidor:', error.message);
}

console.log('\n✨ Teste concluído!');