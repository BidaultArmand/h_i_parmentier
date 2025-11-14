import 'dotenv/config';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PRODUCT_FILE = path.resolve(__dirname, '../../data/product_to_search.json');
const API_URL = process.env.CHAT_TEST_URL || `http://localhost:${process.env.PORT || 5000}/api/chat`;

const defaultMessage = 'Peux-tu me suggérer quelques produits pour préparer un curry de légumes abordable ?';
const userMessage = process.argv.slice(2).join(' ') || defaultMessage;

const run = async () => {
  console.log('✨ Envoi d’un test suggest_products vers', API_URL);
  console.log('📝 Message utilisé :', userMessage);

  const payload = { message: userMessage };

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  const result = await response.json();

  console.log('\n📬 Réponse HTTP:', response.status);
  console.log('✅ Succès:', result.success);
  console.log('🤖 Action détectée:', result.action?.action);
  console.dir(result.action, { depth: null });

  try {
    const content = await fs.readFile(PRODUCT_FILE, 'utf-8');
    const entries = content.trim() ? JSON.parse(content) : [];
    const lastEntry = entries[entries.length - 1];

    console.log('\n🗃️ Fichier product_to_search.json mis à jour.');
    console.log('Dernière entrée enregistrée:');
    console.dir(lastEntry, { depth: null });
  } catch (fileError) {
    console.warn('\n⚠️ Impossible de lire product_to_search.json:', fileError.message);
  }
};

run().catch((error) => {
  console.error('❌ Test suggest_products échoué:', error);
  process.exit(1);
});
