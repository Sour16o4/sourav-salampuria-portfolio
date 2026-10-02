import ChapterArticle from '@/components/ChapterArticle';
import doc from '@/content/velanthe.json';

export const metadata = {
  title: doc.title,
  description: doc.summary,
  alternates: { canonical: '/velanthe' },
};

export default function VelanthePage() {
  return <ChapterArticle doc={doc} />;
}
