import React from 'react';
import { Document, Page, Text, View, StyleSheet, Link } from '@react-pdf/renderer';
import type {
  ResumeDocument,
  ExperienceEntry,
  EducationEntry,
  SkillGroup,
  CertificationEntry,
  LanguageEntry,
} from '../schema/resumeDocument.schema';
import { htmlToTextNodes, type TextRun } from '../utils/htmlToTextNodes';

function Runs({ runs }: { runs: TextRun[] }) {
  return (
    <>
      {runs.map((run, i) => (
        <Text
          key={i}
          style={{
            fontWeight: run.bold ? 700 : undefined,
            fontStyle: run.italic ? 'italic' : undefined,
          }}
        >
          {run.text}
        </Text>
      ))}
    </>
  );
}

function HtmlNodes({
  html,
  bulletDotStyle,
  bulletTextStyle,
  paraStyle,
}: {
  html: string | undefined;
  bulletDotStyle: (typeof styles)[keyof typeof styles];
  bulletTextStyle: (typeof styles)[keyof typeof styles];
  paraStyle: (typeof styles)[keyof typeof styles] | { fontSize: number; marginBottom: number };
}) {
  return (
    <>
      {htmlToTextNodes(html).map((node, i) => {
        if (node.type === 'bullet') {
          return (
            <View key={i} style={{ flexDirection: 'row', marginBottom: 1, paddingLeft: 8 }}>
              <Text style={bulletDotStyle}>{'•'}</Text>
              <Text style={bulletTextStyle}>
                <Runs runs={node.runs} />
              </Text>
            </View>
          );
        }
        if (node.type === 'ordered') {
          return (
            <View key={i} style={{ flexDirection: 'row', marginBottom: 1, paddingLeft: 8 }}>
              <Text style={{ ...bulletDotStyle, width: 10 }}>{`${node.n}.`}</Text>
              <Text style={bulletTextStyle}>
                <Runs runs={node.runs} />
              </Text>
            </View>
          );
        }
        return (
          <Text key={i} style={paraStyle}>
            <Runs runs={node.runs} />
          </Text>
        );
      })}
    </>
  );
}

const ACCENT = '#2563eb';

const styles = StyleSheet.create({
  page: {
    fontSize: 10,
    color: '#1a1a1a',
    paddingTop: 40,
    paddingBottom: 40,
    paddingHorizontal: 50,
    lineHeight: 1.4,
  },
  nameWrapper: { marginBottom: 20 },
  name: { fontSize: 22, fontWeight: 700, color: '#111111' },
  contactLine: { fontSize: 9, color: '#555555', marginBottom: 14 },
  section: { marginBottom: 10 },
  sectionHeadingRow: { flexDirection: 'row', alignItems: 'stretch', marginBottom: 6 },
  sectionAccent: { width: 3, backgroundColor: ACCENT, marginRight: 6 },
  sectionHeading: {
    flex: 1,
    fontSize: 12,
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    color: '#111111',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    borderBottomStyle: 'solid',
    paddingBottom: 2,
  },
  entryHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 1 },
  entryTitle: { fontWeight: 700, fontSize: 10 },
  entryDates: { fontSize: 9, color: '#6b7280' },
  entrySubtitle: { fontSize: 9, color: '#4b5563', marginBottom: 3 },
  bullet: { flexDirection: 'row', marginBottom: 1, paddingLeft: 8 },
  bulletDot: { width: 8, fontSize: 10, color: ACCENT },
  bulletText: { flex: 1, fontSize: 10 },
  skillRow: { flexDirection: 'row', marginBottom: 2 },
  skillCategory: { fontWeight: 700, fontSize: 10, width: 100 },
  skillItems: { flex: 1, fontSize: 10 },
  summaryText: { fontSize: 10 },
  inlineItem: { fontSize: 10, marginBottom: 2 },
});

function SectionHeading({ title }: { title: string }) {
  return (
    <View style={styles.sectionHeadingRow}>
      <View style={styles.sectionAccent} />
      <Text style={styles.sectionHeading}>{title.toUpperCase()}</Text>
    </View>
  );
}

type ContactPart = { type: 'text'; value: string } | { type: 'link'; href: string; label: string };

function ContactLine({ header }: { header: ResumeDocument['header'] }) {
  const parts: ContactPart[] = [
    header.email ? { type: 'text', value: header.email } : null,
    header.phone ? { type: 'text', value: header.phone } : null,
    header.location ? { type: 'text', value: header.location } : null,
    header.linkedin
      ? { type: 'link', href: header.linkedin, label: header.linkedinLabel || header.linkedin }
      : null,
    header.website
      ? { type: 'link', href: header.website, label: header.websiteLabel || header.website }
      : null,
  ].filter(Boolean) as ContactPart[];

  return (
    <Text style={styles.contactLine}>
      {parts.map((part, i) => (
        <React.Fragment key={i}>
          {i > 0 && <Text style={{ color: '#aaaaaa' }}> · </Text>}
          {part.type === 'link' ? (
            <Link src={part.href} style={{ color: '#555555', textDecoration: 'none' }}>
              {part.label}
            </Link>
          ) : (
            <Text>{part.value}</Text>
          )}
        </React.Fragment>
      ))}
    </Text>
  );
}

