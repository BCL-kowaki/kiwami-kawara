import NegTelForm from "./NegTelForm";

export default async function NegTelPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  return <NegTelForm urlToken={token} />;
}
