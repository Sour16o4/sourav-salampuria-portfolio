import ChapterSkeleton from '@/components/ChapterSkeleton';
import doc from '@/content/book-api.json';

export default function Loading() {
  return <ChapterSkeleton doc={doc} />;
}
