import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from "@react-pdf/renderer";

// Import church logo
import churchLogo from "../../../assets/SBCCLogoHD.png";

// Professional report colors
const colors = {
  dark: "#1a1a2e",
  text: "#333333",
  label: "#666666",
  border: "#cccccc",
  lightBg: "#f8f9fa",
  white: "#ffffff",
};

// Clean professional report styles
const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: "Helvetica",
    fontSize: 9,
    backgroundColor: colors.white,
  },
  // Header
  header: {
    flexDirection: "row",
    marginBottom: 15,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    alignItems: "center",
  },
  logo: {
    width: 45,
    height: 45,
  },
  headerText: {
    flex: 1,
    marginLeft: 12,
  },
  churchName: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
    color: colors.dark,
  },
  documentTitle: {
    fontSize: 8,
    color: colors.label,
    marginTop: 2,
  },
  headerRight: {
    alignItems: "flex-end",
  },
  headerMeta: {
    fontSize: 7,
    color: colors.label,
  },
  // Member name
  memberSection: {
    marginBottom: 15,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  memberName: {
    fontSize: 16,
    fontFamily: "Helvetica-Bold",
    color: colors.text,
  },
  memberStatus: {
    fontSize: 8,
    color: colors.label,
    marginTop: 3,
  },
  // Section
  section: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: colors.dark,
    marginBottom: 8,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  // Info rows - clean table-like layout
  infoTable: {
    borderWidth: 1,
    borderColor: colors.border,
  },
  infoRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  infoRowLast: {
    borderBottomWidth: 0,
  },
  infoLabel: {
    width: 100,
    paddingVertical: 5,
    paddingHorizontal: 8,
    backgroundColor: colors.lightBg,
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: colors.label,
  },
  infoValue: {
    flex: 1,
    paddingVertical: 5,
    paddingHorizontal: 8,
    fontSize: 8,
    color: colors.text,
    borderLeftWidth: 1,
    borderLeftColor: colors.border,
  },
  // Family table
  familyTable: {
    borderWidth: 1,
    borderColor: colors.border,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: colors.lightBg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tableHeaderCell: {
    flex: 1,
    paddingVertical: 5,
    paddingHorizontal: 8,
    fontSize: 7,
    fontFamily: "Helvetica-Bold",
    color: colors.text,
    borderRightWidth: 1,
    borderRightColor: colors.border,
  },
  tableHeaderCellLast: {
    borderRightWidth: 0,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tableRowLast: {
    borderBottomWidth: 0,
  },
  tableCell: {
    flex: 1,
    paddingVertical: 4,
    paddingHorizontal: 8,
    fontSize: 7,
    color: colors.text,
    borderRightWidth: 1,
    borderRightColor: colors.border,
  },
  tableCellLast: {
    borderRightWidth: 0,
  },
  // Two column layout
  columns: {
    flexDirection: "row",
    gap: 15,
  },
  column: {
    flex: 1,
  },
  // Footer
  footer: {
    position: "absolute",
    bottom: 20,
    left: 30,
    right: 30,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 8,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  footerText: {
    fontSize: 6,
    color: colors.label,
  },
});

// Helpers
const formatDate = (dateString) => {
  if (!dateString) return "—";
  try {
    return new Date(dateString).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  } catch {
    return "—";
  }
};

const calculateAge = (dob) => {
  if (!dob) return null;
  const today = new Date();
  const birth = new Date(dob);
  let age = today.getFullYear() - birth.getFullYear();
  if (today.getMonth() < birth.getMonth() || (today.getMonth() === birth.getMonth() && today.getDate() < birth.getDate())) age--;
  return age;
};

const yesNo = (val) => val === true ? "Yes" : val === false ? "No" : "—";
const titleCase = (str) => str ? str.charAt(0).toUpperCase() + str.slice(1) : "—";

// Info Row Component
const InfoRow = ({ label, value, isLast }) => (
  <View style={[styles.infoRow, isLast && styles.infoRowLast]}>
    <Text style={styles.infoLabel}>{label}</Text>
    <Text style={styles.infoValue}>{value || "—"}</Text>
  </View>
);

// Section with table-style content
const Section = ({ title, children }) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>{title}</Text>
    <View style={styles.infoTable}>{children}</View>
  </View>
);

// Main PDF
const MemberProfilePDF = ({ member }) => {
  const age = calculateAge(member.date_of_birth);
  const fullName = member.full_name || `${member.first_name} ${member.last_name}`;

  const hasEducation = member.elementary_school || member.secondary_school || member.college;
  const hasFamily = member.family_members && member.family_members.length > 0;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Image src={churchLogo} style={styles.logo} />
          <View style={styles.headerText}>
            <Text style={styles.churchName}>SANTA CRUZ BIBLE CHRISTIAN CHURCH</Text>
            <Text style={styles.documentTitle}>Member Profile Report</Text>
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.headerMeta}>Generated: {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</Text>
            <Text style={styles.headerMeta}>Member ID: {member.id}</Text>
          </View>
        </View>

        {/* Member Name */}
        <View style={styles.memberSection}>
          <Text style={styles.memberName}>{fullName}</Text>
          <Text style={styles.memberStatus}>
            Status: {titleCase(member.status || "active")} • Member since {formatDate(member.membership_date)}
          </Text>
        </View>

        {/* Two Column Layout */}
        <View style={styles.columns}>
          {/* Left Column */}
          <View style={styles.column}>
            <Section title="Contact Information">
              <InfoRow label="Email" value={member.email} />
              <InfoRow label="Phone" value={member.phone} />
              <InfoRow label="Address" value={member.complete_address} isLast />
            </Section>

            <Section title="Personal Information">
              <InfoRow label="Gender" value={titleCase(member.gender)} />
              <InfoRow label="Date of Birth" value={member.date_of_birth ? `${formatDate(member.date_of_birth)} (${age} years)` : "—"} />
              <InfoRow label="Marital Status" value={titleCase(member.marital_status)} />
              <InfoRow label="Anniversary" value={member.wedding_anniversary ? formatDate(member.wedding_anniversary) : "—"} />
              <InfoRow label="Occupation" value={member.occupation} isLast />
            </Section>

            <Section title="Church Membership">
              <InfoRow label="Ministry" value={member.ministry_name || "Member"} />
              <InfoRow label="Attending Since" value={formatDate(member.began_attending_since)} />
              <InfoRow label="Previous Church" value={member.previous_church} />
              <InfoRow label="How Introduced" value={member.how_introduced ? member.how_introduced.replace(/_/g, " ") : "—"} isLast />
            </Section>
          </View>

          {/* Right Column */}
          <View style={styles.column}>
            <Section title="Spiritual Information">
              <InfoRow label="Accepted Christ" value={yesNo(member.accepted_jesus)} />
              <InfoRow label="Spiritual Birthday" value={formatDate(member.spiritual_birthday)} />
              <InfoRow label="Baptism Date" value={formatDate(member.baptism_date)} />
              <InfoRow label="Willing to Baptize" value={yesNo(member.willing_to_be_baptized)} isLast />
            </Section>

            <Section title="Educational Background">
              {hasEducation ? (
                <>
                  <InfoRow label="Elementary" value={member.elementary_school ? `${member.elementary_school}${member.elementary_year_graduated ? ` (${member.elementary_year_graduated})` : ""}` : "—"} />
                  <InfoRow label="High School" value={member.secondary_school ? `${member.secondary_school}${member.secondary_year_graduated ? ` (${member.secondary_year_graduated})` : ""}` : "—"} />
                  <InfoRow label="College" value={member.college ? `${member.college}${member.college_year_graduated ? ` (${member.college_year_graduated})` : ""}` : "—"} isLast />
                </>
              ) : (
                <InfoRow label="Education" value="No data provided" isLast />
              )}
            </Section>

            <Section title="Attendance Record">
              <InfoRow label="Attendance Rate" value={member.attendance_rate ? `${parseFloat(member.attendance_rate).toFixed(1)}%` : "0%"} />
              <InfoRow label="Last Attended" value={member.last_attended ? formatDate(member.last_attended) : "Never"} />
              <InfoRow label="Consec. Absences" value={String(member.consecutive_absences || 0)} isLast />
            </Section>

            {/* Family Members */}
            {hasFamily && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Family Members</Text>
                <View style={styles.familyTable}>
                  <View style={styles.tableHeader}>
                    <Text style={styles.tableHeaderCell}>Name</Text>
                    <Text style={styles.tableHeaderCell}>Relationship</Text>
                    <Text style={[styles.tableHeaderCell, styles.tableHeaderCellLast]}>Birthday</Text>
                  </View>
                  {member.family_members.slice(0, 5).map((fam, i, arr) => (
                    <View key={i} style={[styles.tableRow, i === arr.length - 1 && styles.tableRowLast]}>
                      <Text style={styles.tableCell}>{fam.name || "—"}</Text>
                      <Text style={styles.tableCell}>{titleCase(fam.relationship)}</Text>
                      <Text style={[styles.tableCell, styles.tableCellLast]}>{fam.birthdate ? formatDate(fam.birthdate) : "—"}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>CONFIDENTIAL — For internal use only</Text>
          <Text style={styles.footerText}>Santa Cruz Bible Christian Church Management System</Text>
        </View>
      </Page>
    </Document>
  );
};

export default MemberProfilePDF;
