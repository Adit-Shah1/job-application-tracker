import { Card, CardContent } from "@/components/ui/card";

export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="skeleton h-8 w-40 rounded-md" />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
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
          <CardContent className="space-y-3 p-6">
            <div className="skeleton h-4 w-40 rounded" />
            <div className="skeleton h-4 w-64 rounded" />
            <div className="skeleton mt-6 h-48 w-full rounded-md" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="space-y-3 p-6">
            <div className="skeleton h-4 w-32 rounded" />
            <div className="skeleton h-3 w-48 rounded" />
            <div className="mt-4 space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="skeleton h-12 w-full rounded-md" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
