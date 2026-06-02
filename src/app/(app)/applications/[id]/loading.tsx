import { Card, CardContent } from "@/components/ui/card";

export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="skeleton h-4 w-32 rounded" />
        <div className="skeleton h-7 w-64 rounded" />
        <div className="skeleton h-4 w-48 rounded" />
        <div className="flex gap-2 pt-1">
          <div className="skeleton h-9 w-36 rounded-md" />
          <div className="skeleton h-5 w-20 rounded" />
          <div className="skeleton h-5 w-20 rounded" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-1">
          <Card>
            <CardContent className="space-y-3 p-6">
              <div className="skeleton h-4 w-20 rounded" />
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="skeleton h-3 w-3 rounded" />
                  <div className="skeleton h-3 flex-1 rounded" />
                </div>
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardContent className="space-y-3 p-6">
              <div className="skeleton h-4 w-24 rounded" />
              <div className="skeleton h-9 w-full rounded-md" />
              <div className="skeleton h-12 w-full rounded-md" />
              <div className="skeleton h-12 w-full rounded-md" />
            </CardContent>
          </Card>
        </div>
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardContent className="space-y-3 p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="skeleton h-4 w-16 rounded" />
                  <div className="skeleton h-3 w-48 rounded" />
                </div>
                <div className="skeleton h-8 w-32 rounded-md" />
              </div>
              <div className="skeleton mt-4 h-24 w-full rounded-md" />
              <div className="flex justify-end">
                <div className="skeleton h-8 w-24 rounded-md" />
              </div>
              <div className="space-y-2 pt-4">
                {Array.from({ length: 2 }).map((_, i) => (
                  <div key={i} className="skeleton h-16 w-full rounded-md" />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
