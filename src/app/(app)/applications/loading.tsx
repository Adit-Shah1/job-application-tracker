import { Card, CardContent } from "@/components/ui/card";

export default function ApplicationsLoading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="skeleton h-7 w-40 rounded" />
          <div className="skeleton h-3 w-24 rounded" />
        </div>
        <div className="skeleton h-9 w-36 rounded-md" />
      </div>
      <div className="skeleton h-10 w-full rounded-md" />
      <Card>
        <CardContent className="space-y-2 p-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="skeleton h-12 w-full rounded-md" />
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
