import ChapterSkeleton from '@/components/ChapterSkeleton';
import doc from '@/content/skillsight.json';

export default function Loading() {
  return <ChapterSkeleton doc={doc} />;
}
