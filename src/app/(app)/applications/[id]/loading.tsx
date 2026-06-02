import { Card, CardContent } from "@/components/ui/card";

export default function DetailLoading() {
  return (
    <div className="space-y-6">
      <div className="skeleton h-6 w-32 rounded" />
      <div className="space-y-2">
        <div className="skeleton h-8 w-64 rounded" />
        <div className="skeleton h-4 w-48 rounded" />
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6">
          <Card>
            <CardContent className="space-y-3 p-6">
              <div className="skeleton h-4 w-20 rounded" />
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="skeleton h-4 w-full rounded" />
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardContent className="space-y-3 p-6">
              <div className="skeleton h-4 w-20 rounded" />
              <div className="skeleton h-16 w-full rounded" />
            </CardContent>
          </Card>
        </div>
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="space-y-3 p-6">
              <div className="skeleton h-5 w-20 rounded" />
              <div className="skeleton h-20 w-full rounded" />
              {Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="skeleton h-12 w-full rounded" />
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
