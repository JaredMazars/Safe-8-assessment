import { generateAppDocumentationPDF } from './server/services/appDocumentationPdfService.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const outputPath = path.join(__dirname, `SAFE8_Documentation_${new Date().toISOString().split('T')[0]}.pdf`);

console.log('🔧 Generating SAFE-8 Documentation PDF...');
console.log(`📁 Output: ${outputPath}`);

generateAppDocumentationPDF(outputPath)
  .then(() => {
    console.log('✅ Documentation PDF generated successfully!');
    console.log(`📄 File: ${outputPath}`);
  })
  .catch(err => {
    console.error('❌ Error generating documentation:', err);
    process.exit(1);
  });
