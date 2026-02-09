const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'sk-placeholder'
});

async function generateCVContent(userProfile, jobDescription) {
  const { user, employmentHistory, education, certifications, additionalInfo } = userProfile;

  const systemPrompt = `You are a professional resume/CV writer with expertise in creating ATS-friendly, compelling resumes. Your task is to generate a tailored resume based on the candidate's profile and the job description provided.

CRITICAL GUIDELINES:
1. Tailor the resume to match the job requirements precisely
2. Use strong action verbs and quantifiable achievements with metrics where possible
3. Keep it professional and impactful
4. Highlight the most relevant skills and experiences for this specific job
5. Use keywords from the job description naturally throughout
6. Do NOT fabricate information - only use and enhance what's provided
7. Generate comprehensive skills based on the candidate's experience and the job requirements

EXPERIENCE GUIDELINES:
- For the FIRST and SECOND most recent positions: Write AT LEAST 10 detailed sentences/bullet points for each. Include specific responsibilities, achievements, impact, metrics, technologies used, leadership examples, team collaborations, project outcomes, process improvements, and business results.
- For OTHER positions: Write 4-5 concise sentences/bullet points focusing on key achievements and relevant experience.

SUMMARY GUIDELINES:
- Write a compelling professional summary of 7-8 sentences
- Start with years of experience and primary expertise areas
- Highlight key technical proficiencies and domain expertise
- Mention notable achievements with quantifiable results
- Include leadership experience and team collaboration skills
- Reference industry knowledge and best practices
- Emphasize problem-solving abilities and innovative contributions
- Conclude with career goals aligned with the target position
- Include relevant keywords from the job description throughout

SKILLS GUIDELINES - VERY IMPORTANT:
- Generate AT LEAST 40 relevant skills organized by category
- Format skills as "Category: skill1, skill2, skill3, skill4, skill5" where multiple skills are comma-separated under each category
- Include these categories (customize based on job requirements):
  * Programming Languages
  * Frameworks & Libraries  
  * Cloud Technologies & Services (include specific services like AWS(Lambda, EC2, S3), Azure(Functions, CosmosDB), GCP(BigQuery, Firebase))
  * Architecture (Microservices, Event-Driven, DDD, TDD, Clean Architecture, etc.)
  * AI & ML (if relevant to the job)
  * Databases & Data Storage (SQL and NoSQL databases, Data Warehousing, Graph Databases)
  * DevOps & CI/CD (Docker, Kubernetes, Jenkins, GitLab CI/CD, Terraform, etc.)
  * Version Control & Collaboration (Git, Agile/Scrum, JIRA, Confluence)
  * Testing & Quality Assurance (Unit Testing frameworks, Integration Testing tools, Code Coverage tools)
  * Additional Skills (RESTful API, GraphQL, Security Best Practices, Performance Optimization, etc.)

OUTPUT FORMAT (JSON):
{
  "summary": "Comprehensive 7-8 sentence professional summary that covers experience, expertise, achievements, leadership, domain knowledge, problem-solving skills, and career alignment",
  "skills": [
    "Programming Languages: Java, Python, JavaScript, TypeScript, SQL, Go, Scala, Kotlin, C#, Bash",
    "Frameworks & Libraries: React, Angular, Vue.js, Spring Boot, Express, NestJS, Django, Flask",
    "Cloud Technologies & Services: AWS(Lambda, EC2, S3, RDS, CloudFormation), Azure(App Services, Functions, CosmosDB), GCP(BigQuery, Firebase, Pub/Sub)",
    "Architecture: Microservices, Event-Driven, Reactive, DDD, TDD, BDD, Clean Architecture, CQRS",
    "Databases & Data Storage: SQL(PostgreSQL, MySQL, MSSQL), NoSQL(MongoDB, Redis, Cassandra), Data Warehousing(Redshift, BigQuery)",
    "DevOps & CI/CD: Docker, Kubernetes, Helm, Jenkins, GitLab CI/CD, GitHub Actions, Terraform, Ansible",
    "Version Control & Collaboration: Git(GitHub, GitLab, Bitbucket), Agile/Scrum methodologies, JIRA, Confluence",
    "Testing & Quality Assurance: JUnit, TestNG, Mockito, Selenium, Postman, RestAssured, SonarQube, Jacoco",
    "Additional Skills: RESTful API Design, GraphQL, WebSockets, Security Best Practices(OAuth, JWT, HTTPS), CI/CD Pipeline Design"
  ],
  "experience": [
    {
      "position": "Job Title",
      "company": "Company Name",
      "location": "City, State",
      "period": "Start - End",
      "achievements": ["Achievement 1 (10+ for first two jobs, 4-5 for others)", ...]
    }
  ],
  "education": [
    {
      "degree": "Degree Name",
      "institution": "School Name",
      "graduation": "Year",
      "details": "Optional details like honors, relevant coursework"
    }
  ],
  "certifications": ["Certification Name (Issuer, Date)"],
  "additionalSections": [
    {
      "title": "Section Title",
      "content": "Content"
    }
  ]
}`;

  const userPrompt = `Generate a tailored resume for the following candidate applying to this job:

## CANDIDATE PROFILE

**Name:** ${user.full_name}
**Email:** ${user.email}
**Phone:** ${user.phone_number || 'N/A'}
**Location:** ${user.address || 'N/A'}
**LinkedIn:** ${user.linkedin_profile || 'N/A'}
**GitHub:** ${user.github_link || 'N/A'}
**Years of Experience:** ${user.experience_years || 0}

### Employment History (Listed from most recent)
${employmentHistory.map((job, index) => `
${index + 1}. **${job.position}** at **${job.company}**
   Location: ${job.location || 'N/A'}
   Period: ${job.start_date || ''} - ${job.end_date || 'Present'}
   ${index < 2 ? '(IMPORTANT: Generate AT LEAST 10 detailed bullet points for this position - include responsibilities, achievements, metrics, technologies, leadership, team collaborations, project outcomes, process improvements, and business impact)' : '(Generate 4-5 concise bullet points for this position)'}
`).join('\n')}

### Education
${education.map(edu => `
- **${edu.degree}** - ${edu.institution}
  Location: ${edu.location || 'N/A'}
  Graduation: ${edu.graduation_date || 'N/A'}
  ${edu.gpa ? `GPA: ${edu.gpa}` : ''}
`).join('\n')}

### Certifications
${certifications.map(cert => `- ${cert.name}${cert.issuer ? ` (${cert.issuer})` : ''}${cert.date_obtained ? ` - ${cert.date_obtained}` : ''}${cert.credly_link ? ` [Verified: ${cert.credly_link}]` : ''}`).join('\n')}

### Additional Information
${additionalInfo.map(info => `- ${info.category}: ${info.content}`).join('\n')}

---

## JOB DESCRIPTION

${jobDescription}

---

Generate a professional, highly tailored resume in the JSON format specified. 

CRITICAL REQUIREMENTS:
1. SUMMARY: Write exactly 7-8 sentences covering experience, expertise, achievements, leadership, domain knowledge, problem-solving, and career goals.

2. SKILLS: Generate AT LEAST 40 skills organized by category in this format:
   - "Programming Languages: Java, Python, JavaScript, TypeScript, SQL, Go, Scala, Kotlin, C#, Bash"
   - "Frameworks & Libraries: React, Angular, Vue.js, Spring Boot, Express, NestJS, Django, Flask, Next.js, Nuxt.js"
   - "Cloud Technologies & Services: AWS(Lambda, EC2, S3, RDS), Azure(App Services, Functions), GCP(BigQuery, Firebase)"
   - "Architecture: Microservices, Event-Driven, Reactive, DDD, TDD, BDD, Clean Architecture, CQRS"
   - "Databases & Data Storage: SQL(PostgreSQL, MySQL), NoSQL(MongoDB, Redis, Cassandra), Data Warehousing(Redshift)"
   - "DevOps & CI/CD: Docker, Kubernetes, Helm, Jenkins, GitLab CI/CD, GitHub Actions, Terraform, Ansible"
   - "Version Control & Collaboration: Git(GitHub, GitLab, Bitbucket), Agile/Scrum, JIRA, Confluence"
   - "Testing & Quality Assurance: JUnit, TestNG, Mockito, Selenium, Postman, SonarQube, Jacoco"
   - "Additional Skills: RESTful API, GraphQL, WebSockets, OAuth, JWT, HTTPS, Performance Optimization"

3. EXPERIENCE: First and second positions MUST have AT LEAST 10 detailed bullet points each. Other positions need 4-5 bullet points.`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.7,
      max_tokens: 4000,
      response_format: { type: 'json_object' }
    });

    const content = response.choices[0].message.content;
    return JSON.parse(content);
  } catch (error) {
    console.error('OpenAI API error:', error);
    throw new Error('Failed to generate CV content');
  }
}

