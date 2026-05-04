import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import type {
  ResumeDocument,
  ExperienceEntry,
  EducationEntry,
  SkillGroup,
  CertificationEntry,
  LanguageEntry,
} from '../schema/resumeDocument.schema';

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

function ContactLine({ header }: { header: ResumeDocument['header'] }) {
  const parts = [
    header.email,
    header.phone,
    header.location,
    header.linkedin,
    header.website,
  ].filter(Boolean) as string[];

  return (
    <Text style={styles.contactLine}>
      {parts.map((part, i) => (
        <React.Fragment key={i}>
          {i > 0 && <Text style={{ color: '#aaaaaa' }}> · </Text>}
          <Text>{part}</Text>
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
          {e.bullets.map((b, i) => (
            <View key={i} style={styles.bullet}>
              <Text style={styles.bulletDot}>•</Text>
              <Text style={styles.bulletText}>{b}</Text>
            </View>
          ))}
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
}

export function AtsModernTemplate({
  document: doc,
  fontFamily = 'Roboto',
}: AtsModernTemplateProps) {
  return (
    <Document title={doc.header.name || 'Resume'} author={doc.header.name}>
      <Page size="A4" style={{ ...styles.page, fontFamily }}>
        <View style={styles.nameWrapper}>
          <Text style={styles.name}>{doc.header.name}</Text>
        </View>
        <ContactLine header={doc.header} />
        {doc.summary ? (
          <View style={styles.section}>
            <SectionHeading title="Summary" />
            <Text style={styles.summaryText}>{doc.summary}</Text>
          </View>
        ) : null}
        <ExperienceSection entries={doc.experience} />
        <EducationSection entries={doc.education} />
        <SkillsSection groups={doc.skills} />
        <CertificationsSection entries={doc.certifications} />
        <LanguagesSection entries={doc.languages} />
      </Page>
    </Document>
  );
}
