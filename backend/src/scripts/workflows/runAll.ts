import { execSync } from 'child_process';
import { formatWorkflowError } from './workflowError';

function runCommand(command: string) {
  console.log(`\n--- Running: ${command}`);
  try {
    execSync(command, { stdio: 'inherit', env: process.env });
  } catch (commandError: unknown) {
    console.error('Command failed:', command);
    console.error(formatWorkflowError(commandError));
    throw commandError;
  }
}

function main() {
  const tsNodeCommand = 'npx ts-node';
  runCommand(`${tsNodeCommand} src/scripts/workflows/clientWorkflow.ts`);
  runCommand(`${tsNodeCommand} src/scripts/workflows/restaurateurWorkflow.ts`);
  runCommand(`${tsNodeCommand} src/scripts/workflows/courierWorkflow.ts`);
}

void main();
