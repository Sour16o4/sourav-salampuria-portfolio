import ChapterArticle from '@/components/ChapterArticle';
import doc from '@/content/skillsight.json';

export const metadata = {
  title: doc.title,
  description: doc.summary,
  alternates: { canonical: '/skillsight' },
};

export default function SkillsightPage() {
  return <ChapterArticle doc={doc} />;
}
