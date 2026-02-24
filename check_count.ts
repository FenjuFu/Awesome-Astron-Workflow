
import { workflows } from './src/types/workflow';

console.log(`Total workflows: ${workflows.length}`);
workflows.forEach((w, index) => {
    console.log(`${index + 1}. ${w.id}`);
});
