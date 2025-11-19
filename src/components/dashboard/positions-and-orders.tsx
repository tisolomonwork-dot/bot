import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { positions, openOrders } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export function PositionsAndOrders() {
  return (
    <Tabs defaultValue="positions">
      <div className="flex items-center">
        <TabsList>
          <TabsTrigger value="positions">Positions</TabsTrigger>
          <TabsTrigger value="orders">Open Orders</TabsTrigger>
        </TabsList>
      </div>
      <TabsContent value="positions">
        <Card>
          <CardHeader>
            <CardTitle>Active Positions</CardTitle>
            <CardDescription>
              Your current market entries.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Symbol</TableHead>
                  <TableHead className="text-right">Size</TableHead>
                  <TableHead className="text-right">Entry Price</TableHead>
                  <TableHead className="text-right">PNL</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {positions.map((pos) => (
                  <TableRow key={pos.symbol}>
                    <TableCell className="font-medium">{pos.symbol}</TableCell>
                    <TableCell className="text-right">{pos.size}</TableCell>
                    <TableCell className="text-right">
                      {pos.entryPrice.toLocaleString("en-US", {
                        style: "currency",
                        currency: "USD",
                      })}
                    </TableCell>
                    <TableCell
                      className={cn(
                        "text-right font-medium",
                        pos.pnl >= 0 ? "text-positive" : "text-negative"
                      )}
                    >
                      {pos.pnl.toLocaleString("en-US", {
                        style: "currency",
                        currency: "USD",
                      })} ({pos.pnlPercent.toFixed(2)}%)
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="orders">
        <Card>
          <CardHeader>
            <CardTitle>Open Orders</CardTitle>
            <CardDescription>
              Your pending market orders.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Symbol</TableHead>
                  <TableHead>Side</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead className="text-right">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {openOrders.map((order) => (
                  <TableRow key={order.symbol}>
                    <TableCell className="font-medium">{order.symbol}</TableCell>
                     <TableCell>
                      <Badge variant={order.side === 'Buy' ? 'default' : 'destructive'} className={cn(order.side === 'Buy' ? 'bg-positive hover:bg-positive/80' : 'bg-negative hover:bg-negative/80')}>
                        {order.side}
                      </Badge>
                    </TableCell>
                    <TableCell>{order.type}</TableCell>
                    <TableCell className="text-right">
                      {order.price.toLocaleString("en-US", {
                        style: "currency",
                        currency: "USD",
                      })}
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge variant="outline">{order.status}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
