import DashboardHeader from "@/components/dashboard/DashboardHeader";
import DashboardToolbar from "@/components/dashboard/DashboardToolbar";
import StatCard from "@/components/dashboard/StatCard";
import { DASHBOARD_STATS } from "@/lib/navigation";

export default function DashboardContent() {
  return (
    <>
      <DashboardHeader title="Dashboard" />
      <DashboardToolbar />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-5">
        {DASHBOARD_STATS.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>
    </>
  );
}
