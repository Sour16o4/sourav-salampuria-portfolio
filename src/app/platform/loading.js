import ChapterSkeleton from '@/components/ChapterSkeleton';
import doc from '@/content/platform.json';

export default function Loading() {
  return <ChapterSkeleton doc={doc} />;
}
