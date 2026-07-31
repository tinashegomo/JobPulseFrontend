import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useGetMyProfile, useCreateOrUpdateProfile, useDeleteProfile } from '../hooks/useJobPulseHooks';
import { API } from '../api/JobPulseAPI';
import PageHeader from '../components/layout/PageHeader';
import { Upload, FileText, Sparkles, User, Briefcase, Code, Wrench, FolderOpen, GraduationCap, MapPin, CheckCircle2, X, Loader2 } from 'lucide-react';
import mammoth from 'mammoth';
import * as pdfjsLib from 'pdfjs-dist';

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const ACCEPTED_TYPES = {
  'application/pdf': '.pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
};

async function extractTextFromPDF(file) {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const pages = [];
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const strings = content.items.map((item) => item.str);
    pages.push(strings.join(' '));
  }
  return pages.join('\n\n');
}

async function extractTextFromDOCX(file) {
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });
  return result.value;
}

async function extractTextFromFile(file) {
  if (file.type === 'application/pdf') return extractTextFromPDF(file);
  if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') return extractTextFromDOCX(file);
  throw new Error('Unsupported file type');
}

async function analyzeResumeWithAI(resumeText) {
  if (!resumeText) {
    console.warn('[Resume AI] resumeText missing — skipping analysis');
    return null;
  }

  try {
    const response = await API.post('/analyze-resume', { resumeText });

    if (response.status !== 200) {
      console.error('[Resume AI] API error:', response.status);
      return null;
    }

    const parsed = response.data;
    console.log('[Resume AI] Resume analyzed successfully:', Object.keys(parsed));
    return parsed;
  } catch (err) {
    console.error('[Resume AI] Exception during analysis:', err.message, err.stack);
    return null;
  }
}

function SummarySection({ label, icon: Icon, items, text }) {
  if ((!items || items.length === 0) && !text) return null;
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <Icon className="w-4 h-4 text-brand-primary" />
        <span className="text-[13px] font-semibold text-text-primary">{label}</span>
      </div>
      {items && items.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {items.map((item, i) => (
            <span key={i} className="text-[12px] font-medium px-2.5 py-1 rounded-pill bg-surface-muted text-text-secondary border border-border-default">
              {item}
            </span>
          ))}
        </div>
      )}
      {text && (
        <p className="text-[13px] text-text-secondary leading-relaxed">{text}</p>
      )}
    </div>
  );
}

