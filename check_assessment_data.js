import database from './server/config/database.js';

async function checkData() {
  try {
    const sql = 'SELECT id, overall_score, dimension_scores, insights FROM assessments WHERE id = @param1';
    const result = await database.query(sql, [40]);
    
    const assessment = result.recordset[0];
    
    console.log('📊 Assessment ID 40 Database Content:\n');
    console.log('Overall Score:', assessment.overall_score);
    console.log('\nDimension Scores (raw):');
    console.log(typeof assessment.dimension_scores, '|', assessment.dimension_scores?.substring(0, 200));
    
    console.log('\nInsights (raw):');
    console.log(typeof assessment.insights, '|', assessment.insights?.substring(0, 200));
    
    if (typeof assessment.dimension_scores === 'string') {
      const parsed = JSON.parse(assessment.dimension_scores);
      console.log('\n✅ Parsed dimension_scores:');
      console.log(parsed);
    }
    
    if (typeof assessment.insights === 'string') {
      const parsed = JSON.parse(assessment.insights);
      console.log('\n✅ Parsed insights keys:', Object.keys(parsed));
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

checkData();
