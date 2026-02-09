# PDF Email & Export Implementation

## Overview
This document describes the implementation of PDF generation and email delivery for assessment results, plus PDF export functionality in the admin dashboard.

## Features Implemented

### 1. **Automated Email Delivery After Assessment Completion**
When a user completes an assessment, they automatically receive an email with:
- Professional PDF report with Forvis Mazars branding
- Assessment results and scores
- Dimension breakdowns and insights
- Personalized recommendations

**Technical Implementation:**
- **File:** `server/routes/lead.js`
- **Line:** 232-244
- **Function:** `sendAssessmentResults(leadExists, assessmentData)`
- **Email Service:** Gmail SMTP (jaredmoodley1212@gmail.com)
- **PDF Library:** pdfkit v0.17.2

### 2. **Admin Dashboard - Assessment Export**
Admins can now export individual assessments as PDF from the Assessments tab.

**Location:** Admin Dashboard → Assessments Tab
**Button:** "Export" (green button with PDF icon)
**Functionality:**
- Generates professional PDF report
- Downloads to browser
- Filename format: `SAFE-8_Assessment_[Username]_[ID].pdf`

**API Endpoint:**
```
GET /api/admin/assessments/:assessmentId/export-pdf
Authorization: Bearer [admin_token]
Response: application/pdf (binary)
```

### 3. **Admin Dashboard - User Assessment Export**
Admins can export PDFs when viewing a user's assessment history.

**Location:** Admin Dashboard → Users Tab → View Assessments (per user)
**Button:** "Export PDF" (blue button with PDF icon)
**Functionality:**
- Same as assessment export
- Accessible from user assessment modal

## Code Changes

### Backend Changes

#### 1. `server/routes/lead.js`
```javascript
// Line 6: Added import
import { sendWelcomeEmail, sendPasswordResetEmail, sendAssessmentResults } from '../services/emailService.js';

// Line 232-244: Email delivery after assessment completion
try {
  const emailResult = await sendAssessmentResults(leadExists, {
    overall_score: parseFloat(overall_score),
    dimension_scores: pillar_scores || [],
    insights: JSON.parse(insights_json),
    assessment_type: assessment_type.toUpperCase(),
    completed_at: new Date()
  });
  
  if (emailResult.success) {
    logger.info('Assessment results email sent', { email: leadExists.email });
  } else {
    logger.warn('Email send failed (non-critical)', { error: emailResult.error });
  }
} catch (emailError) {
  logger.warn('Email service error (continuing)', { error: emailError.message });
}
```

#### 2. `server/routes/admin.js`
```javascript
// Line 11: Added import
import { generateAssessmentPDFBuffer } from '../services/pdfService.js';

// Lines 1905-1974: New PDF export endpoint
router.get('/assessments/:assessmentId/export-pdf', authenticateAdmin, async (req, res) => {
  // Fetches assessment data
  // Generates PDF buffer
  // Returns PDF as download
});
```

### Frontend Changes

#### 1. `src/components/AdminDashboard.jsx`
```javascript
// Lines 459-485: New export handler function
const handleExportAssessmentPDF = async (assessmentId, userName) => {
  try {
    const response = await api.get(`/api/admin/assessments/${assessmentId}/export-pdf`, {
      responseType: 'blob'
    });

    const blob = new Blob([response.data], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `SAFE-8_Assessment_${userName.replace(/\s+/g, '_')}_${assessmentId}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (err) {
    console.error('❌ Error exporting PDF:', err);
    alert('Failed to export PDF: ' + (err.response?.data?.message || err.message));
  }
};

// Lines 1424-1434: Export button in Assessments table
<button
  onClick={() => handleExportAssessmentPDF(assessment.id, assessment.user_name)}
  className="btn-action btn-export"
  title="Export as PDF"
>
  <i className="fas fa-file-pdf"></i>
  <span>Export</span>
</button>

// Lines 3026-3033: Export button in UserAssessmentsModal
<button
  onClick={() => onExportPDF(assessment.id, user.full_name)}
  className="btn-primary btn-sm"
  style={{ marginLeft: '10px' }}
>
  <i className="fas fa-file-pdf"></i> Export PDF
</button>

// Line 2213: Pass export handler to modal
onExportPDF={handleExportAssessmentPDF}

// Line 2918: Update modal signature
const UserAssessmentsModal = ({ user, assessments, loading, onClose, onViewDetails, onExportPDF }) => {
```

#### 2. `src/App.css`
```css
/* Lines 5021-5029: Export button styling */
.btn-export {
  background: #28a745;
  color: var(--white);
  box-shadow: 0 2px 4px rgba(40, 167, 69, 0.15);
}

.btn-export:hover {
  background: #218838;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(40, 167, 69, 0.3);
}
```

## Existing Services (Already Implemented)

### PDF Service (`server/services/pdfService.js`)
- **Total Lines:** 760
- **Main Function:** `generateAssessmentPDFBuffer(userData, assessmentData)`
- **Features:**
  - Multi-page professional reports
  - Forvis Mazars branding (colors, logo, styling)
  - Executive summary
  - Overall score with category (AI Leader, Adopter, Explorer, Starter)
  - Pillar performance breakdown with progress bars
  - Dimension-specific insights
  - Personalized recommendations

**Branding Colors:**
- Primary Blue: `#00539F`
- Secondary Red: `#E31B23`
- Accent Orange: `#F7941D`

### Email Service (`server/services/emailService.js`)
- **Total Lines:** 1027
- **Main Function:** `sendAssessmentResults(userData, assessmentData)`
- **Features:**
  - HTML email templates with Forvis Mazars branding
  - PDF attachment generation
  - Nodemailer integration
  - Gmail SMTP configuration
  - Error handling and logging

**Email Configuration (from .env):**
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=jaredmoodley1212@gmail.com
SMTP_PASS=egwo becy ycxu apbn
```

## Testing

### Test Email Delivery
1. Complete an assessment as a user
2. Check email inbox for "SAFE-8 Assessment Results" email
3. Verify PDF attachment is included
4. Verify PDF opens correctly with assessment data

### Test Admin Export - Assessments Tab
1. Log in as admin
2. Navigate to Assessments tab
3. Click "Export" button on any assessment
4. Verify PDF downloads with correct filename
5. Verify PDF contains correct assessment data

### Test Admin Export - Users Tab
1. Log in as admin
2. Navigate to Users tab
3. Click "View" on any user with assessments
4. In the modal, click "Export PDF" on any assessment
5. Verify PDF downloads correctly

## Dependencies

### Backend
```json
{
  "pdfkit": "^0.17.2",
  "nodemailer": "^7.0.12"
}
```

### Email Account
- **Provider:** Gmail
- **Email:** jaredmoodley1212@gmail.com
- **App Password:** egwo becy ycxu apbn (configured in .env)

## Error Handling

### Email Sending Errors
- Non-critical: Assessment saves even if email fails
- Logged as warnings in server logs
- Does not block user flow

### PDF Export Errors
- Returns 500 status with error message
- Frontend displays alert to user
- Admin can retry export

## Future Enhancements
1. Batch PDF export for multiple assessments
2. Email customization options
3. PDF report customization (logo upload, color schemes)
4. Scheduled email delivery
5. Email templates for different assessment types
6. PDF watermarking
7. Export to other formats (Excel, CSV)

## Notes
- PDF generation uses in-memory buffers (no temporary files)
- Email delivery is asynchronous and non-blocking
- All admin export operations require authentication
- PDF filenames are sanitized (spaces replaced with underscores)
- Mobile responsive: Export buttons work on all screen sizes
