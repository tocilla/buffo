import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Agent Conversation | Buffo AI',
  description: 'Interactive agent conversation powered by Buffo AI',
  openGraph: {
    title: 'Agent Conversation | Buffo AI',
    description: 'Interactive agent conversation powered by Buffo AI',
    type: 'website',
  },
};

export default function AgentsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
