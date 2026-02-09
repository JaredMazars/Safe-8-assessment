import database from './server/config/database.js';

async function checkRecentAssessments() {
  try {
    console.log('Querying database...\n');
    
    const sql = `
      SELECT TOP 10 
        a.id, 
        a.lead_id, 
        a.assessment_type,
        a.overall_score,
        a.completed_at,
        l.contact_name,
        l.email,
        LEN(a.dimension_scores) as dimension_scores_length,
        a.dimension_scores
      FROM assessments a
      LEFT JOIN leads l ON a.lead_id = l.id
      ORDER BY a.id DESC
    `;
    
    const result = await database.query(sql);
    
    console.log('📊 Recent Assessments:\n');
    
    // database.query returns recordset directly when no params
    const assessments = Array.isArray(result) ? result : result.recordset;
    
    assessments.forEach(assessment => {
      console.log(`ID: ${assessment.id}`);
      console.log(`  User: ${assessment.contact_name} (ID: ${assessment.lead_id})`);
      console.log(`  Email: ${assessment.email}`);
      console.log(`  Type: ${assessment.assessment_type}`);
      console.log(`  Score: ${assessment.overall_score}%`);
      console.log(`  Completed: ${assessment.completed_at}`);
      console.log(`  dimension_scores length: ${assessment.dimension_scores_length} chars`);
      
      // Try to parse dimension_scores
      let scores = [];
      if (assessment.dimension_scores) {
        try {
          scores = JSON.parse(assessment.dimension_scores);
          console.log(`  Pillars: ${scores.length} items`);
          if (scores.length > 0) {
            scores.slice(0, 3).forEach(s => {
              console.log(`    - ${s.pillar || s.dimension || 'Unknown'}: ${s.score}%`);
            });
            if (scores.length > 3) console.log(`    ... and ${scores.length - 3} more`);
          } else {
            console.log(`  ⚠️ EMPTY ARRAY`);
          }
        } catch (e) {
          console.log(`  ❌ Parse error: ${e.message}`);
        }
      } else {
        console.log(`  ❌ NULL dimension_scores`);
      }
      console.log('');
    });
    
    process.exit(0);
    
  } catch (error) {
    console.error('Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

checkRecentAssessments();