function DateRange({ start, end }: { start: string; end?: string }) {
  return (
    <Text style={styles.entryDates}>
      {start}
      {end ? ` – ${end}` : ' – Present'}
    </Text>
  );
}

function ExperienceSection({ entries }: { entries: ExperienceEntry[] }) {
  if (!entries.length) return null;
  return (
    <View style={styles.section}>
      <SectionHeading title="Experience" />
      {entries.map((e) => (
        <View key={e.id} style={{ marginBottom: 6 }}>
          <View style={styles.entryHeader}>
            <Text style={styles.entryTitle}>
              {e.title} — {e.company}
            </Text>
            <DateRange start={e.startDate} end={e.endDate} />
          </View>
          {e.location ? <Text style={styles.entrySubtitle}>{e.location}</Text> : null}
          <HtmlNodes
            html={e.description}
            bulletDotStyle={styles.bulletDot}
            bulletTextStyle={styles.bulletText}
            paraStyle={{ fontSize: 10, marginBottom: 2 }}
          />
        </View>
      ))}
    </View>
  );
}

function EducationSection({ entries }: { entries: EducationEntry[] }) {
  if (!entries.length) return null;
  return (
    <View style={styles.section}>
      <SectionHeading title="Education" />
      {entries.map((e) => (
        <View key={e.id} style={{ marginBottom: 5 }}>
          <View style={styles.entryHeader}>
            <Text style={styles.entryTitle}>{e.institution}</Text>
            <DateRange start={e.startDate} end={e.endDate} />
          </View>
          <Text style={styles.entrySubtitle}>
            {e.degree} in {e.field}
            {e.gpa ? ` — GPA: ${e.gpa}` : ''}
          </Text>
        </View>
      ))}
    </View>
  );
}

function SkillsSection({ groups }: { groups: SkillGroup[] }) {
  if (!groups.length) return null;
  return (
    <View style={styles.section}>
      <SectionHeading title="Skills" />
      {groups.map((g) => (
        <View key={g.id} style={styles.skillRow}>
          <Text style={styles.skillCategory}>{g.category}:</Text>
          <Text style={styles.skillItems}>{g.items.join(', ')}</Text>
        </View>
      ))}
    </View>
  );
}

function CertificationsSection({ entries }: { entries: CertificationEntry[] }) {
  if (!entries.length) return null;
  return (
    <View style={styles.section}>
      <SectionHeading title="Certifications" />
      {entries.map((e) => (
        <Text key={e.id} style={styles.inlineItem}>
          {e.name} — {e.issuer}
          {e.date ? ` (${e.date})` : ''}
        </Text>
      ))}
    </View>
  );
}

function LanguagesSection({ entries }: { entries: LanguageEntry[] }) {
  if (!entries.length) return null;
  return (
    <View style={styles.section}>
      <SectionHeading title="Languages" />
      {entries.map((e) => (
        <Text key={e.id} style={styles.inlineItem}>
          {e.language} — {e.proficiency.charAt(0).toUpperCase() + e.proficiency.slice(1)}
        </Text>
      ))}
    </View>
  );
}

export interface AtsModernTemplateProps {
  document: ResumeDocument;
  fontFamily?: string;
  pageCount?: number;
}

export function AtsModernTemplate({
  document: doc,
  fontFamily = 'Roboto',
  pageCount = 1,
}: AtsModernTemplateProps) {
  return (
    <Document title={doc.header.name || 'Resume'} author={doc.header.name}>
      {Array.from({ length: pageCount }, (_, pageIndex) => {
        const pageExp = doc.experience.filter((e) => (e.page ?? 0) === pageIndex);
        const pageEdu = doc.education.filter((e) => (e.page ?? 0) === pageIndex);
        const pageSkills = doc.skills.filter((g) => (g.page ?? 0) === pageIndex);
        const pageCerts = doc.certifications.filter((e) => (e.page ?? 0) === pageIndex);
        const pageLangs = doc.languages.filter((e) => (e.page ?? 0) === pageIndex);
        return (
          <Page key={pageIndex} size="A4" style={{ ...styles.page, fontFamily }}>
            {pageIndex === 0 && (
              <>
                <View style={styles.nameWrapper}>
                  <Text style={styles.name}>{doc.header.name}</Text>
                </View>
                <ContactLine header={doc.header} />
              </>
            )}
            {pageIndex === 0 && doc.summary ? (
              <View style={styles.section}>
                <SectionHeading title="Summary" />
                <HtmlNodes
                  html={doc.summary}
                  bulletDotStyle={styles.bulletDot}
                  bulletTextStyle={styles.bulletText}
                  paraStyle={styles.summaryText}
                />
              </View>
            ) : null}
            {pageExp.length > 0 && <ExperienceSection entries={pageExp} />}
            {pageEdu.length > 0 && <EducationSection entries={pageEdu} />}
            {pageSkills.length > 0 && <SkillsSection groups={pageSkills} />}
            {pageCerts.length > 0 && <CertificationsSection entries={pageCerts} />}
            {pageLangs.length > 0 && <LanguagesSection entries={pageLangs} />}
          </Page>
        );
      })}
    </Document>
  );
}
