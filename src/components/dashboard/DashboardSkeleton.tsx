import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function DashboardSkeleton() {
  return (
    <>
      <div className="stagger grid grid-cols-2 gap-3 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="space-y-3 p-4">
              <div className="skeleton h-3 w-16 rounded" />
              <div className="skeleton h-7 w-12 rounded" />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Applications by status</CardTitle>
            <CardDescription>Where your pipeline stands right now.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex h-64 items-end gap-3 px-2">
              {[60, 90, 45, 75, 40, 55].map((h, i) => (
                <div
                  key={i}
                  className="skeleton h-full w-full rounded-md"
                  style={{ height: `${h}%` }}
                />
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Upcoming reminders</CardTitle>
            <CardDescription>Next 14 days, ordered by date.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="skeleton h-12 w-full rounded-md" />
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div className="space-y-1">
            <CardTitle>Recently updated</CardTitle>
            <CardDescription>Your most recent activity.</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="skeleton h-4 w-48 rounded" />
              <div className="skeleton h-5 w-20 rounded" />
            </div>
          ))}
        </CardContent>
      </Card>
    </>
  );
}
