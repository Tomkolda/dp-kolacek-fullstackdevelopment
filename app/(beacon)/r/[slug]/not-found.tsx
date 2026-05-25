import {ErrorPage} from '@/components/shared/ErrorPage';

export default function BeaconNotFound() {
  return (
    <ErrorPage
      code="404"
      title="Stránka nebyla nalezena"
      description="Release s tímto odkazem neexistuje nebo byla odstraněna."
      buttonText="Zpět na hlavní stránku"
      buttonLink="/"
    />
  );
}
