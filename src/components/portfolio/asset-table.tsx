import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { assets } from "@/lib/mock-data";
import { BtcIcon, EthIcon, SolIcon, UsdtIcon, DogeIcon } from "@/components/icons/crypto";
import { cn } from "@/lib/utils";

const iconMap: { [key: string]: React.ReactNode } = {
  BTC: <BtcIcon className="w-6 h-6 text-yellow-500" />,
  ETH: <EthIcon className="w-6 h-6 text-gray-500" />,
  SOL: <SolIcon className="w-6 h-6 text-purple-500" />,
  USDT: <UsdtIcon className="w-6 h-6 text-green-500" />,
  DOGE: <DogeIcon className="w-6 h-6 text-yellow-600" />,
};

export function AssetTable() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Asset Holdings</CardTitle>
        <CardDescription>A detailed list of all your assets across exchanges.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Asset</TableHead>
              <TableHead>Exchange</TableHead>
              <TableHead className="text-right">Balance</TableHead>
              <TableHead className="text-right">Value</TableHead>
              <TableHead className="text-right">% of Portfolio</TableHead>
              <TableHead className="text-right">24h Change</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {assets.map((asset) => (
              <TableRow key={asset.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    {iconMap[asset.symbol]}
                    <div>
                      <p className="font-medium">{asset.name}</p>
                      <p className="text-sm text-muted-foreground">{asset.symbol}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>{asset.exchange}</TableCell>
                <TableCell className="text-right">{asset.balance.toLocaleString()}</TableCell>
                <TableCell className="text-right font-medium">
                  {asset.value.toLocaleString("en-US", { style: "currency", currency: "USD" })}
                </TableCell>
                <TableCell className="text-right">{asset.allocation}%</TableCell>
                <TableCell className={cn("text-right font-medium", asset.change >= 0 ? "text-positive" : "text-negative")}>
                  {asset.change.toFixed(2)}%
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
