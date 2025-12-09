import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Preview,
} from "@react-email/components";
import { EmailHeader } from "./email-header";
import { EmailFooter } from "./email-footer";

interface CourseUpdateEmailProps {
  subject: string;
  content: string;
  htmlContent?: string;
  unsubscribeUrl?: string;
}

export function CourseUpdateEmail({
  subject,
  content,
  htmlContent,
  unsubscribeUrl,
}: CourseUpdateEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>{subject}</Preview>
      <Body style={main}>
        <Container style={container}>
          <EmailHeader />

          {/* Main Content */}
          <Section style={content_section}>
            <Text style={heading}>{subject}</Text>
            {htmlContent ? (
              <div
                dangerouslySetInnerHTML={{ __html: htmlContent }}
                style={markdownContent}
              />
            ) : (
              <Text style={paragraph}>{content}</Text>
            )}
          </Section>

          <EmailFooter
            unsubscribeUrl={unsubscribeUrl}
            footerMessage="You're receiving this email because you're enrolled in our course."
          />
        </Container>
      </Body>
    </Html>
  );
}

const main = {
  backgroundColor: "#f6f9fc",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};

const container = {
  margin: "0 auto",
  padding: "20px 0 48px",
  width: "580px",
  maxWidth: "100%",
};

const content_section = {
  padding: "24px",
  backgroundColor: "#ffffff",
  borderRadius: "8px",
  border: "1px solid #e1e8ed",
  marginBottom: "24px",
};

const heading = {
  fontSize: "24px",
  fontWeight: "600",
  color: "#1a1a1a",
  marginBottom: "16px",
  lineHeight: "1.3",
};

const paragraph = {
  fontSize: "16px",
  lineHeight: "1.6",
  color: "#374151",
  whiteSpace: "pre-wrap" as const,
  margin: "0",
};

const markdownContent = {
  fontSize: "16px",
  lineHeight: "1.6",
  color: "#374151",
  margin: "0",
  "& h1": {
    fontSize: "24px",
    fontWeight: "600",
    marginTop: "24px",
    marginBottom: "16px",
  },
  "& h2": {
    fontSize: "20px",
    fontWeight: "600",
    marginTop: "20px",
    marginBottom: "12px",
  },
  "& h3": {
    fontSize: "18px",
    fontWeight: "600",
    marginTop: "16px",
    marginBottom: "8px",
  },
  "& p": {
    marginBottom: "16px",
  },
  "& ul, & ol": {
    marginBottom: "16px",
    paddingLeft: "24px",
  },
  "& li": {
    marginBottom: "4px",
  },
  "& code": {
    backgroundColor: "#f3f4f6",
    padding: "2px 4px",
    borderRadius: "4px",
    fontSize: "14px",
    fontFamily: "monospace",
  },
  "& pre": {
    backgroundColor: "#f3f4f6",
    padding: "12px",
    borderRadius: "6px",
    overflow: "auto",
    marginBottom: "16px",
  },
  "& blockquote": {
    borderLeft: "4px solid #e5e7eb",
    paddingLeft: "16px",
    marginBottom: "16px",
    fontStyle: "italic",
    color: "#6b7280",
  },
  "& a": {
    color: "#3b82f6",
    textDecoration: "underline",
  },
  "& strong": {
    fontWeight: "600",
  },
  "& em": {
    fontStyle: "italic",
  },
  "& hr": {
    borderTop: "1px solid #e5e7eb",
    marginTop: "24px",
    marginBottom: "24px",
  },
};
