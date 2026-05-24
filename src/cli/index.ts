import { Command } from 'commander';

const program = new Command();

program.name('skillrunner').description('BKPilot Skill Runner Engine CLI').version('0.0.0');

program
  .command('execute')
  .description('Executa uma skill a partir de um execution-input.json')
  .requiredOption('--skill <id>', 'ID da skill (ex: usabilidade)')
  .requiredOption('--input <path>', 'Caminho para execution-input.json')
  .action(() => {
    // Stub — wiring e Runner.run() entram na 06-maia-implementacao
    console.log('Skill Runner Engine: comando execute ainda não implementado (harness/bootstrap).');
    process.exit(0);
  });

program.parse();
