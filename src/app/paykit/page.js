import ChapterArticle from '@/components/ChapterArticle';
import doc from '@/content/paykit.json';

export const metadata = {
  title: doc.title,
  description: doc.summary,
  alternates: { canonical: '/paykit' },
};

export default function PaykitPage() {
  return <ChapterArticle doc={doc} />;
}
