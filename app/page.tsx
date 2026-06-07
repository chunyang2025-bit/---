import DouplayDemo from '@/components/douplay-demo';
import { snapshot } from '@/lib/server-store';

export const dynamic = 'force-dynamic';

export default function HomePage() {
  return <DouplayDemo initialState={snapshot()} />;
}
