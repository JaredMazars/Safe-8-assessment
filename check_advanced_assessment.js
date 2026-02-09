import database from './server/config/database.js';

async function checkAdvancedAssessment() {
  try {
    const sql = `
      SELECT id, lead_id, assessment_type, overall_score, 
             dimension_scores, insights, responses
      FROM assessments 
      WHERE assessment_type = 'Advanced' 
      ORDER BY id DESC
    `;
    
    const result = await database.query(sql, []);
    
    if (!result.recordset || result.recordset.length === 0) {
      console.log('❌ No Advanced assessments found in database');
      process.exit(0);
    }
    
    const assessment = result.recordset[0];
    
    console.log('📊 Latest Advanced Assessment (ID:', assessment.id, ')\n');
    console.log('Overall Score:', assessment.overall_score);
    console.log('\nDimension Scores:');
    console.log('  Type:', typeof assessment.dimension_scores);
    console.log('  Value:', assessment.dimension_scores);
    
    if (assessment.dimension_scores) {
      const parsed = JSON.parse(assessment.dimension_scores);
      console.log('  Parsed Length:', parsed.length);
      console.log('  Parsed Content:', parsed);
    }
    
    console.log('\nResponses:');
    console.log('  Type:', typeof assessment.responses);
    if (assessment.responses) {
      const responses = JSON.parse(assessment.responses);
      console.log('  Count:', Object.keys(responses).length, 'responses');
      console.log('  Sample:', Object.keys(responses).slice(0, 3));
    }
    
    // Check what questions are for Advanced
    const questionSql = `
      SELECT DISTINCT pillar_name, pillar_short_name, COUNT(*) as question_count
      FROM questions
      WHERE assessment_type = 'Advanced'
      GROUP BY pillar_name, pillar_short_name
      ORDER BY pillar_name
    `;
    
    const questionsResult = await database.query(questionSql);
    console.log('\n📚 Advanced Assessment Pillars:');
    questionsResult.recordset.forEach(p => {
      console.log(`  - ${p.pillar_name} (${p.pillar_short_name}): ${p.question_count} questions`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

checkAdvancedAssessment();
