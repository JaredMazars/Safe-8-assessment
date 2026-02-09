import Assessment from './server/models/Assessment.js';
import logger from './server/utils/logger.js';

async function testCalculation() {
  try {
    console.log('Testing Assessment.calculateDimensionScores...\n');
    
    // Test with user 66, CORE assessment
    const result = await Assessment.calculateDimensionScores(66, 'CORE', false);
    
    console.log('✅ Calculation successful!');
    console.log(`Found ${result.length} pillars:\n`);
    
    result.forEach(pillar => {
      console.log(`  ${pillar.pillar_name || pillar.pillar_short_name}: ${pillar.score}%`);
      console.log(`    Questions: ${pillar.answered_questions}/${pillar.total_questions}`);
      console.log(`    Completion: ${pillar.completion_rate}%\n`);
    });
    
    console.log('\nTesting Assessment.calculateWeightedScore...\n');
    
    const weighted = await Assessment.calculateWeightedScore(66, 'CORE');
    
    console.log('✅ Weighted calculation successful!');
    console.log(`Overall Score: ${weighted.overall_score}%`);
    console.log(`Dimension Scores: ${weighted.dimension_scores.length} pillars`);
    console.log(`Weights Applied: ${weighted.weights_applied}\n`);
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

testCalculation();