export default function Resume() {
  const { currentUser } = useAuth();
  const { data: profile, isLoading } = useGetMyProfile();
  const createOrUpdate = useCreateOrUpdateProfile();
  const deleteProfileMut = useDeleteProfile();
  const fileInputRef = useRef(null);
  const [resumeText, setResumeText] = useState('');
  const [summary, setSummary] = useState(null);
  const [fileName, setFileName] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [saved, setSaved] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (profile) {
      setResumeText(profile.resumeText || '');
      setSummary(profile.profile || null);
      setFileName(profile.originalFileName || '');
    }
  }, [profile]);

  const processFile = useCallback(async (file) => {
    if (!file) return;
    setError('');

    if (!Object.keys(ACCEPTED_TYPES).includes(file.type)) {
      setError('Unsupported file type. Please upload a PDF or DOCX.');
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setError('File too large. Maximum size is 5 MB.');
      return;
    }

    setAnalyzing(true);
    try {
      const text = await extractTextFromFile(file);
      if (!text || text.trim().length < 10) {
        setError('Could not extract meaningful text from this file. Try a different resume.');
        return;
      }
      setResumeText(text);
      setFileName(file.name);

      const aiProfile = await analyzeResumeWithAI(text.trim());

      createOrUpdate.mutate(
        {
          profile: aiProfile,
          resumeText: text.trim(),
          originalFileName: file.name,
        },
        {
          onSuccess: () => {
            setSummary(aiProfile);
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
          },
          onError: () => {
            setError('Failed to save profile. Please try again.');
          },
        }
      );
    } catch (err) {
      console.error('[Resume] Error processing file:', err);
      setError('Failed to process file. Please try again.');
    } finally {
      setAnalyzing(false);
    }
  }, [currentUser, createOrUpdate]);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    processFile(file);
  }, [processFile]);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setDragActive(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setDragActive(false);
  }, []);

  const handleFileChange = useCallback((e) => {
    const file = e.target.files?.[0];
    processFile(file);
  }, [processFile]);

  const handleRemove = useCallback(() => {
    setResumeText('');
    setSummary(null);
    setFileName('');
    deleteProfileMut.mutate();
  }, [deleteProfileMut]);

  return (
    <div className="flex flex-col gap-5 pb-6">
      <PageHeader
        title="Resume"
        subtitle="Upload your resume for personalized job matching"
      />

      <div className="flex flex-col gap-4">
        <div className="flex items-start gap-3 p-4 rounded-[12px] bg-brand-primary/5 border border-brand-primary/15">
          <FileText className="w-5 h-5 text-brand-primary shrink-0 mt-0.5" />
          <p className="text-[13px] text-text-secondary leading-relaxed">
            Upload your resume as a PDF or DOCX. The AI will automatically extract your skills,
            tools, projects, and experience — then use this to personally score how well each
            job matches your background.
          </p>
        </div>

        {isLoading ? (
          <div className="h-48 rounded-[12px] bg-surface-muted animate-pulse" />
        ) : !resumeText ? (
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => fileInputRef.current?.click()}
            className={`flex flex-col items-center justify-center gap-3 p-10 rounded-[12px] border-2 border-dashed cursor-pointer transition-all duration-150 ${
              dragActive
                ? 'border-brand-primary bg-brand-primary/5'
                : 'border-border-default bg-surface-default hover:border-brand-primary/40 hover:bg-surface-muted'
            }`}
          >
            <Upload className={`w-8 h-8 ${dragActive ? 'text-brand-primary' : 'text-text-muted'}`} />
            <div className="flex flex-col items-center gap-1">
              <span className="text-[14px] font-medium text-text-primary">
                {dragActive ? 'Drop your resume here' : 'Drag & drop your resume'}
              </span>
              <span className="text-[12px] text-text-muted">
                or <span className="text-brand-primary font-medium">browse files</span>
              </span>
            </div>
            <span className="text-[11px] text-text-muted">PDF or DOCX — Max 5 MB</span>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.docx"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between p-4 rounded-[12px] bg-surface-elevated border border-border-default">
              <div className="flex items-center gap-3 min-w-0">
                <FileText className="w-5 h-5 text-brand-primary shrink-0" />
                <div className="min-w-0">
                  <p className="text-[13px] font-medium text-text-primary truncate">{fileName}</p>
                  <p className="text-[11px] text-text-muted">{Math.ceil(resumeText.length / 5)} chars extracted</p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {analyzing && (
                  <div className="flex items-center gap-1.5 text-brand-primary">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-[12px] font-medium">Analyzing...</span>
                  </div>
                )}
                {createOrUpdate.isPending && (
                  <div className="flex items-center gap-1.5 text-brand-primary">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-[12px] font-medium">Saving...</span>
                  </div>
                )}
                {saved && !createOrUpdate.isPending && (
                  <span className="flex items-center gap-1 text-[13px] text-success-main font-medium">
                    <CheckCircle2 className="w-4 h-4" />
                    Saved
                  </span>
                )}
                <button
                  onClick={(e) => { e.stopPropagation(); handleRemove(); }}
                  className="p-1.5 rounded-[8px] text-text-muted hover:text-danger-main hover:bg-danger-main/10 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="text-[12px] text-brand-primary font-medium hover:underline cursor-pointer self-start"
            >
              Replace resume
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.docx"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 p-3 rounded-[12px] bg-danger-main/10 border border-danger-main/20">
            <X className="w-4 h-4 text-danger-main shrink-0" />
            <p className="text-[13px] text-danger-main">{error}</p>
          </div>
        )}

        <div className="flex items-center justify-between gap-3">
          <div className="text-[12px] text-text-muted">
            {profile?.createdAt && (
              <span>Last updated: {new Date(profile.createdAt).toLocaleDateString()} {new Date(profile.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            )}
          </div>
        </div>
      </div>

      {/* AI Summary Section */}
      {summary && (
        <div className="flex flex-col gap-4 mt-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-brand-primary" />
            <h2 className="text-[16px] font-semibold text-text-primary">Candidate Profile</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {summary.name && (
              <div className="flex items-center gap-3 p-3 rounded-[12px] bg-surface-elevated border border-border-default">
                <User className="w-5 h-5 text-text-muted shrink-0" />
                <div>
                  <span className="text-[11px] font-semibold text-text-muted uppercase tracking-wider">Name</span>
                  <p className="text-[14px] font-medium text-text-primary">{summary.name}</p>
                </div>
              </div>
            )}
            {summary.title && (
              <div className="flex items-center gap-3 p-3 rounded-[12px] bg-surface-elevated border border-border-default">
                <Briefcase className="w-5 h-5 text-text-muted shrink-0" />
                <div>
                  <span className="text-[11px] font-semibold text-text-muted uppercase tracking-wider">Title</span>
                  <p className="text-[14px] font-medium text-text-primary">{summary.title}</p>
                </div>
              </div>
            )}
            {summary.level && (
              <div className="flex items-center gap-3 p-3 rounded-[12px] bg-surface-elevated border border-border-default">
                <Briefcase className="w-5 h-5 text-text-muted shrink-0" />
                <div>
                  <span className="text-[11px] font-semibold text-text-muted uppercase tracking-wider">Level</span>
                  <p className="text-[14px] font-medium text-text-primary capitalize">{summary.level}</p>
                </div>
              </div>
            )}
            {summary.yearsExperience != null && (
              <div className="flex items-center gap-3 p-3 rounded-[12px] bg-surface-elevated border border-border-default">
                <Briefcase className="w-5 h-5 text-text-muted shrink-0" />
                <div>
                  <span className="text-[11px] font-semibold text-text-muted uppercase tracking-wider">Experience</span>
                  <p className="text-[14px] font-medium text-text-primary">{summary.yearsExperience} years</p>
                </div>
              </div>
            )}
            {summary.location && (
              <div className="flex items-center gap-3 p-3 rounded-[12px] bg-surface-elevated border border-border-default">
                <MapPin className="w-5 h-5 text-text-muted shrink-0" />
                <div>
                  <span className="text-[11px] font-semibold text-text-muted uppercase tracking-wider">Location</span>
                  <p className="text-[14px] font-medium text-text-primary">{summary.location}</p>
                </div>
              </div>
            )}
            {summary.workPreference && summary.workPreference !== 'any' && (
              <div className="flex items-center gap-3 p-3 rounded-[12px] bg-surface-elevated border border-border-default">
                <MapPin className="w-5 h-5 text-text-muted shrink-0" />
                <div>
                  <span className="text-[11px] font-semibold text-text-muted uppercase tracking-wider">Work Preference</span>
                  <p className="text-[14px] font-medium text-text-primary capitalize">{summary.workPreference}</p>
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-4 p-4 rounded-[12px] bg-surface-elevated border border-border-default">
            <SummarySection label="Core Skills" icon={Code} items={summary.skills} />
            <SummarySection label="Tools & Platforms" icon={Wrench} items={summary.tools} />
            <SummarySection label="Languages" icon={Code} items={summary.languages} />
            <SummarySection label="Frameworks" icon={FolderOpen} items={summary.frameworks} />
            <SummarySection label="Cloud Skills" icon={Wrench} items={summary.cloudSkills} />
            <SummarySection label="Education" icon={GraduationCap} text={summary.education} />
            {summary.preferredRoles && summary.preferredRoles.length > 0 && (
              <SummarySection label="Preferred Roles" icon={Briefcase} items={summary.preferredRoles} />
            )}
            {summary.avoidRoles && summary.avoidRoles.length > 0 && (
              <SummarySection label="Avoid Roles" icon={Briefcase} items={summary.avoidRoles} />
            )}
            {summary.highlights && summary.highlights.length > 0 && (
              <SummarySection label="Key Highlights" icon={Sparkles} items={summary.highlights} />
            )}
          </div>
        </div>
      )}

      {!summary && !isLoading && resumeText && (
        <div className="flex items-center gap-3 p-4 rounded-[12px] bg-surface-muted border border-border-default">
          <Sparkles className="w-5 h-5 text-text-muted shrink-0" />
          <p className="text-[13px] text-text-muted">
            Your resume is saved. Upload a new file to re-analyze.
          </p>
        </div>
      )}
    </div>
  );
}
