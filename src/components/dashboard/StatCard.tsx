import { Card, CardContent } from "@/components/ui/card";

interface StatCardProps {
  label: string;
  value: string;
  logo: string;
}

export default function StatCard({ label, value, logo }: StatCardProps) {
  return (
    <Card className="gap-0 border-none bg-[#F2F2F3] py-0 shadow-none ring-0">
      <CardContent className="flex flex-col items-start gap-1 px-4 py-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={logo}
          alt={label}
          width={32}
          height={32}
          className="h-8 w-8 object-contain"
        />
        <p className="text-base font-bold text-gray-900">{value}</p>
        <p className="text-xs text-gray-500">{label}</p>
      </CardContent>
    </Card>
  );
}
