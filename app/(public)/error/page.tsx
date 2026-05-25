import {ErrorPage} from '@/components/shared/ErrorPage';

type SearchParams = {
  error?: string;
};

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;

  return (
    <ErrorPage
      code="400"
      description={params.error ?? 'Došlo k neočekávané chybě'}
    />
  );
}
