import { usePOSContext } from '@/contexts/POSContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, TrendingUp, TrendingDown, DollarSign, ShoppingCart, Package, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';

export const Analytics = () => {
  const navigate = useNavigate();
  const { receipts, products, formatPrice } = usePOSContext();

  // Calculate statistics
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = subDays(new Date(), 6 - i);
    const dayReceipts = receipts.filter(r => {
      const receiptDate = new Date(r.timestamp);
      return receiptDate >= startOfDay(date) && receiptDate <= endOfDay(date);
    });
    
    return {
      date: format(date, 'EEE'),
      fullDate: format(date, 'dd MMM'),
      sales: dayReceipts.reduce((sum, r) => sum + r.total, 0),
      transactions: dayReceipts.length,
    };
  });

  const totalSales = receipts.reduce((sum, r) => sum + r.total, 0);
  const totalTransactions = receipts.length;
  const avgTransaction = totalTransactions > 0 ? totalSales / totalTransactions : 0;
  
  const yesterday = receipts.filter(r => {
    const receiptDate = new Date(r.timestamp);
    const yesterdayDate = subDays(new Date(), 1);
    return receiptDate >= startOfDay(yesterdayDate) && receiptDate <= endOfDay(yesterdayDate);
  });
  const yesterdaySales = yesterday.reduce((sum, r) => sum + r.total, 0);
  const todayReceipts = receipts.filter(r => {
    const receiptDate = new Date(r.timestamp);
    const today = new Date();
    return receiptDate >= startOfDay(today) && receiptDate <= endOfDay(today);
  });
  const todaySales = todayReceipts.reduce((sum, r) => sum + r.total, 0);
  const salesGrowth = yesterdaySales > 0 ? ((todaySales - yesterdaySales) / yesterdaySales) * 100 : 0;

  // Top products
  const productSales = receipts.flatMap(r => r.items).reduce((acc, item) => {
    const existing = acc.find(p => p.name === item.product.name);
    if (existing) {
      existing.quantity += item.quantity;
      existing.revenue += (item.finalPrice || item.product.sellPrice) * item.quantity;
    } else {
      acc.push({
        name: item.product.name,
        quantity: item.quantity,
        revenue: (item.finalPrice || item.product.sellPrice) * item.quantity,
      });
    }
    return acc;
  }, [] as Array<{ name: string; quantity: number; revenue: number }>);

  const topProducts = productSales.sort((a, b) => b.revenue - a.revenue).slice(0, 5);

  // Payment methods
  const paymentMethods = receipts.reduce((acc, r) => {
    const method = r.paymentMethod || 'Tunai';
    const existing = acc.find(p => p.name === method);
    if (existing) {
      existing.value += r.total;
    } else {
      acc.push({ name: method, value: r.total });
    }
    return acc;
  }, [] as Array<{ name: string; value: number }>);

  const COLORS = ['hsl(217, 91%, 60%)', 'hsl(142, 76%, 36%)', 'hsl(38, 92%, 50%)', 'hsl(0, 84%, 60%)', 'hsl(280, 91%, 60%)'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F2F2F7] via-[#FAFAFA] to-[#E5E5EA] p-4 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate('/')}
          className="rounded-full h-10 w-10 bg-white/80 backdrop-blur-sm hover:bg-white shadow-sm"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-semibold text-foreground">Analytics</h1>
        <div className="w-10" />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-sm rounded-2xl overflow-hidden">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-primary" />
              </div>
              {salesGrowth !== 0 && (
                <div className={`flex items-center gap-1 text-xs font-medium ${salesGrowth > 0 ? 'text-success' : 'text-error'}`}>
                  {salesGrowth > 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                  {Math.abs(salesGrowth).toFixed(1)}%
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground mb-1">Total Penjualan</p>
            <p className="text-xl font-bold text-foreground">{formatPrice(totalSales)}</p>
          </CardContent>
        </Card>

        <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-sm rounded-2xl overflow-hidden">
          <CardHeader className="pb-2">
            <div className="h-10 w-10 rounded-full bg-success/10 flex items-center justify-center">
              <ShoppingCart className="h-5 w-5 text-success" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground mb-1">Total Transaksi</p>
            <p className="text-xl font-bold text-foreground">{totalTransactions}</p>
          </CardContent>
        </Card>

        <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-sm rounded-2xl overflow-hidden">
          <CardHeader className="pb-2">
            <div className="h-10 w-10 rounded-full bg-warning/10 flex items-center justify-center">
              <Package className="h-5 w-5 text-warning" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground mb-1">Total Produk</p>
            <p className="text-xl font-bold text-foreground">{products.length}</p>
          </CardContent>
        </Card>

        <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-sm rounded-2xl overflow-hidden">
          <CardHeader className="pb-2">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Users className="h-5 w-5 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground mb-1">Rata-rata Transaksi</p>
            <p className="text-xl font-bold text-foreground">{formatPrice(avgTransaction)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Sales Chart */}
      <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-sm rounded-2xl mb-6">
        <CardHeader>
          <CardTitle className="text-base font-semibold">Penjualan 7 Hari Terakhir</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={last7Days}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="date" 
                stroke="hsl(var(--muted-foreground))" 
                fontSize={12}
              />
              <YAxis 
                stroke="hsl(var(--muted-foreground))" 
                fontSize={12}
                tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '12px',
                  fontSize: '12px',
                }}
                formatter={(value: number) => formatPrice(value)}
              />
              <Line 
                type="monotone" 
                dataKey="sales" 
                stroke="hsl(217, 91%, 60%)" 
                strokeWidth={3}
                dot={{ fill: 'hsl(217, 91%, 60%)', r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Top Products */}
      <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-sm rounded-2xl mb-6">
        <CardHeader>
          <CardTitle className="text-base font-semibold">Top 5 Produk Terlaris</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={topProducts} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                type="number" 
                stroke="hsl(var(--muted-foreground))" 
                fontSize={12}
                tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`}
              />
              <YAxis 
                type="category" 
                dataKey="name" 
                stroke="hsl(var(--muted-foreground))" 
                fontSize={11}
                width={80}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '12px',
                  fontSize: '12px',
                }}
                formatter={(value: number) => formatPrice(value)}
              />
              <Bar dataKey="revenue" fill="hsl(142, 76%, 36%)" radius={[0, 8, 8, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Payment Methods */}
      {paymentMethods.length > 0 && (
        <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-sm rounded-2xl mb-6">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Metode Pembayaran</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={paymentMethods}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={70}
                  fill="hsl(217, 91%, 60%)"
                  dataKey="value"
                >
                  {paymentMethods.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '12px',
                    fontSize: '12px',
                  }}
                  formatter={(value: number) => formatPrice(value)}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
