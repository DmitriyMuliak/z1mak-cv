import { execa } from 'execa';

try {
  await execa('npx', ['lint-staged'], { stdio: 'inherit' });
} catch (err) {
  process.exit(err.exitCode || 1);
}
