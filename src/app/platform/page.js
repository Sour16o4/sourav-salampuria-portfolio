import ChapterArticle from '@/components/ChapterArticle';
import doc from '@/content/platform.json';

export const metadata = {
  title: doc.title,
  description: doc.summary,
  alternates: { canonical: '/platform' },
};

export default function PlatformPage() {
  return <ChapterArticle doc={doc} />;
}
