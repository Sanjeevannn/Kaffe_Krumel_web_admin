import DashboardHeader from "@/components/dashboard/DashboardHeader";

interface PagePlaceholderProps {
  title: string;
  description?: string;
}

export default function PagePlaceholder({
  title,
  description,
}: PagePlaceholderProps) {
  return (
    <>
      <DashboardHeader title={title} />
      <div className="rounded-2xl bg-white p-8 shadow-sm">
        <p className="text-gray-600">
          {description || `${title} page coming soon.`}
        </p>
      </div>
    </>
  );
}