async function generateCoverLetter(userProfile, jobDescription, jobTitle, companyName) {
  const { user, employmentHistory, education, certifications } = userProfile;

  const systemPrompt = `You are an expert cover letter writer. Write a compelling, professional cover letter that:
1. Opens with enthusiasm and mentions the specific position and company
2. Highlights 2-3 key qualifications that match the job requirements
3. Provides specific examples of achievements from the candidate's background
4. Shows knowledge of the company and why the candidate wants to work there
5. Closes with a strong call to action
6. Is personalized and NOT generic - avoid clichés

The cover letter should be 3-4 paragraphs, approximately 250-350 words.

OUTPUT FORMAT (JSON):
{
  "salutation": "Dear Hiring Manager,",
  "opening": "First paragraph - enthusiastic opening mentioning position and company",
  "body": "Second paragraph - key qualifications and achievements with specific examples",
  "companyFit": "Third paragraph - why this company and how you'll contribute",
  "closing": "Final paragraph - strong closing with call to action",
  "signoff": "Sincerely,",
  "fullText": "Complete cover letter as one formatted text block"
}`;

  const userPrompt = `Write a tailored cover letter for:

**Candidate:** ${user.full_name}
**Email:** ${user.email}
**Phone:** ${user.phone_number || 'N/A'}

**Applying for:** ${jobTitle || 'the position'}
**Company:** ${companyName || 'your company'}

### Candidate's Background
**Recent Experience:**
${employmentHistory.slice(0, 2).map(job => `- ${job.position} at ${job.company} (${job.start_date || ''} - ${job.end_date || 'Present'})`).join('\n')}

**Education:**
${education.slice(0, 1).map(edu => `- ${edu.degree} from ${edu.institution}`).join('\n')}

**Certifications:**
${certifications.slice(0, 3).map(cert => `- ${cert.name}`).join('\n')}

### Job Description
${jobDescription}

---

Write a compelling, personalized cover letter that connects the candidate's experience to this specific job. Make it genuine and avoid generic phrases.`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.8,
      max_tokens: 1500,
      response_format: { type: 'json_object' }
    });

    const content = response.choices[0].message.content;
    return JSON.parse(content);
  } catch (error) {
    console.error('Cover letter generation error:', error);
    throw new Error('Failed to generate cover letter');
  }
}

async function extractJobDetails(jdContent) {
  const systemPrompt = `Extract the job title and company name from the following job description. Return as JSON: {"jobTitle": "...", "companyName": "..."}. If not found, use "Not specified".`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: jdContent.substring(0, 2000) }
      ],
      temperature: 0,
      max_tokens: 100,
      response_format: { type: 'json_object' }
    });

    return JSON.parse(response.choices[0].message.content);
  } catch (error) {
    console.error('Job details extraction error:', error);
    return { jobTitle: 'Not specified', companyName: 'Not specified' };
  }
}

module.exports = { generateCVContent, generateCoverLetter, extractJobDetails };
