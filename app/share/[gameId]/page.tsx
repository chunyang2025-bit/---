import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { seedGames } from '@/lib/demo-data';
import ShareExperience from '@/components/share-experience';

type SharePageProps = {
  params: Promise<{
    gameId: string;
  }>;
};

export async function generateMetadata({ params }: SharePageProps): Promise<Metadata> {
  const { gameId } = await params;
  const game = seedGames.find((item) => item.id === gameId);

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
  const game = seedGames.find((item) => item.id === gameId);

  if (!game) {
    notFound();
  }

  return <ShareExperience game={game} />;
}
