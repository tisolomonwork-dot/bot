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
import { getOpenOrders, getPositions } from "@/lib/services/bybit-service";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

async function PositionsTable() {
  const positions = await getPositions();
  
  if (!positions || positions.length === 0) {
    return <p className="text-sm text-muted-foreground">No open positions.</p>
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Symbol</TableHead>
          <TableHead>Side</TableHead>
          <TableHead className="text-right">Size</TableHead>
          <TableHead className="text-right">Entry Price</TableHead>
          <TableHead className="text-right">PNL (unrealized)</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {positions.map((pos: any) => (
          <TableRow key={pos.symbol + pos.positionIdx}>
            <TableCell className="font-medium">{pos.symbol}</TableCell>
            <TableCell>
                <Badge variant={pos.side === 'Buy' ? 'default' : 'destructive'} className={cn(pos.side === 'Buy' ? 'bg-positive hover:bg-positive/80' : 'bg-negative hover:bg-negative/80')}>
                    {pos.side}
                </Badge>
            </TableCell>
            <TableCell className="text-right">{pos.size}</TableCell>
            <TableCell className="text-right">
              {parseFloat(pos.avgPrice).toLocaleString("en-US", {
                style: "currency",
                currency: "USD",
              })}
            </TableCell>
            <TableCell
              className={cn(
                "text-right font-medium",
                parseFloat(pos.unrealisedPnl) >= 0 ? "text-positive" : "text-negative"
              )}
            >
              {parseFloat(pos.unrealisedPnl).toLocaleString("en-US", {
                style: "currency",
                currency: "USD",
              })}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

async function OrdersTable() {
    const openOrders = await getOpenOrders();
    if (!openOrders || openOrders.length === 0) {
        return <p className="text-sm text-muted-foreground">No open orders.</p>
    }
    return (
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
            {openOrders.map((order : any) => (
                <TableRow key={order.orderId}>
                <TableCell className="font-medium">{order.symbol}</TableCell>
                    <TableCell>
                    <Badge variant={order.side === 'Buy' ? 'default' : 'destructive'} className={cn(order.side === 'Buy' ? 'bg-positive hover:bg-positive/80' : 'bg-negative hover:bg-negative/80')}>
                        {order.side}
                    </Badge>
                </TableCell>
                <TableCell>{order.orderType}</TableCell>
                <TableCell className="text-right">
                    {parseFloat(order.price).toLocaleString("en-US", {
                    style: "currency",
                    currency: "USD",
                    })}
                </TableCell>
                <TableCell className="text-right">
                    <Badge variant="outline">{order.orderStatus}</Badge>
                </TableCell>
                </TableRow>
            ))}
            </TableBody>
        </Table>
    )
}

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
            <PositionsTable />
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
            <OrdersTable />
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
