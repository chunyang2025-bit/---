import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { snapshot } from '@/lib/server-store';
import ShareExperience from '@/components/share-experience';

export const dynamic = 'force-dynamic';

type SharePageProps = {
  params: Promise<{
    gameId: string;
  }>;
};

export async function generateMetadata({ params }: SharePageProps): Promise<Metadata> {
  const { gameId } = await params;
  const game = snapshot().games.find((item) => item.id === gameId);

  if (!game) {
    return {
      title: 'Douplay 分享'
    };
  }

  return {
    title: `${game.title} | Douplay`,
    description: game.description,
    openGraph: {
      title: `${game.title} | Douplay`,
      description: game.description,
      type: 'website'
    }
  };
}

export default async function SharePage({ params }: SharePageProps) {
  const { gameId } = await params;
  const game = snapshot().games.find((item) => item.id === gameId);

  if (!game) {
    notFound();
  }

  return <ShareExperience game={game} />;
}
