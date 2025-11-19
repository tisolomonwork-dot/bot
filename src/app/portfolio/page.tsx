import { ExchangeSplit } from "@/components/portfolio/exchange-split";
import { AssetTable } from "@/components/portfolio/asset-table";

export default function PortfolioPage() {
  return (
    <div className="grid gap-4 md:gap-8">
      <ExchangeSplit />
      <AssetTable />
    </div>
  );
}
