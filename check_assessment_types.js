import database from './server/config/database.js';

async function checkTypes() {
  try {
    const sql = 'SELECT DISTINCT assessment_type, COUNT(*) as count FROM assessments GROUP BY assessment_type';
    const result = await database.query(sql);

    console.log('📊 Assessment Types in Database:\n');
    result.recordset.forEach(r => {
      console.log(`  Type: "${r.assessment_type}" | Count: ${r.count}`);
    });

    // Get latest assessment
    const latestSql = 'SELECT TOP 3 id, assessment_type, overall_score, dimension_scores FROM assessments ORDER BY id DESC';
    const latest = await database.query(latestSql);
    
    console.log('\n📋 Latest Assessments:');
    latest.recordset.forEach(a => {
      console.log(`\n  ID: ${a.id}`);
      console.log(`  Type: "${a.assessment_type}"`);
      console.log(`  Score: ${a.overall_score}`);
      const dimScores = a.dimension_scores || '';
      console.log(`  Dimension Scores: ${dimScores.substring(0, 50)}...`);
    });

    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

checkTypes();
