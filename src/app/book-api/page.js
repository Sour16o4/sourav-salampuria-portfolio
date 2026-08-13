import ChapterArticle from '@/components/ChapterArticle';
import doc from '@/content/book-api.json';

export const metadata = {
  title: doc.title,
  description: doc.summary,
  alternates: { canonical: '/book-api' },
};

export default function BookApiPage() {
  return <ChapterArticle doc={doc} />;
}
