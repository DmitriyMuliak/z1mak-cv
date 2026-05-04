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

const styles = StyleSheet.create({
  page: {
    fontSize: 10,
    color: '#1a1a1a',
    paddingTop: 40,
    paddingBottom: 40,
    paddingHorizontal: 50,
    lineHeight: 1.4,
  },
  nameWrapper: { marginBottom: 6 },
  name: { fontSize: 20, fontWeight: 700 },
  contactLine: { fontSize: 9, color: '#444444', marginBottom: 14 },
  section: { marginBottom: 10 },
  sectionHeading: {
    fontSize: 12,
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    borderBottomWidth: 1,
    borderBottomColor: '#cccccc',
    borderBottomStyle: 'solid',
    paddingBottom: 2,
    marginBottom: 6,
  },
  entryHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 1 },
  entryTitle: { fontWeight: 700, fontSize: 10 },
  entryDates: { fontSize: 9, color: '#555555' },
  entrySubtitle: { fontSize: 9, color: '#444444', marginBottom: 3 },
  bullet: { flexDirection: 'row', marginBottom: 1, paddingLeft: 8 },
  bulletDot: { width: 8, fontSize: 10 },
  bulletText: { flex: 1, fontSize: 10 },
  skillRow: { flexDirection: 'row', marginBottom: 2 },
  skillCategory: { fontWeight: 700, fontSize: 10, width: 100 },
  skillItems: { flex: 1, fontSize: 10 },
  summaryText: { fontSize: 10 },
  inlineItem: { fontSize: 10, marginBottom: 2 },
});

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
          {i > 0 && <Text style={{ color: '#888888' }}> | </Text>}
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
      <Text style={styles.sectionHeading}>EXPERIENCE</Text>
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
      <Text style={styles.sectionHeading}>EDUCATION</Text>
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
      <Text style={styles.sectionHeading}>SKILLS</Text>
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
      <Text style={styles.sectionHeading}>CERTIFICATIONS</Text>
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
      <Text style={styles.sectionHeading}>LANGUAGES</Text>
      {entries.map((e) => (
        <Text key={e.id} style={styles.inlineItem}>
          {e.language} — {e.proficiency.charAt(0).toUpperCase() + e.proficiency.slice(1)}
        </Text>
      ))}
    </View>
  );
}

export interface AtsCleanTemplateProps {
  document: ResumeDocument;
  fontFamily?: string;
}

export function AtsCleanTemplate({ document: doc, fontFamily = 'Roboto' }: AtsCleanTemplateProps) {
  return (
    <Document title={doc.header.name || 'Resume'} author={doc.header.name}>
      <Page size="A4" style={{ ...styles.page, fontFamily }}>
        <View style={styles.nameWrapper}>
          <Text style={styles.name}>{doc.header.name}</Text>
        </View>
        <ContactLine header={doc.header} />
        {doc.summary ? (
          <View style={styles.section}>
            <Text style={styles.sectionHeading}>SUMMARY</Text>
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
