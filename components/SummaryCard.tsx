type SummaryCardProps = {
  title: string;
  value: string | number;
};

export default function SummaryCard({ title, value }: SummaryCardProps) {
  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
      <p className="text-sm text-slate-500">{title}</p>
      <h3 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
        {value}
      </h3>
    </div>
  );
}