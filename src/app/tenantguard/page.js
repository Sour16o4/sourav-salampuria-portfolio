import ChapterArticle from '@/components/ChapterArticle';
import doc from '@/content/tenantguard.json';

export const metadata = {
  title: doc.title,
  description: doc.summary,
  alternates: { canonical: '/tenantguard' },
};

export default function TenantguardPage() {
  return <ChapterArticle doc={doc} />;
}
