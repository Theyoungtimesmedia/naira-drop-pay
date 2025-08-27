import { useState, useEffect } from 'react';
import { Lock, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import Layout from '@/components/Layout';

interface Plan {
  id: string;
  name: string;
  deposit_usd: number;
  payout_per_drop_usd: number;
  drops_count: number;
  total_return_usd: number;
  is_locked: boolean;
  sort_order: number;
}

const Plans = () => {
  const navigate = useNavigate();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    try {
      const { data, error } = await supabase
        .from('plans')
        .select('*')
        .order('sort_order', { ascending: true });

      if (error) throw error;
      setPlans(data || []);
    } catch (error) {
      console.error('Error loading plans:', error);
      toast.error('Failed to load investment plans');
    } finally {
      setLoading(false);
    }
  };

  const formatUSD = (cents: number) => `$${(cents / 100).toFixed(0)}`;
  const formatDecimal = (cents: number) => `$${(cents / 100).toFixed(2)}`;

  const getReturnPercentage = (deposit: number, totalReturn: number) => {
    return Math.round(((totalReturn - deposit) / deposit) * 100);
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div>Loading plans...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-background">
        <div className="p-6 pt-12">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Investment Plans</h1>
            <p className="text-muted-foreground">
              Choose a plan and start earning daily returns on your investment
            </p>
          </div>

          <div className="grid gap-6">
            {plans.map((plan) => {
              const returnPercentage = getReturnPercentage(plan.deposit_usd, plan.total_return_usd);
              
              return (
                <Card key={plan.id} className="relative overflow-hidden shadow-card hover:shadow-hover transition-all duration-200">
                  {plan.is_locked && (
                    <div className="absolute top-4 right-4">
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <Lock className="h-3 w-3" />
                        Locked
                      </Badge>
                    </div>
                  )}
                  
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-xl font-bold">{plan.name}</CardTitle>
                        <Badge variant="outline" className="mt-2">
                          +{returnPercentage}% Return
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Deposit Amount</p>
                        <p className="text-2xl font-bold text-primary">
                          {formatUSD(plan.deposit_usd)}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Total Return</p>
                        <p className="text-2xl font-bold text-secondary">
                          {formatUSD(plan.total_return_usd)}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-2 border-t">
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Per Drop</p>
                        <p className="text-lg font-semibold">
                          {formatDecimal(plan.payout_per_drop_usd)}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Total Drops</p>
                        <p className="text-lg font-semibold">
                          {plan.drops_count} times
                        </p>
                      </div>
                    </div>

                    <div className="pt-4">
                      <Button
                        className="w-full"
                        variant={plan.is_locked ? "outline" : "primary_gradient"}
                        disabled={plan.is_locked}
                        onClick={() => navigate(`/deposit?plan=${plan.id}`)}
                      >
                        {plan.is_locked ? (
                          <>
                            <Lock className="mr-2 h-4 w-4" />
                            Coming Soon
                          </>
                        ) : (
                          <>
                            <TrendingUp className="mr-2 h-4 w-4" />
                            Invest Now
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="mt-8 p-6 bg-muted/50 rounded-lg">
            <h3 className="font-semibold mb-2">How it works:</h3>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>• Choose an investment plan that suits your budget</li>
              <li>• Receive daily returns every 22 hours automatically</li>
              <li>• Withdraw your earnings anytime (minimum $2)</li>
              <li>• Refer friends and earn 20% bonus on their deposits</li>
            </ul>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Plans;