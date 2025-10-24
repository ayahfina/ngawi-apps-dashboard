import { DashboardCards } from "@/components/dashboard-cards"
import { DashboardCharts } from "@/components/dashboard-charts"
import { RecentApplications } from "@/components/recent-applications"

export default async function Page() {
  return (
    <div className="@container/main flex flex-1 flex-col gap-2">
      <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
        <DashboardCards />
        <div className="px-4 lg:px-6">
          <DashboardCharts />
        </div>
        <div className="px-4 lg:px-6">
          <RecentApplications />
        </div>
      </div>
    </div>
  )
}