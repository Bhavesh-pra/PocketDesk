import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="space-y-10">

      <h1 className="text-2xl font-semibold text-neutral-100">
        Workspace
      </h1>

      <div className="grid grid-cols-2 gap-8">

        <FeatureCard title="PDFs" onClick={() => navigate("/pdfs")} />
        <FeatureCard title="Images" onClick={() => navigate("/images")} />
        <FeatureCard title="Videos" onClick={() => navigate("/videos")} />
        <FeatureCard title="To-Do" onClick={() => navigate("/todo")} />

      </div>
    </div>
  );
}

function FeatureCard({
  title,
  onClick,
}: {
  title: string;
  onClick?: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className="border border-neutral-700 bg-neutral-900 p-8 hover:border-blue-500 transition cursor-pointer"
    >
      <div className="text-lg text-neutral-200">
        {title}
      </div>
    </div>
  );
}