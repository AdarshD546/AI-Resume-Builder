import { useState, useRef } from 'react'
import html2pdf from "html2pdf.js";
import './App.css'

function App() {
  const resumeRef = useRef();
  const [showForm, setShowForm] = useState(false)
  const [showResume, setShowResume] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)

  const [resumeData, setResumeData] = useState({
    name: '',
    email: '',
    phone: '',
    location: '',
    summary: '',
    education: '',
    skills: '',
    experience: '',
    projects: '',
    jobDescription: ''
  })

  const handleChange = (e) => {
    setResumeData({
      ...resumeData,
      [e.target.name]: e.target.value
    })
  }

  const calculateATSScore = () => {
    let score = 0;

    // 1. Contact Information — 15 points
    if (resumeData.name.trim()) score += 5;
    if (resumeData.email.trim()) score += 5;
    if (resumeData.phone.trim()) score += 5;

    // 2. Professional Summary — 15 points
    const summaryWords = resumeData.summary
      .trim()
      .split(/\s+/)
      .filter(Boolean);

    if (summaryWords.length >= 20) {
      score += 15;
    } else if (summaryWords.length >= 10) {
      score += 10;
    } else if (summaryWords.length > 0) {
      score += 5;
    }

    // 3. Education — 10 points
    const educationWords = resumeData.education
      .trim()
      .split(/\s+/)
      .filter(Boolean);

    if (educationWords.length >= 8) {
      score += 10;
    } else if (educationWords.length > 0) {
      score += 5;
    }

    // 4. Skills — 15 points
    const skills = resumeData.skills
      .split(",")
      .map(skill => skill.trim())
      .filter(Boolean);

    if (skills.length >= 8) {
      score += 15;
    } else if (skills.length >= 5) {
      score += 12;
    } else if (skills.length >= 3) {
      score += 8;
    } else if (skills.length > 0) {
      score += 5;
    }

    // 5. Experience — 15 points
    const experienceWords = resumeData.experience
      .trim()
      .split(/\s+/)
      .filter(Boolean);

    if (experienceWords.length >= 50) {
      score += 15;
    } else if (experienceWords.length >= 30) {
      score += 12;
    } else if (experienceWords.length >= 15) {
      score += 8;
    } else if (experienceWords.length > 0) {
      score += 5;
    }

    // 6. Projects — 15 points
    const projectWords = resumeData.projects
      .trim()
      .split(/\s+/)
      .filter(Boolean);

    if (projectWords.length >= 40) {
      score += 15;
    } else if (projectWords.length >= 25) {
      score += 12;
    } else if (projectWords.length >= 10) {
      score += 8;
    } else if (projectWords.length > 0) {
      score += 5;
    }

    // 7. Action Words — 5 points
    const resumeText = `
      ${resumeData.summary}
      ${resumeData.experience}
      ${resumeData.projects}
    `.toLowerCase();

    const actionWords = [
      "developed",
      "built",
      "created",
      "designed",
      "implemented",
      "improved",
      "managed",
      "led",
      "optimized",
      "analyzed",
      "engineered",
      "automated"
    ];

    const actionWordCount = actionWords.filter(word =>
      resumeText.includes(word)
    ).length;

    if (actionWordCount >= 5) {
      score += 5;
    } else if (actionWordCount >= 3) {
      score += 4;
    } else if (actionWordCount >= 1) {
      score += 2;
    }

    // 8. Technical Keywords — 5 points
    const technicalKeywords = [
      "javascript",
      "python",
      "react",
      "node",
      "sql",
      "html",
      "css",
      "git",
      "java",
      "c++",
      "machine learning",
      "data",
      "api",
      "database",
      "cloud"
    ];

    const keywordCount = technicalKeywords.filter(keyword =>
      resumeText.includes(keyword) ||
      resumeData.skills.toLowerCase().includes(keyword)
    ).length;

    if (keywordCount >= 6) {
      score += 5;
    } else if (keywordCount >= 3) {
      score += 3;
    } else if (keywordCount >= 1) {
      score += 1;
    }

    // 9. Job Description Matching — 5 points
    const jobDescription = (resumeData.jobDescription || "").toLowerCase();

    const jobKeywords = jobDescription.match(
      /\b[a-zA-Z][a-zA-Z+#.-]{2,}\b/g
    ) || [];

    const uniqueKeywords = [...new Set(jobKeywords)];

    const matchedKeywords = uniqueKeywords.filter(keyword =>
      resumeText.includes(keyword) ||
      resumeData.skills.toLowerCase().includes(keyword) ||
      resumeData.education.toLowerCase().includes(keyword)
    );

    if (uniqueKeywords.length > 0) {
      const matchPercentage =
        matchedKeywords.length / uniqueKeywords.length;

      if (matchPercentage >= 0.6) {
        score += 5;
      } else if (matchPercentage >= 0.4) {
        score += 4;
      } else if (matchPercentage >= 0.2) {
        score += 2;
      } else if (matchPercentage > 0) {
        score += 1;
      }
    }

    return Math.min(score, 100);
  };


  // JOB MATCH DATA
  const getJobMatchData = () => {

    const jobDescription =
      (resumeData.jobDescription || "").toLowerCase().trim();

    const resumeText = `
      ${resumeData.summary}
      ${resumeData.skills}
      ${resumeData.experience}
      ${resumeData.projects}
      ${resumeData.education}
    `.toLowerCase();

    if (!jobDescription) {
      return {
        percentage: 0,
        matched: [],
        missing: []
      };
    }

    const keywords = [
      "javascript",
      "typescript",
      "react",
      "node.js",
      "node",
      "html",
      "css",
      "python",
      "java",
      "sql",
      "git",
      "github",
      "api",
      "rest",
      "mongodb",
      "mysql",
      "aws",
      "docker",
      "figma",
      "machine learning",
      "data analysis",
      "database",
      "cloud",
      "frontend",
      "backend",
      "full stack"
    ];

    const jobKeywords = keywords.filter(keyword =>
      jobDescription.includes(keyword)
    );

    const matched = jobKeywords.filter(keyword =>
      resumeText.includes(keyword)
    );

    const missing = jobKeywords.filter(keyword =>
      !resumeText.includes(keyword)
    );

    const percentage = jobKeywords.length
      ? Math.round((matched.length / jobKeywords.length) * 100)
      : 0;

    return {
      percentage,
      matched,
      missing
    };
  };


  const getATSSuggestions = () => {

    const suggestions = [];

    const summaryWords = resumeData.summary
      .trim()
      .split(/\s+/)
      .filter(Boolean);

    const educationWords = resumeData.education
      .trim()
      .split(/\s+/)
      .filter(Boolean);

    const skills = resumeData.skills
      .split(",")
      .map(skill => skill.trim())
      .filter(Boolean);

    const experienceWords = resumeData.experience
      .trim()
      .split(/\s+/)
      .filter(Boolean);

    const projectWords = resumeData.projects
      .trim()
      .split(/\s+/)
      .filter(Boolean);

    const resumeText = `
      ${resumeData.summary}
      ${resumeData.experience}
      ${resumeData.projects}
    `.toLowerCase();

    const actionWords = [
      "developed",
      "built",
      "created",
      "designed",
      "implemented",
      "improved",
      "managed",
      "led",
      "optimized",
      "analyzed",
      "engineered",
      "automated"
    ];

    const actionWordCount = actionWords.filter(word =>
      resumeText.includes(word)
    ).length;

    if (!resumeData.name.trim()) {
      suggestions.push("Add your full name.");
    }

    if (!resumeData.email.trim()) {
      suggestions.push("Add a professional email address.");
    }

    if (!resumeData.phone.trim()) {
      suggestions.push("Add your phone number.");
    }

    if (summaryWords.length < 20) {
      suggestions.push("Make your professional summary at least 20 words.");
    }

    if (educationWords.length < 8) {
      suggestions.push("Add more details to your education section.");
    }

    if (skills.length < 5) {
      suggestions.push("Add at least 5 relevant skills.");
    }

    if (experienceWords.length < 30) {
      suggestions.push("Add more detail to your experience section.");
    }

    if (projectWords.length < 25) {
      suggestions.push("Add more detail about your projects.");
    }

    if (actionWordCount < 3) {
      suggestions.push(
        "Use stronger action words such as Developed, Implemented, Designed, Built, or Optimized."
      );
    }

    if (suggestions.length === 0) {
      suggestions.push("Your resume looks well optimized for ATS.");
    }

    return suggestions;
  };


  const generateResume = async () => {

    if (isGenerating) return;

    if (!/^[a-zA-Z\s]+$/.test(resumeData.name.trim())) {
      alert("Please enter a valid name.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(resumeData.email.trim())) {
      alert("Please enter a valid email address.");
      return;
    }

    if (!/^\d{10}$/.test(resumeData.phone.trim())) {
      alert("Please enter a valid 10-digit phone number.");
      return;
    }

    try {

      setIsGenerating(true);

      const response = await fetch("http://localhost:5000/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(resumeData),
      });

      const data = await response.json();

      console.log("Backend response:", data);

      if (data.success) {

        setResumeData({
          ...data.data,
          jobDescription: resumeData.jobDescription,
        });

        setShowResume(true);

      } else {

        alert(data.message || "Something went wrong.");

      }

    } catch (error) {

      console.error("Backend error:", error);
      alert("Cannot connect to backend.");

    } finally {

      setIsGenerating(false);

    }
  };
const downloadPDF = () => {
  window.print();
};

  return (
    <div className="app">

      {/* LANDING PAGE */}

      {!showForm && !showResume && (
        <>

          <nav className="navbar">

            <div className="logo">
              AI Resume Builder
            </div>

            <button
              className="nav-button"
              onClick={() => setShowForm(true)}
            >
              Get Started
            </button>

          </nav>


          <main className="hero">

            <div className="badge">
              ✨ AI-Powered Resume Builder
            </div>

            <h1>
              Build a Resume That
              <span> Gets You Hired</span>
            </h1>

            <p>
              Create a professional, ATS-friendly resume in minutes.
              Let AI improve your content and make your experience stand out.
            </p>

            <button
              className="hero-button"
              onClick={() => setShowForm(true)}
            >
              Build My Resume →
            </button>


            <div className="features">

              <div className="feature-card">

                <div className="icon">
                  🤖
                </div>

                <h3>
                  AI Powered
                </h3>

                <p>
                  Improve your resume content with intelligent AI suggestions.
                </p>

              </div>


              <div className="feature-card">

                <div className="icon">
                  📄
                </div>

                <h3>
                  Professional Templates
                </h3>

                <p>
                  Choose from clean and modern resume templates.
                </p>

              </div>


              <div className="feature-card">

                <div className="icon">
                  ⚡
                </div>

                <h3>
                  Quick & Easy
                </h3>

                <p>
                  Build your complete resume in just a few minutes.
                </p>

              </div>

            </div>

          </main>

        </>
      )}


      {/* RESUME FORM */}

      {showForm && !showResume && (

        <main className="form-page">

          <div className="form-header">

            <button
              className="back-button"
              onClick={() => setShowForm(false)}
            >
              ← Back
            </button>

            <h1>
              Build Your Resume
            </h1>

            <p>
              Enter your information and we'll create your professional resume.
            </p>

          </div>


          <div className="resume-form">

            <h2>
              Personal Information
            </h2>


            <div className="form-grid">

              <div className="form-group">

                <label>
                  Full Name
                </label>

                <input
                  type="text"
                  name="name"
                  value={resumeData.name}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                />

              </div>


              <div className="form-group">

                <label>
                  Email
                </label>

                <input
                  type="email"
                  name="email"
                  value={resumeData.email}
                  onChange={handleChange}
                  placeholder="your@email.com"
                />

              </div>


              <div className="form-group">

                <label>
                  Phone
                </label>

                <input
                  type="text"
                  name="phone"
                  value={resumeData.phone}
                  onChange={handleChange}
                  inputMode="numeric"
                  placeholder="9876543210"
                />

              </div>


              <div className="form-group">

                <label>
                  Location
                </label>

                <input
                  type="text"
                  name="location"
                  value={resumeData.location}
                  onChange={handleChange}
                  placeholder="City, Country"
                />

              </div>

            </div>


            <div className="form-group">

              <label>
                Professional Summary
              </label>

              <textarea
                name="summary"
                value={resumeData.summary}
                onChange={handleChange}
                rows="5"
                placeholder="Write a short summary about yourself..."
              ></textarea>

            </div>


            <h2>
              Education
            </h2>


            <div className="form-group">

              <label>
                Education Details
              </label>

              <textarea
                name="education"
                value={resumeData.education}
                onChange={handleChange}
                rows="4"
                placeholder="Example: B.Tech in Artificial Intelligence and Data Science, XYZ College, 2024-2028"
              ></textarea>

            </div>


            <h2>
              Skills
            </h2>


            <div className="form-group">

              <label>
                Your Skills
              </label>

              <input
                type="text"
                name="skills"
                value={resumeData.skills}
                onChange={handleChange}
                placeholder="Python, SQL, Machine Learning, React..."
              />

            </div>


            <h2>
              Experience
            </h2>


            <div className="form-group">

              <label>
                Work Experience
              </label>

              <textarea
                name="experience"
                value={resumeData.experience}
                onChange={handleChange}
                rows="5"
                placeholder="Describe your work experience..."
              ></textarea>

            </div>


            <h2>
              Job Description
            </h2>


            <div className="form-group">

              <label>
                Target Job Description
              </label>

              <textarea
                name="jobDescription"
                value={resumeData.jobDescription}
                onChange={handleChange}
                rows="8"
                placeholder="Paste the job description here..."
              ></textarea>

            </div>


            <h2>
              Projects
            </h2>


            <div className="form-group">

              <label>
                Projects
              </label>

              <textarea
                name="projects"
                value={resumeData.projects}
                onChange={handleChange}
                rows="5"
                placeholder="Describe your projects..."
              ></textarea>

            </div>


            <button
              className="generate-button"
              onClick={generateResume}
              disabled={isGenerating}
            >
              {isGenerating
                ? "⏳ Generating Resume..."
                : "✨ Generate Resume"}
            </button>

          </div>

        </main>

      )}


      {/* RESUME PREVIEW */}

      {showResume && (

        <main className="preview-page">

          <div className="preview-actions">

            <button
              className="back-button"
              onClick={() => setShowResume(false)}
            >
              ← Back
            </button>

            <button
              className="download-button"
              onClick={downloadPDF}
            >
              Download PDF
            </button>

          </div>


          {/* ATS SCORE */}

          <div className="ats-card">

            <h2>
              ATS Score
            </h2>

            <div className="ats-score">
              {calculateATSScore()}%
            </div>

            <p>
              Your resume is currently
              <strong>
                {" "}
                {calculateATSScore()}% ATS optimized.
              </strong>
            </p>


            <div className="ats-progress">

              <div
                className="ats-progress-fill"
                style={{
                  width: `${calculateATSScore()}%`
                }}
              ></div>

            </div>


            {/* ATS ANALYSIS */}

            <div className="ats-analysis">

              <div className="analysis-title">

                <h3>
                  ATS Analysis
                </h3>

                <span>
                  AI-powered insights
                </span>

              </div>


              <div className="analysis-grid">


                <div className="analysis-card">

                  <div>

                    <span className="analysis-label">
                      Keyword Optimization
                    </span>

                    <small>
                      Relevant skills and keywords
                    </small>

                  </div>

                  <strong className="status-good">
                    Strong
                  </strong>

                </div>


                <div className="analysis-card">

                  <div>

                    <span className="analysis-label">
                      Resume Structure
                    </span>

                    <small>
                      ATS-friendly formatting
                    </small>

                  </div>

                  <strong className="status-excellent">
                    Excellent
                  </strong>

                </div>


                <div className="analysis-card">

                  <div>

                    <span className="analysis-label">
                      Content Quality
                    </span>

                    <small>
                      Clarity and relevance
                    </small>

                  </div>

                  <strong className="status-good">
                    Strong
                  </strong>

                </div>


                <div className="analysis-card">

                  <div>

                    <span className="analysis-label">
                      Skills Relevance
                    </span>

                    <small>
                      Skills matching your profile
                    </small>

                  </div>

                  <strong className="status-good">
                    Strong
                  </strong>

                </div>


                <div className="analysis-card">

                  <div>

                    <span className="analysis-label">
                      Experience Details
                    </span>

                    <small>
                      Achievements and measurable impact
                    </small>

                  </div>

                  <strong className="status-warning">
                    Improve
                  </strong>

                </div>


                <div className="analysis-card">

                  <div>

                    <span className="analysis-label">
                      Readability
                    </span>

                    <small>
                      Clean and professional layout
                    </small>

                  </div>

                  <strong className="status-excellent">
                    Excellent
                  </strong>

                </div>

              </div>


              <div className="ai-recommendation">

                <div className="ai-icon">
                  ✦
                </div>

                <div>

                  <strong>
                    AI Recommendation
                  </strong>

                  <p>
                    Add measurable achievements and
                    job-specific keywords to increase
                    your ATS score and improve your
                    chances of getting shortlisted.
                  </p>

                </div>

              </div>

            </div>


            {/* JOB MATCH */}

            <div className="job-match-card">

              <div className="job-match-header">

                <div>

                  <h3>
                    Job Match
                  </h3>

                  <p>
                    How well your resume matches the target job
                  </p>

                </div>


                <div className="job-match-percentage">
                  {getJobMatchData().percentage}%
                </div>

              </div>


              <div className="job-match-progress">

                <div
                  className="job-match-progress-fill"
                  style={{
                    width: `${getJobMatchData().percentage}%`
                  }}
                ></div>

              </div>


              {!resumeData.jobDescription.trim() ? (

                <div className="job-match-empty">

                  <strong>
                    Add a Job Description
                  </strong>

                  <span>
                    Paste the target job description above to see
                    keyword matching and recommendations.
                  </span>

                </div>

              ) : (

                <div className="job-match-results">


                  <div className="keyword-group">

                    <h4>
                      Matched Keywords
                    </h4>


                    <div className="keyword-list">

                      {getJobMatchData().matched.length > 0 ? (

                        getJobMatchData().matched.map((keyword) => (

                          <span
                            className="keyword matched"
                            key={keyword}
                          >
                            ✓ {keyword}
                          </span>

                        ))

                      ) : (

                        <span className="no-keywords">
                          No matching keywords found
                        </span>

                      )}

                    </div>

                  </div>


                  <div className="keyword-group">

                    <h4>
                      Missing Keywords
                    </h4>


                    <div className="keyword-list">

                      {getJobMatchData().missing.length > 0 ? (

                        getJobMatchData().missing.map((keyword) => (

                          <span
                            className="keyword missing"
                            key={keyword}
                          >
                            + {keyword}
                          </span>

                        ))

                      ) : (

                        <span className="all-matched">
                          Excellent! No important keywords missing.
                        </span>

                      )}

                    </div>

                  </div>

                </div>

              )}

            </div>

          </div>


          {/* RESUME */}

          <div
            className="resume-container"
            ref={resumeRef}
            data-resume-preview="true"
          >

            <header className="resume-header">

              <h1>
                {resumeData.name}
              </h1>

              <p>
                {resumeData.email}
                {resumeData.phone && ` | ${resumeData.phone}`}
                {resumeData.location && ` | ${resumeData.location}`}
              </p>

            </header>


            {resumeData.summary && (

              <section className="resume-section">

                <h2>
                  Professional Summary
                </h2>

                <p>
                  {resumeData.summary}
                </p>

              </section>

            )}


            {resumeData.education && (

              <section className="resume-section">

                <h2>
                  Education
                </h2>

                <p>
                  {resumeData.education}
                </p>

              </section>

            )}


            {resumeData.skills && (

              <section className="resume-section">

                <h2>
                  Skills
                </h2>

                <p>
                  {resumeData.skills}
                </p>

              </section>

            )}


            {resumeData.experience && (

              <section className="resume-section">

                <h2>
                  Experience
                </h2>

                <p>
                  {resumeData.experience}
                </p>

              </section>

            )}


            {resumeData.projects && (

              <section className="resume-section">

                <h2>
                  Projects
                </h2>

                <p>
                  {resumeData.projects}
                </p>

              </section>

            )}

          </div>

        </main>

      )}

    </div>
  );
} 

export default App